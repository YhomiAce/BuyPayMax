// package imports
const Sequelize = require("sequelize");
const CoinqvestClient = require('coinqvest-merchant-sdk');

// local imports
const parameters = require("../config/params");
const Users = require("../models").User;
const Deposits = require("../models").Deposit;
const Transactions = require("../models").Transaction;
const CryptoPayment = require("../models").CyptoPayment;

const helpers = require("../helpers/cryptedge_helpers");
// imports initialization
const Op = Sequelize.Op;

const client = new CoinqvestClient(
    '728633af516b',
    'TgVR-9$$C-n*PP-MbQg-q4@!-FutU'
);

exports.createCustomer = async (req, res) =>{
    try {
        client.post('/customer',
            {
                customer:{
                    email: 'john@doe.com',
                    firstname: 'John',
                    lastname: 'Doe',
                    company: 'ACME Inc.',
                    adr1: '810 Beach St',
                    adr2: 'Finance Department',
                    zip: 'CA 94133',
                    city: 'San Francisco',
                    countrycode: 'US'
                }
            },
            function (response) {

                console.log(response.status);
                console.log(response.data);

                if (response.status !== 200) {
                    // something went wrong, let's abort and debug by looking at our log file
                    console.log('Could not create customer. Inspect above log entry.');
                    return;
                }

                let customerId = response.data['customerId']; // store this persistently in your database
                return res.send({customerId})
            }
        );
    } catch (error) {
        return res.send({error})
    }
}

exports.createCheckout = (req, res, next) => {

    let amount = req.body.amount;
    Users.findOne({
        where: {
            id: {
                [Op.eq]: req.session.userId
            }
        }
    })
    .then(user => {
        if(user) {
            client.post('/customer', {
                customer: {
                    email: user.email,
                    firstname: user.name,
                    countrycode: 'NG'
                }
            },
            function (response) {
                if (response.status !== 200) {
                    // something went wrong, let's abort and debug by looking at our log file
                    res.status(response.status).json({
                        status: false,
                        message: "Error creating checkout, try again!"
                    });
                }
                let customerId = response.data['customerId']; // store this persistently in your database
                client.post('/checkout/hosted', {
                        charge: {
                            customerId: customerId, // associates this charge with a customer
                            currency: 'NGN', // specifies the billing currency
                            lineItems: [{ // a list of line items included in this charge
                                description: 'CYPTEDGE WALLET FUNDING',
                                netAmount: amount,
                                //quantity: 1
                            }],
                        },
                        webhook:"https://www.merchant.com/path/for/webhook",
                        settlementCurrency: 'NGN' // specifies in which currency you want to settle
                    },
                    function (checkoutResponse) {
    
                        //console.log(checkoutResponse.status);
                        //console.log(checkoutResponse.data);
    
                        if (checkoutResponse.status !== 200) {
                            // something went wrong, let's abort and debug by looking at our log file
                            res.status(500).json({
                                status: false,
                                message: "Error creating checkout, try again!"
                            });
                        }
    
                        // the checkout was created
                        // response.data now contains an object as specified in the success response here: https://www.coinqvest.com/en/api-docs#post-checkout
                        let checkoutId = checkoutResponse.data['id']; // store this persistently in your database
                        let url = checkoutResponse.data['url']; // redirect your customer to this URL to complete the payment
                        // add the transaction to the table with the following details,
                        // id, userId, customerId, checkoutId, url, amount, etc, 
                        CryptoPayment.create({
                            user_id: req.session.userId,
                            amount: amount,
                            customerId: customerId,
                            checkoutId: checkoutId,
                            url: url,
                            status: "NEW"
                        })
                        .then(cryptoPayment => {
                            //{"webhook":"https://www.merchant.com/path/for/webhook","settlementCurrency":"NGN"}
                            let configData = JSON.parse(checkoutResponse.config.data);
                            let webhookUrl = helpers.getNestedValues(configData, 'webhook');
                            console.log(webhookUrl);
                            res.status(200).json({
                                status: true,
                                message: "Checkout created!",
                                //data: checkoutResponse.data
                                url: url
                            });
                        })
                        .catch(error => {
                            res.status(500).json({
                                status: false,
                                message: "something went wrong!"
                            });
                        });
                    }
                );
            }
        );
        } else {
            res.status(500).json({
                status: false,
                message: "User not found!"
            });    
        }
    })
    .catch(error => {
        res.status(500).json({
            status: false,
            message: "Something went wrong!"
        });
    });
}

exports.myWebhook = (req, res, next) => {
    // get event type 
    let eventType = req.body.eventType;
    let data = req.body.data;

    switch(eventType) {
        case('CHECKOUT_COMPLETED'):
        // do something when a checkout was successfully completed
        // get the checkoutId
        
        // let checkoutId = data.checkout.id;
        // CryptoPayment.findOne()
        // .then()
        // .catch(error );
        
        break;
    case('CHECKOUT_UNDERPAID'):
        // do something when a checkout was underpaid
        break;
    case('UNDERPAID_ACCEPTED'):
        // do something when an underpaid checkout was manually accepted
        break;
    break;
    }
}