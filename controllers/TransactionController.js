// package imports
const Sequelize = require("sequelize");
const moment = require("moment");
const axios = require('axios');
const nodemailer = require("nodemailer");

// local imports
const Users = require("../models").User;
const helpers = require("../helpers/cryptedge_helpers");
const Deposits = require("../models").Deposit;
const Withdrawals = require("../models").Withdrawal;
const WithdrawalCoin = require("../models").WithdrawalCoin;
const History = require("../models").History;
const Chats = require("../models").Chat;
const AdminMessages = require("../models").AdminMessage;
const Transactions = require("../models").Transaction;
const Referrals = require("../models").Referral;
const CryptBank = require("../models").CryptBank;
const DollarValue = require("../models").DollarValue;
const Product = require("../models").Product;
const Coin = require("../models").Coin;
const Internal = require("../models").Internal;
const parameters = require("../config/params");
const generateUniqueId = require("generate-unique-id");
const upload = require("../helpers/mult_helper");
const cloudinary = require("../helpers/cloudinary");
const Admins = require('../models').Admin;
const External = require('../models').External;
const InternalBuy = require('../models').InternalBuy;
const Card = require('../models').Card;
const GiftCard = require('../models').GiftCard;
const Package = require('../models').Package;
const Investment = require('../models').Investment;
const Rate = require('../models').Rate;
const Transaction = require("../models").Transaction;
const { Service } = require("../helpers/paystack");


const router = require("../routes/web");

// imports initialization
const Op = Sequelize.Op;

exports.userDeposits = (req, res, next) => {
    AdminMessages.findAll()
    .then(unansweredChats => {
        Deposits.findAll({
            where: {
                user_id: {
                    [Op.eq]: req.session.userId
                }
            },
            order: [
                ['createdAt', 'DESC'],
            ],
        })
        .then(deposits => {
            res.render("dashboards/users/user_deposit", {
                deposits: deposits,
                messages: unansweredChats,
                moment
            });
        })
        .catch(error => {
            res.redirect("/");
        });
    })
    .catch(error => {
        req.flash('error', "Server error!");
        res.redirect("/");
    });
}

exports.aUserWithdrawals = (req, res, next) => {
    AdminMessages.findAll()
    .then(unansweredChats => {
        Withdrawals.findAll({
          
            where: {
                user_id: {
                    [Op.eq]: req.session.userId
                }
            },
            order: [
                ['createdAt', 'DESC'],
            ],
        })
        .then(withdrawals => {
             Users.findOne({
            where: {
                id: {
                    [Op.eq]: req.session.userId
                }
            }
        }).then(user=>{
             
            res.render("dashboards/users/user_withdrawals", {
                withdrawals: withdrawals,
                messages: unansweredChats,
                user,
                moment
            });
        }).catch(err=>{
             res.redirect("back");
        })
            
           
        })
        .catch(error => {
            res.redirect("back");
        });
    })
    .catch(error => {
        req.flash('error', "Server error!");
        res.redirect("back");
    });
    
}

exports.viewUserWithdrawalDetail = (req, res, next) => {
    AdminMessages.findAll()
    .then(unansweredChats => {
        Withdrawals.findOne({
          
            where: {
                id: {
                    [Op.eq]: req.params.id
                }
            }
        })
        .then(withdrawals => {
             Users.findOne({
            where: {
                id: {
                    [Op.eq]: req.session.userId
                }
            }
        }).then(user=>{
             
            res.render("dashboards/users/view_user_withdrawals", {
                withdrawals,
                messages: unansweredChats,
                user,
                moment
            });
        }).catch(err=>{
             res.redirect("back");
        })
            
           
        })
        .catch(error => {
            res.redirect("back");
        });
    })
    .catch(error => {
        req.flash('error', "Server error!");
        res.redirect("back");
    });
    
}


exports.withdrawWallet = (req, res, next) => {
    AdminMessages.findAll()
    .then(unansweredChats => {
        console.log(parameters.PAYSTACK_BASEURL);
        Users.findOne({
            where: {
                id: {
                    [Op.eq]: req.session.userId
                }
            },
            include:["kyc"]
        })
        .then(user => {
            console.log(user);
            if (user) {
                // console.log(parameters.PAYSTACK_BASEURL);
                axios.get(`${parameters.PAYSTACK_BASEURL}/bank`).then(banks =>{
                //    console.log(banks.data);
                    const data = banks.data.data;
                    let wallet = Math.abs(Number(user.wallet));
                    let revenue = Math.abs(Number(user.revenue));
                    let userTotal = wallet + revenue
                    res.render("dashboards/users/user_withdrawing", {
                        user: user,
                        userTotal,
                        wallet,
                        messages: unansweredChats,
                        moment,
                        banks: data
                    });
                })
            } else {
                res.redirect("back");
            }
        })
        .catch(error => {
            res.redirect("back");
        });
    })
    .catch(error => {
        req.flash('error', "Server error!");
        res.redirect("back");
    });
}

exports.getDays = async(req, res)=>{
    try {
       const users = await Users.findAll({
            where: {
                    deletedAt: {
                        [Op.eq]: null
                    }
            },
            order: [
                ['name', 'ASC'],
                ['createdAt', 'DESC'],
            ],
            include:[
                {
                    model: Coin,
                    as: "userCoins",
                    include: [
                        {
                            model: Product,
                            as: "coinTypes"
                        }
                    ]
                }
            ]
        })
        const now = moment();
    var new_date = moment(now, "DD-MM-YYYY").add(12*7, 'days');
    
    return res.send({users})
    } catch (error) {
        return res.send({error})
    }
    
}

exports.makeInvestment = (req, res) => {
    AdminMessages.findAll()
    .then(unansweredChats => {
        Users.findOne({
            where: {
                id: {
                    [Op.eq]: req.session.userId
                }
            }
        })
        .then(user => {
            if (user) {
                Package.findOne({where:{id:req.params.id}})
                .then(package =>{

                    let wallet = Math.abs(Number(user.wallet));
                    let revenue = Math.abs(Number(user.revenue));
                    let userTotal = wallet + revenue
                    res.render("dashboards/users/investment", {
                        user: user,
                        userTotal,
                        wallet,
                        messages: unansweredChats,
                        moment,
                        package
                    });
                })
            } else {
                res.redirect("back");
            }
        })
        .catch(error => {
            res.redirect("back");
        });
    })
    .catch(error => {
        req.flash('error', "Server error!");
        res.redirect("back");
    });
}

exports.InvestNow = async (req, res) =>{
    try {
        const {duration, amount, earning, package_id, user_id, code} = req.body;
        console.log(req.body);
        const user = await Users.findOne({where:{id:req.session.userId}});
        const package = await Package.findOne({where:{id:package_id}});
        if (user.oauth_token !== code) {
            req.flash('warning', "Invalid Token!");
            res.redirect("back");
            return
        }else{
            const dur = Number(package.duration);
            const days = dur * 30;
            const now = moment();
            var new_date = moment(now, "DD-MM-YYYY").add(days, 'days');
            const amtUsed = Number(amount);
            const request = {
                package_id,
                user_id,
                amount:amtUsed,
                earning,
                duration: days,
                expiredAt: new_date
            };
            await Investment.create(request);
            const wallet = Number(user.wallet);
            const balance = wallet - amtUsed
            await Users.update({wallet:balance}, {where:{id: user_id}});
            const type = "Investment"
            const desc = `Made Investment for ${package.name} plan`;
            await History.create({type, value: amtUsed, desc, user_id});
            await Transactions.create({type: "INVESTMENT", user_id, amount});
            const output = `<head>
           <title>TRANSACTION RECEIPT</title>
         </head>
         <body>
         <p>Your Transaction was successful. You just made an Investment with PayBuyMax</p>
         <h2> Details Of Transaction </h2>
         <ul>
             
             <li>Name:.....................${user.name} </li>
             <li>Email:.....................${user.email} </li>
             <li>Investment Package:.....................${package.name} Plan</li>
             <li>Amount:.....................N${amount }</li>
             <li>Investment Commission:.....................${package.commission}% </li>
             <li>Admin charge:.....................${package.charge}% </li>
             <li>Date of Investment:.....................${now}</li>
             <li>Date of Expiration:.....................${new_date}</li>
         </ul>

         <h5>Thank You for Investing with Us!</h5>
         </body>
                 </html>`;
       let transporter = nodemailer.createTransport({
         host: parameters.EMAIL_HOST,
         port: parameters.EMAIL_PORT,
         secureConnection: true, // true for 465, false for other ports
         auth: {
           user: parameters.EMAIL_USERNAME, // generated ethereal user
           pass: parameters.EMAIL_PASSWORD, // generated ethereal password
         },
         
       });
 
       // send mail with defined transport object
       let mailOptions = {
         from: ` "PayBuyMax" <${parameters.EMAIL_USERNAME}>`, // sender address
         to: `${user.email}`, // list of receivers
         subject: "[PayBuyMax] Withdrawal Receipt", // Subject line
         text: "PayBuyMax", // plain text body
         html: output, // html body
       };
       const sendMail = transporter.sendMail(mailOptions, async(err, info) => {
         if (err) {
             console.log(err);
           return res.json({msg:"Error sending mail, please try again"});
           
         } else {
            req.flash('success', "Investment Made Successfully");
            res.redirect("back");
           
         }
       });

            
        }
    } catch (error) {
        req.flash('error', "Server error!");
        res.redirect("back");
    }
}

exports.withdrawCoin = async (req, res, next) => {
    try {
        const unansweredChats = await AdminMessages.findAll();
        const products = await Product.findAll();
        const user = await Users.findOne({where:{id: req.session.userId}, include:[
            {
                model: Coin,
                as: "coins",
                include: {
                    model: Product,
                    as: "coinTypes"
                }
            }
        ] });
        const coins = user.coins
        res.render("dashboards/users/withdraw_coin", {
            user: user,
            messages: unansweredChats,
            moment,
            coins,
            products
        });
    } catch (error) {
        req.flash('error', "Server error!");
        res.redirect("back");
    }    
}

exports.transferHistory = async (req, res, next) => {
    try {
        const user = await Users.findOne({where:{id:req.session.userId}});
        const history = await WithdrawalCoin.findAll({where:{userId:req.session.userId}, include:["user", "coin"], order: [
            ['createdAt', 'DESC'],
        ],});
        const unansweredChats = await AdminMessages.findAll();
        res.render("dashboards/users/transfer_history", {
            user: user,
            messages: unansweredChats,
            moment,
            history
        });
    } catch (error) {
        req.flash('error', "Server error!");
        res.redirect("back");
    }    
}

exports.transferDetail = async (req, res, next) => {
    try {
        const user = await Users.findOne({where:{id:req.session.userId}});
        const history = await WithdrawalCoin.findOne({where:{id:req.params.id}, include:["user", "coin"]});
        const unansweredChats = await AdminMessages.findAll();
        res.render("dashboards/users/transfer_detail", {
            user: user,
            messages: unansweredChats,
            moment,
            history
        });
    } catch (error) {
        req.flash('error', "Server error!");
        res.redirect("back");
    }    
}

exports.withdrawFromCoinWallet = async(req, res, next) => {
    try {
        let {
            code,
            coinType,
            amount,
            wallet_address,
            userId
        } = req.body;
       
        if (!code || !wallet_address || !amount) {
            req.flash('warning', "Enter all fields");
            res.redirect("back");
        } else {
            // get user details
            const user = await Users.findOne({
                    where: {
                        id: {
                            [Op.eq]: userId
                        }
                    }
                });
            const coin = await Coin.findOne({where:{userId, coinId:coinType}});
            const product = await Product.findOne({where:{id: coinType}})
            let reference = generateUniqueId({
                length: 15,
                useLetters: true,
                });
            const withdrawal = await WithdrawalCoin.create({
                                    amount,
                                    userId,
                                    coinId: coinType,
                                    coinType: product.name,
                                    walletAddress:wallet_address,
                                    reference,
                                    charge:product.charge
                                });
            const desc = "Transfer request initiated";
            const type = "Coin Transfer"
            const history = await History.create({
                                        type,
                                        desc,
                                        value:amount,
                                        user_id:userId
                                    });
    
            req.flash('success', "Transfer success, awaiting disbursement!");
            res.redirect("back");
        }
    } catch (error) {
        req.flash('error', "Server error");
        res.redirect("back");
    }
}

exports.withdrawFromWallet = async(req, res, next) => {
    try {
        let {
            userId,
            code,
            acct_name,
            bank_name,
            bank_code,
            acct_number,
            amount
        } = req.body;
       console.log(req.body);
        if (!acct_number || !acct_name || !amount || !bank_name) {
            req.flash('warning', "Enter all fields");
            res.redirect("back");
            return
        } else if (!helpers.isNumeric(amount)) {
            req.flash('warning', "Enter valid amount");
            res.redirect("back");
            return
        } else {
            // get user wallet
            const user = await Users.findOne({
                    where: {
                        id: {
                            [Op.eq]: req.session.userId
                        }
                    }
                });
                
            if (user.oauth_token === code) {
                let type = 'Withdrawal'
                let desc = 'Withdrawal request initiated'
                let userWallet = Math.abs(Number(user.wallet));
                amount = Math.abs(Number(amount));
                if (amount > userWallet) {
                    req.flash('warning', "Insufficient fund");
                    res.redirect("back");
                    return
                } else {
                    // console.log(user);
                    let owner = req.session.userId
                    const paystack = await Service.Paystack.createTransferReceipt(acct_name, acct_number, bank_code);
                    console.log(paystack);
                    if (paystack.status === true) {
                        
                        const metaData = {
                            account_number: paystack.data.details.account_number,
                            account_name: paystack.data.details.account_name,
                            bank_code: paystack.data.details.bank_code,
                            bank_name: paystack.data.details.bank_name,
                        }
                        const withdrawRequest = {
                            amount,
                            user_id:owner,
                            acct_name,
                            acct_number,
                            bank_name,
                            bank_code,
                            recipient_code: paystack.data.recipient_code,
                            meta: JSON.stringify(metaData)
                        }
                        await Withdrawals.create(withdrawRequest)
                        await History.create({
                            type,
                            desc,
                            value:req.body.amount,
                            user_id:req.session.userId
                        })
                        req.flash('success', "Withdrawal success, awaiting disbursement!");
                        res.redirect("back");
                        return
                    }else{
                        req.flash('danger', "An Error Occurred!");
                        res.redirect("/home");
                        return
                    }             
                }
            } else {
                req.flash('warning', "Invalid OTP Token");
                res.redirect("back");
                return
            }
        }
        
    } catch (error) {
        req.flash('error', "Server error");
        res.redirect("back");
    }
}


exports.transactionHistory = (req, res, next) => {
    AdminMessages.findAll()
    .then(unansweredChats => {
        History.findAll({
            where: {
                user_id: {
                    [Op.eq]: req.session.userId
                }
            },
            order: [
                ['createdAt', 'DESC'],
            ],
        })
        
        .then(histories => {
            Users.findOne({
                where:{
                    id:{
                        [Op.eq] : req.session.userId
                    }
                }
            }).then(user=>{
                res.render("dashboards/users/history", {
                histories: histories,
                messages: unansweredChats,
                user,
                moment
            })
            }).catch(err=>{
                 req.flash('error', "Server error");
            res.redirect("/");
            })
            
        })
        .catch(error => {
            
            req.flash('error', "Server error");
            res.redirect("/");
        });
    })
    .catch(error => {
       
        req.flash('error', "Server error!");
        res.redirect("/");
    });
}

exports.withdrawalDetails = (req, res, next) => {
    AdminMessages.findAll()
    .then(unansweredChats => {
        Withdrawals.findOne({
            where: {
                id: req.params.id
            },
            include: ["user"]
        })
        .then(withdrawals => {
            const amount = Number(withdrawals.amount)
            const charge = ((3/100)* amount) + 200
            const takeHome = amount - charge
            res.render("dashboards/withdrawal_details", {
                withdrawals,
                messages: unansweredChats,
                moment,
                takeHome
            });
        })
        .catch(error => {
            req.flash('error', "Server error");
            res.redirect("back");
        });
    })
    .catch(error => {
        req.flash('error', "Server error!");
        res.redirect("back");
    });
}


exports.unapprovedWithdrawals = (req, res, next) => {
    AdminMessages.findAll()
    .then(unansweredChats => {
        Withdrawals.findAll({
           
            where: {
                status: "pending"
            },
            include: ["user"],
            order: [
                ['createdAt', 'DESC'],
            ],
        })
        .then(withdrawals => {
            console.log({withdrawals});
            res.render("dashboards/unapproved_withdrawals", {
                withdrawals,
                messages: unansweredChats,
                moment,
                status: "Unapproved"
            });
        })
        .catch(error => {
            console.log(error)
            req.flash('error', "Server error");
            res.redirect("back");
        });
    })
    .catch(error => {
        console.log(error)
        req.flash('error', "Server error!");
        res.redirect("back");
    });
    
}

exports.disapprovedWithdrawals = (req, res, next) => {
    AdminMessages.findAll()
    .then(unansweredChats => {
        Withdrawals.findAll({
           
            where: {
                status: "disapproved"
            },
            include: ["user"],
            order: [
                ['createdAt', 'DESC'],
            ],
        })
        .then(withdrawals => {
            console.log({withdrawals});
            res.render("dashboards/unapproved_withdrawals", {
                withdrawals,
                messages: unansweredChats,
                moment,
                status: "Disapproved"
            });
        })
        .catch(error => {
            console.log(error)
            req.flash('error', "Server error");
            res.redirect("/");
        });
    })
    .catch(error => {
        console.log(error)
        req.flash('error', "Server error!");
        res.redirect("/");
    });
    
}

exports.unapprovedCoinWithdrawals = (req, res, next) => {
    AdminMessages.findAll()
    .then(unansweredChats => {
        WithdrawalCoin.findAll({
           
            where: {
                status: "pending"
            },
            include: ["user","coin"],
            order: [
                ['createdAt', 'DESC'],
            ],
        })
        .then(withdrawals => {
            console.log({withdrawals});
            res.render("dashboards/unapproved_coin_withdrawals", {
                withdrawals,
                messages: unansweredChats,
                moment
            });
        })
        .catch(error => {
            console.log(error)
            req.flash('error', "Server error");
            res.redirect("/");
        });
    })
    .catch(error => {
        console.log(error)
        req.flash('error', "Server error!");
        res.redirect("/");
    });
    
}

exports.approvedCoinWithdrawals = (req, res, next) => {
    AdminMessages.findAll()
    .then(unansweredChats => {
        WithdrawalCoin.findAll({
           
            where: {
                status: "approved"
            },
            include: ["user","coin"],
            order: [
                ['createdAt', 'DESC'],
            ],
        })
        .then(withdrawals => {
            console.log({withdrawals});
            res.render("dashboards/approved_coin_withdrawals", {
                withdrawals,
                messages: unansweredChats,
                moment
            });
        })
        .catch(error => {
            console.log(error)
            req.flash('error', "Server error");
            res.redirect("/");
        });
    })
    .catch(error => {
        console.log(error)
        req.flash('error', "Server error!");
        res.redirect("/");
    });
    
}

exports.ViewUnapprovedCoinWithdrawals = (req, res, next) => {
    AdminMessages.findAll()
    .then(unansweredChats => {
        WithdrawalCoin.findOne({
           
            where: {
                id: req.params.id
            },
            include: ["user","coin"],
            order: [
                ['createdAt', 'DESC'],
            ],
        })
        .then(withdraw => {
            res.render("dashboards/view_coin_withdraw", {
                withdraw,
                messages: unansweredChats,
                moment
            });
        })
        .catch(error => {
            console.log(error)
            req.flash('error', "Server error");
            res.redirect("/");
        });
    })
    .catch(error => {
        console.log(error)
        req.flash('error', "Server error!");
        res.redirect("/");
    });
    
}

exports.unappWithdrawPaystack = (req, res, next) => {
    AdminMessages.findAll()
    .then(unansweredChats => {
        Withdrawals.findAll({
            where: {
                status: {
                    [Op.eq]: 0
                }
            },
            include: ["user"],
            order: [
                ['createdAt', 'DESC'],
            ],
        })
        .then(withdrawals => {
            res.render("dashboards/unapp_withdrawal_paystack", {
                withdrawals: withdrawals,
                messages: unansweredChats,
                moment
            });
        })
        .catch(error => {
            console.log(error)
            req.flash('error', "Server error");
            res.redirect("/");
        });
    })
    .catch(error => {
        console.log(error)
        req.flash('error', "Server error!");
        res.redirect("/");
    });
    
}


exports.approvedWithdrawals = (req, res, next) => {
    AdminMessages.findAll()
    .then(unansweredChats => {
        Withdrawals.findAll({
            where: {
                status: "approved"
            },
            include: ["user"],
            order: [
                ['createdAt', 'DESC'],
            ],
        })
        .then(withdrawals => {
            res.render("dashboards/unapproved_withdrawals", {
                withdrawals: withdrawals,
                messages: unansweredChats,
                moment,
                status:"Approved"
            });
        })
        .catch(error => {
            req.flash('error', "Server error");
            res.redirect("back");
        });
    })
    .catch(error => {
        req.flash('error', "Server error!");
        res.redirect("back");
    });
}

exports.postApproveWithdrawal = async(req, res, next) => {
    try {
        const {id, code} = req.body;
    
        const withdrawal = await Withdrawals.findOne({
                where: {
                    id: {
                        [Op.eq]: id
                    }
                },
                include: ["user"]
            });
        const paystack = await Service.Paystack.finalizeTransfer(withdrawal.transfer_code, code);
        
        if(paystack.status === true) {
            let owner = withdrawal.user_id
            
            await Withdrawals.update({
                status: "approved"
            }, {
                where: {
                    id: {
                        [Op.eq]: id
                    }
                }
            });
            console.log(withdrawal);
            const wallet = withdrawal.user.wallet;
            const amount = withdrawal.amount;
            
            const balance = Number(wallet) - Number(amount);
            console.log(wallet, amount, balance);
            await Users.update({wallet: balance}, {where:{id: withdrawal.user_id}});
    
            let type = 'Withdrawal'
            let desc = 'Withdrawal request approved'
            await History.create({
                type,
                desc,
                value:amount,
                user_id:withdrawal.user_id
            });
    
            const request = {
                user_id:withdrawal.user_id,
                type: "WITHDRAWAL",
                amount: withdrawal.amount
            }
            await Transaction.create(request);
            const now  = moment();
            const output =`<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Paybuymax Receipt</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">
                <style>
                    .receipt-div{
                        border: 1px solid rgb(202, 202, 202);
                        padding: 12px;
                    }
                    .receipt-div img{
                        padding-bottom: 30px;
                    }
                    .receipt-div .header-alert{
                        background-color: #BB702B;
                        padding: 10px;
                        color: #fff;
                        font-size: 20px;
                    }
                    .receipt-div .amount-div{
                        padding: 30px 10px !important;
                        background-color: rgb(238, 238, 238);
                    }
                    .receipt-div .amount-div .amount{
                        margin-top: -10px;
                        font-size: 45px;
                        color: #BB702B;
                        font-weight: bold;
                    }
                    .receipt-div .amount-div p{
                        font-size: 20px;
                    }
                    .receipt-div .details p{
                        font-size: 15px;
                        font-weight: bold;
                    }
                </style>
            </head>
            <body>
                <main>
                    <div class="container py-2">
                        <div class="row">
                            <div class="col-sm-3"></div>
                            <div class="col-sm-6">
                                <div class="receipt-div">
                                    <div class="row">
                                        <div class="col-sm-12 text-center">
                                            <img src="https://res.cloudinary.com/yhomi1996/image/upload/v1635179234/ecoin/logo_creup6.png" alt="Paybuymax Logo">
                                        </div>
                                        <div class="col-sm-12 text-center header-alert">
                                            Your Withdrawal Was Successful!
                                        </div>
                                        <div class="col-sm-12 text-center amount-div">
                                            <p>You just withdraw</p>
                                            <h1 class="amount">NGN ${withdrawal.amount}</h1>
                                            <p>from your paybuymax wallet</p>
                                        </div>
                                        <div class="col-sm-12 py-3 text-center" style="font-size: 25px; font-weight: bold; text-decoration: underline;">
                                            Transaction Details
                                        </div>
                                        <div class="col-sm-12 details">
                                            <p><span>Amount:</span> <span style="float: right;">&#8358;${withdrawal.amount}</span></p>
                                            <hr size="3">
                                            <p><span>Account Name:</span> <span style="float: right;">${withdrawal.acct_name}</span></p>
                                            <hr size="3">
                                            <p><span>Account Number:</span> <span style="float: right;">${withdrawal.acct_number}</span></p>
                                            <hr size="3">
                                            <p><span>Bank Name:</span> <span style="float: right;">${withdrawal.bank_name}</span></p>
                                            <hr size="3">
                                            <p><span>Transaction Reference:</span> <span style="float: right;">${withdrawal.reference}</span></p>
                                            <hr size="3">
                                            <p><span>Transaction Date:</span> <span style="float: right;">${now}</span></p>
                                            <hr size="3">
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-sm-3"></div>
                        </div>
                    </div>
                </main>
            </body>
            </html>`
        let transporter = nodemailer.createTransport({
            host: parameters.EMAIL_HOST,
            port: parameters.EMAIL_PORT,
            secureConnection: true, // true for 465, false for other ports
            auth: {
            user: parameters.EMAIL_USERNAME, // generated ethereal user
            pass: parameters.EMAIL_PASSWORD, // generated ethereal password
            },
            
        });

        // send mail with defined transport object
        let mailOptions = {
            from: ` "PayBuyMax" <${parameters.EMAIL_USERNAME}>`, // sender address
            to: `${withdrawal.user.email}`, // list of receivers
            subject: "[PayBuyMax] Withdrawal Receipt", // Subject line
            text: "PayBuyMax", // plain text body
            html: output, // html body
        };
        const sendMail = transporter.sendMail(mailOptions, async(err, info) => {
            if (err) {
                console.log(err);
            return res.json({msg:"Error sending mail, please try again"});
            
            } else {
                console.log('withdrawal updated successfully');
            
            }
        });
        req.flash('success', "Withdrawal Approved successfully");
        res.redirect("back");
          
      } else {
          req.flash('error', "Paystack Error");
          res.redirect("/dashboard");
      }
    } catch (error) {
         req.flash('error', "Server error!");
         res.redirect("back");
    }
         
}

// exports.postApproveWithdrawal = async(req, res, next) => {
   
//    const {id} = req.body;
//    const result = await cloudinary.uploader.upload(req.file.path);
//    const docPath = result.secure_url;
  
//     Withdrawals.findOne({
//             where: {
//                 id: {
//                     [Op.eq]: id
//                 }
//             }
//         })
//         .then(withdrawal => {
//             if(withdrawal) {
//                 let owner = withdrawal.user_id
                
//                 Withdrawals.update({
//                     status: "approved",
//                     fileDoc: docPath
//                 }, {
//                     where: {
//                         id: {
//                             [Op.eq]: id
//                         }
//                     }
//                 })
//                 .then(updatedWithdrawal => {
                    
//                      let type = 'Withdrawal'
//                     let desc = 'Withdrawal request approved'
//                      History.create({
//                         type,
//                         desc,
//                         value:req.body.amount,
//                         user_id:owner
//                     }).then(history =>{
//                         Users.findOne({where:{id:owner}}).then(user =>{
//                             const userBalance = Number(user.wallet) - Number(withdrawal.amount);
//                             const email = user.email;
//                             Users.update({wallet: userBalance}, {where:{id: user.id}}).then(update =>{
//                                 const now  = moment();
//                                 const output = `<html>
//         <head>
//           <title>TRANSACTION RECEIPT</title>
//         </head>
//         <body>
//         <p>Your Withdrawal was successful. You just withdraw ${withdrawal.amount} from Your PayBuyMax wallet</p>
//         <h2> Receipt </h2>
//         <ul>
            
//             <li>Amount:.....................N${withdrawal.amount} </li>
//             <li>Account Name:.....................${withdrawal.acct_name} </li>
//             <li>Account Number:.....................${withdrawal.acct_number} </li>
//             <li>Bank Name:.....................${withdrawal.bank_name} </li>
//             <li>Transaction Reference:.....................${withdrawal.reference}</li>
//             <li>Date:.....................${now}</li>
//         </ul>
//         </body>
//                 </html>`;
//       let transporter = nodemailer.createTransport({
//         host: parameters.EMAIL_HOST,
//         port: parameters.EMAIL_PORT,
//         secureConnection: true, // true for 465, false for other ports
//         auth: {
//           user: parameters.EMAIL_USERNAME, // generated ethereal user
//           pass: parameters.EMAIL_PASSWORD, // generated ethereal password
//         },
        
//       });

//       // send mail with defined transport object
//       let mailOptions = {
//         from: ` "PayBuyMax" <${parameters.EMAIL_USERNAME}>`, // sender address
//         to: `${user.email}`, // list of receivers
//         subject: "[PayBuyMax] Withdrawal Receipt", // Subject line
//         text: "PayBuyMax", // plain text body
//         html: output, // html body
//       };
//       const sendMail = transporter.sendMail(mailOptions, async(err, info) => {
//         if (err) {
//             console.log(err);
//           return res.json({msg:"Error sending mail, please try again"});
          
//         } else {
//             req.flash('success', "Withdrawal updated successfully");
//             res.redirect("back");
          
//         }
//       });
                    
//                             })
//                         })
//                     })
//                 })
//                 .catch(error => {
//                     req.flash('error', "Server error");
//                     res.redirect("back");
//                 });
//             } else {
//                 req.flash('error', "Invalid withdrawal");
//                     res.redirect("/");
//             }
//         })
//         .catch(error => {
//             req.flash('error', "Server error");
//             res.redirect("back");
//         });
// }

exports.postApproveCoinWithdrawal = async(req, res, next) => {
   try {
    const {id } = req.body;
    console.log(req.body);
    const withdrawal = await WithdrawalCoin.findOne({
             where: {
                 id: {
                     [Op.eq]: id
                 }
             },
             include: ["user","coin"]
         });
        // console.log(withdrawal);
        let owner = withdrawal.userId
        // console.log(owner);
    const update = await WithdrawalCoin.update({status: "approved" }, {where: {id}})
    console.log(update);     
    let type = 'Coin Transfer'
    let desc = 'Coin Transfer request approved'
    const history = await History.create({
            type,
            desc,
            value:withdrawal.amount,
            user_id:owner
        })
    const user = await Coin.findOne({where:{userId:withdrawal.userId, coinId:withdrawal.coinId}})
    console.log(user);
    const coinBalance = Number(user.balance);
    const withdrawAmoount = Number(withdrawal.amount);
    const userBalance = coinBalance - withdrawAmoount;
    await Coin.update({balance: userBalance}, {where:{userId:withdrawal.userId, coinId:withdrawal.coinId}})
        const now  = moment();
        const charge = Number(withdrawal.charge);
        const actualAmount = (charge/100) * withdrawAmoount;
        const amountSent = (withdrawAmoount - actualAmount).toFixed(3)
        const output = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Paybuymax Receipt</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">
            <style>
                .receipt-div{
                    border: 1px solid rgb(202, 202, 202);
                    padding: 12px;
                }
                .receipt-div img{
                    padding-bottom: 30px;
                }
                .receipt-div .header-alert{
                    background-color: #BB702B;
                    padding: 10px;
                    color: #fff;
                    font-size: 20px;
                }
                .receipt-div .amount-div{
                    padding: 30px 10px !important;
                    background-color: rgb(238, 238, 238);
                }
                .receipt-div .amount-div .amount{
                    margin-top: -10px;
                    font-size: 45px;
                    color: #BB702B;
                    font-weight: bold;
                }
                .receipt-div .amount-div p{
                    font-size: 20px;
                }
                .receipt-div .details p{
                    font-size: 15px;
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <main>
                <div class="container py-2">
                    <div class="row">
                        <div class="col-sm-3"></div>
                        <div class="col-sm-6">
                            <div class="receipt-div">
                                <div class="row">
                                    <div class="col-sm-12 text-center">
                                        <img src="https://res.cloudinary.com/yhomi1996/image/upload/v1635179234/ecoin/logo_creup6.png" alt="Paybuymax Logo">
                                    </div>
                                    <div class="col-sm-12 text-center header-alert">
                                        Your Withdrawal Was Successful!
                                    </div>
                                    <div class="col-sm-12 text-center amount-div">
                                        <p>You just withdraw</p>
                                        <h1 class="amount">${withdrawal.amount} ${withdrawal.coin.symbol}</h1>
                                        <p>from your paybuymax wallet</p>
                                    </div>
                                    <div class="col-sm-12 py-3 text-center" style="font-size: 25px; font-weight: bold; text-decoration: underline;">
                                        Transaction Details
                                    </div>
                                    
                                    <div class="col-sm-12 details">
                                        <p><span>Amount Transferred:</span> <span style="float: right;">${withdrawal.amount} ${withdrawal.coin.symbol}</span></p>
                                        <hr size="3">
                                        <p><span>Type of Fund:</span> <span style="float: right;">${withdrawal.coin.name}</span></p>
                                        <hr size="3">
                                        <p><span>Transferred Charge:</span> <span style="float: right;">${charge}%</span></p>
                                        <hr size="3">
                                        <p><span>Amount Sent:</span> <span style="float: right;">${amountSent}${withdrawal.coin.symbol}</span></p>
                                        <hr size="3">
                                        <p><span>Name:</span> <span style="float: right;">${withdrawal.user.name}</span></p>
                                        <hr size="3">
                                        <p><span>Email:</span> <span style="float: right;">${withdrawal.user.email}</span></p>
                                        <hr size="3">
                                        <p><span>Wallet Address:</span> <span style="float: right;">${withdrawal.walletAddress}</span></p>
                                        <hr size="3">
                                        <p><span>Transaction Reference:</span> <span style="float: right;">${withdrawal.reference}</span></p>
                                        <hr size="3">
                                        <p><span>Transaction Date:</span> <span style="float: right;">${now}</span></p>
                                        <hr size="3">
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-sm-3"></div>
                    </div>
                </div>
            </main>
        </body>
        </html>`;
       let transporter = nodemailer.createTransport({
         host: parameters.EMAIL_HOST,
         port: parameters.EMAIL_PORT,
         secureConnection: true, // true for 465, false for other ports
         auth: {
           user: parameters.EMAIL_USERNAME, // generated ethereal user
           pass: parameters.EMAIL_PASSWORD, // generated ethereal password
         },
         
       });
 
       // send mail with defined transport object
       let mailOptions = {
         from: ` "PayBuyMax" <${parameters.EMAIL_USERNAME}>`, // sender address
         to: `${withdrawal.user.email}`, // list of receivers
         subject: "[PayBuyMax] Withdrawal Receipt", // Subject line
         text: "PayBuyMax", // plain text body
         html: output, // html body
       };
       const sendMail = transporter.sendMail(mailOptions, async(err, info) => {
         if (err) {
             console.log(err);
           return res.json({msg:"Error sending mail, please try again"});
           
         } else {
             req.flash('success', "Transfer Approved successfully");
             res.redirect("back");
           
         }
       });
   } catch (error) {
        req.flash('error', "Server error");
        res.redirect("back");
   }
 }

exports.approveExternalTransaction = async(req, res, next) => {
   
    const {id} = req.body;
    const result = await cloudinary.uploader.upload(req.file.path);
    const docPath = result.secure_url;
   
     External.findOne({
             where: {
                 id: {
                     [Op.eq]: id
                 }
             },
             include:["coin"]
         })
         .then(withdrawal => {
                     console.log(withdrawal);         
                 External.update({
                     status: "approved",
                     receipt: docPath
                 }, {
                     where: {
                         id: {
                             [Op.eq]: id
                         }
                     }
                 })
                 .then(updatedWithdrawal => {
                    const now  = moment();
                    const output = `<html>
         <head>
           <title>TRANSACTION RECEIPT</title>
         </head>
         <body>
         <p>Your Transaction was successful. You just sold ${withdrawal.quantity} ${withdrawal.coin.symbol} to PayBuyMax</p>
         <h2> Details Of Transaction </h2>
         <ul>
             
             <li>Name:.....................${withdrawal.name} </li>
             <li>Email:.....................${withdrawal.email} </li>
             <li>Sold:.....................${withdrawal.quantity} ${withdrawal.coin.symbol}</li>
             <li>Rate:.....................${ Intl.NumberFormat('de-DE', { style: 'currency', currency: 'NGN' }).format(withdrawal.currentRate.toFixed(3)) }</li>
             <li>Amount:.....................${ Intl.NumberFormat('de-DE', { style: 'currency', currency: 'NGN' }).format(withdrawal.amount.toFixed(3)) }</li>
             <li>Transaction Reference:.....................${withdrawal.reference}</li>
             <li>Transaction Receipt:.....................<a href="${docPath}">Reciept</a></li>
             <li>Date:.....................${now}</li>
         </ul>

         <h5>Thank You for Trading with Us!</h5>
         </body>
                 </html>`;
       let transporter = nodemailer.createTransport({
         host: parameters.EMAIL_HOST,
         port: parameters.EMAIL_PORT,
         secureConnection: true, // true for 465, false for other ports
         auth: {
           user: parameters.EMAIL_USERNAME, // generated ethereal user
           pass: parameters.EMAIL_PASSWORD, // generated ethereal password
         },
         
       });
 
       // send mail with defined transport object
       let mailOptions = {
         from: ` "PayBuyMax" <${parameters.EMAIL_USERNAME}>`, // sender address
         to: `${withdrawal.email}`, // list of receivers
         subject: "[PayBuyMax] Withdrawal Receipt", // Subject line
         text: "PayBuyMax", // plain text body
         html: output, // html body
       };
       const sendMail = transporter.sendMail(mailOptions, async(err, info) => {
         if (err) {
             console.log(err);
           return res.json({msg:"Error sending mail, please try again"});
           
         } else {
             req.flash('success', "Withdrawal updated successfully");
             res.redirect("back");
           
         }
       });
                     
                             })
                 .catch(error => {
                     req.flash('error', "Server error");
                     res.redirect("back");
                 });
             
         })
         .catch(error => {
             req.flash('error', "Server error");
             res.redirect("back");
         });
}

exports.approveGiftCardTransaction = async(req, res, next) => {
   
    const {id} = req.body;
    const result = await cloudinary.uploader.upload(req.file.path);
    const docPath = result.secure_url;
   
     GiftCard.findOne({
             where: {
                 id: {
                     [Op.eq]: id
                 }
             },
             include:["card"]
         })
         .then(withdrawal => {
                     console.log(withdrawal);         
                 GiftCard.update({
                     status: "approved",
                     receipt: docPath
                 }, {
                     where: {
                         id: {
                             [Op.eq]: id
                         }
                     }
                 })
                 .then(updatedWithdrawal => {
                    const now  = moment();
                    const output = `<html>
         <head>
           <title>TRANSACTION RECEIPT</title>
         </head>
         <body>
         <p>Your Transaction was successful. You just sold ${withdrawal.quantity} ${withdrawal.card.name} to PayBuyMax</p>
         <h2> Details Of Transaction </h2>
         <ul>
             
             <li>Name:.....................${withdrawal.name} </li>
             <li>Email:.....................${withdrawal.email} </li>
             <li>Sold:.....................${withdrawal.quantity} ${withdrawal.card.name}</li>
             <li>Amount Sent:.....................N${withdrawal.amountPaid} </li>
             <li>Bank Name:.....................${withdrawal.bankName} </li>
             <li>Account Name:.....................${withdrawal.acctName} </li>
             <li>Account Number:.....................${withdrawal.acctNumber} </li>
             <li>Transaction Reference:.....................${withdrawal.reference}</li>
             <li>Transaction Receipt:.....................<a href="${docPath}">Reciept</a></li>
             <li>Date:.....................${now}</li>
         </ul>

         <h5>Thank You for Trading with Us!</h5>
         </body>
                 </html>`;
       let transporter = nodemailer.createTransport({
         host: parameters.EMAIL_HOST,
         port: parameters.EMAIL_PORT,
         secureConnection: true, // true for 465, false for other ports
         auth: {
           user: parameters.EMAIL_USERNAME, // generated ethereal user
           pass: parameters.EMAIL_PASSWORD, // generated ethereal password
         },
         
       });
 
       // send mail with defined transport object
       let mailOptions = {
         from: ` "PayBuyMax" <${parameters.EMAIL_USERNAME}>`, // sender address
         to: `${withdrawal.email}`, // list of receivers
         subject: "[PayBuyMax] Withdrawal Receipt", // Subject line
         text: "PayBuyMax", // plain text body
         html: output, // html body
       };
       const sendMail = transporter.sendMail(mailOptions, async(err, info) => {
         if (err) {
             console.log(err);
           return res.json({msg:"Error sending mail, please try again"});
           
         } else {
             req.flash('success', "Withdrawal updated successfully");
             res.redirect("back");
           
         }
       });
                     
                             })
                 .catch(error => {
                     req.flash('error', "Server error");
                     res.redirect("back");
                 });
             
         })
         .catch(error => {
             req.flash('error', "Server error");
             res.redirect("back");
         });
}

exports.approveInternalTransaction = async(req, res, next) => {
   
    const {id} = req.body;
    const result = await cloudinary.uploader.upload(req.file.path);
    const docPath = result.secure_url;
   
     InternalBuy.findOne({
             where: {
                 id: {
                     [Op.eq]: id
                 }
             },
             include:["coin","user"]
         })
         .then(withdrawal => {
                    //  console.log(withdrawal);         
                 InternalBuy.update({
                     status: "approved",
                     receipt: docPath
                 }, {
                     where: {
                         id: {
                             [Op.eq]: id
                         }
                     }
                 })
                 .then(updatedWithdrawal => {
                     Users.findOne({where:{id: withdrawal.userId}})
                     .then(user =>{
                         const wallet = Number(user.wallet);
                         const amount = Number(withdrawal.nairaAmount);
                         const balance = wallet - amount
                         Users.update({wallet:balance},{where:{id:user.id}})
                         .then(async updateUser =>{
                            const coin = await Coin.findOne({where:{userId: withdrawal.userId, coinId: withdrawal.coinId}});
                            const coinBalance = Number(coin.balance);
                            const qty = Number(withdrawal.qty);
                            const newBal = coinBalance + qty;

                            await Coin.update({balance: newBal}, {where:{userId: withdrawal.userId, coinId: withdrawal.coinId}})
                            console.log("Coin Updated");
                             const now  = moment();
                             const output = `<html>
                  <head>
                    <title>TRANSACTION RECEIPT</title>
                  </head>
                  <body>
                  <p>Your Transaction was successful. You just sold ${withdrawal.qty} ${withdrawal.coin.symbol} to PayBuyMax</p>
                  <h2> Details Of Transaction </h2>
                  <ul>
                      
                      <li>Name:.....................${withdrawal.customerName} </li>
                      <li>Email:.....................${withdrawal.customerEmail} </li>
                      <li>Sold:.....................${withdrawal.qty} ${withdrawal.coin.symbol}</li>
                      <li>Rate:.....................${withdrawal.coin.dollarRate}</li>
                      <li>Amount Paid:.....................N${ withdrawal.nairaAmount }</li>
                      <li>Transaction Reference:.....................${withdrawal.reference}</li>
                      <li>Transaction Receipt:.....................<a href="${docPath}">Reciept</a></li>
                      <li>Date Paid:.....................${withdrawal.createdAt}</li>
                      <li>Date Approved:.....................${now}</li>
                  </ul>
         
                  <h5>Thank You for Trading with Us!</h5>
                  </body>
                          </html>`;
                let transporter = nodemailer.createTransport({
                  host: parameters.EMAIL_HOST,
                  port: parameters.EMAIL_PORT,
                  secureConnection: true, // true for 465, false for other ports
                  auth: {
                    user: parameters.EMAIL_USERNAME, // generated ethereal user
                    pass: parameters.EMAIL_PASSWORD, // generated ethereal password
                  },
                  
                });
          
                // send mail with defined transport object
                let mailOptions = {
                  from: ` "PayBuyMax" <${parameters.EMAIL_USERNAME}>`, // sender address
                  to: `${withdrawal.customerEmail}`, // list of receivers
                  subject: "[PayBuyMax] Withdrawal Receipt", // Subject line
                  text: "PayBuyMax", // plain text body
                  html: output, // html body
                };
                const sendMail = transporter.sendMail(mailOptions, async(err, info) => {
                  if (err) {
                      console.log(err);
                    return res.json({msg:"Error sending mail, please try again"});
                    
                  } else {
                      req.flash('success', "Withdrawal updated successfully");
                      res.redirect("back");
                    
                  }
                });
                         })
                     })
                     
                             })
                 .catch(error => {
                     req.flash('error', "Server error");
                     res.redirect("back");
                 });
             
         })
         .catch(error => {
             req.flash('error', "Server error");
             res.redirect("back");
         });
 }

exports.postDisApproveWithdrawal = (req, res, next) => {
    id = req.body.id;
    Withdrawals.findOne({
            where: {
                id: {
                    [Op.eq]: id
                }
            }
        })
        .then(withdrawal => {
            if(withdrawal) {
                Withdrawals.update({
                    status: "disapproved"
                }, {
                    where: {
                        id: {
                            [Op.eq]: id
                        }
                    }
                })
                .then(updatedWithdrawal => {
                    // Todo: Send mail
                    req.flash('success', "Withdrawal updated successfully");
                    res.redirect("back");
                })
                .catch(error => {
                    req.flash('error', "Server error");
                    res.redirect("back");
                });
            } else {
                req.flash('error', "Invalid withdrawal");
                res.redirect("back");
            }
        })
        .catch(error => {
            req.flash('error', "Server error");
            res.redirect("back");
        });
}

exports.sellCoin = async(req, res) =>{
    try {
        const unansweredChats = await Chats.findAll({
            where: {
                [Op.and]: [{
                        receiver_id: {
                            [Op.eq]: req.session.userId
                        }
                    },
                    {
                        read_status: {
                            [Op.eq]: 0
                        }
                    }
                ]
            },
            include: ["user"],
        });
        const user = await Users.findOne({
            where: {
                id: {
                    [Op.eq]: req.session.userId
                }
            }
        });
        const referral = await Referrals.findAll({
            where: {
                referral_id: {
                    [Op.eq]: req.session.userId
                }
            }
        });
        
        const bank = await CryptBank.findOne({});

        const dollar = await DollarValue.findOne({});

        let coin = [];
        const resp = await axios.get("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false");
        coin = resp.data;
        coin = coin.slice(0,9)

        res.render("dashboards/users/buy", {
            user: user,
            email: user.email,
            phone: user.phone,
            wallet: user.wallet,
            referral: user.referral_count,
            referral_amount: referral.length * 1000,
            messages: unansweredChats,
            moment,
            coins:coin
        });
    } catch (error) {
        req.flash('error', "Server error");
        res.redirect("back");
    }
}

exports.sellBitCoin = async(req, res) =>{
    try {
        const {name} = req.query;
        const unansweredChats = await Chats.findAll({
            where: {
                [Op.and]: [{
                        receiver_id: {
                            [Op.eq]: req.session.userId
                        }
                    },
                    {
                        read_status: {
                            [Op.eq]: 0
                        }
                    }
                ]
            },
            include: ["user"],
        });
        const user = await Users.findOne({
            where: {
                id: {
                    [Op.eq]: req.session.userId
                }
            }
        });
        const referral = await Referrals.findAll({
            where: {
                referral_id: {
                    [Op.eq]: req.session.userId
                }
            }
        });
        
        const bank = await CryptBank.findOne({});

        const dollar = await DollarValue.findOne({});

        let coin = [];
        const resp = await axios.get(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${name}&order=market_cap_desc&per_page=100&page=1&sparkline=false`);
        coin = resp.data;
        coin = coin[0];
        console.log(coin);
        // const currentPrice = coin.current_price;
        // const rate = amount * currentPrice;

        res.render("dashboards/users/sell_coin", {
            user: user,
            email: user.email,
            phone: user.phone,
            wallet: user.wallet,
            referral: user.referral_count,
            referral_amount: referral.length * 1000,
            messages: unansweredChats,
            moment,
            coins:coin
        });
    } catch (error) {
        req.flash('error', "Server error");
        res.redirect("back");
    }
}

exports.buyCoin = async(req, res) =>{
    try {
        const unansweredChats = await Chats.findAll({
            where: {
                [Op.and]: [{
                        receiver_id: {
                            [Op.eq]: req.session.userId
                        }
                    },
                    {
                        read_status: {
                            [Op.eq]: 0
                        }
                    }
                ]
            },
            include: ["user"],
        });
        const user = await Users.findOne({
            where: {
                id: {
                    [Op.eq]: req.session.userId
                }
            }
        });
        const referral = await Referrals.findAll({
            where: {
                referral_id: {
                    [Op.eq]: req.session.userId
                }
            }
        });
        
        const bank = await CryptBank.findOne({});

        const dollar = await DollarValue.findOne({})

        res.render("dashboards/users/sell", {
            user: user,
            email: user.email,
            phone: user.phone,
            wallet: user.wallet,
            referral: user.referral_count,
            referral_amount: referral.length * 1000,
            messages: unansweredChats,
            moment
        });
    } catch (error) {
        req.flash('error', "Server error");
        res.redirect("back");
    }
}

exports.sellFromExternalWallet = async(req, res) =>{
    try {
        const unansweredChats = await Chats.findAll({
            where: {
                [Op.and]: [{
                        receiver_id: {
                            [Op.eq]: req.session.userId
                        }
                    },
                    {
                        read_status: {
                            [Op.eq]: 0
                        }
                    }
                ]
            },
            include: ["user"],
        });
        const user = await Users.findOne({
            where: {
                id: {
                    [Op.eq]: req.session.userId
                }
            }
        });
        const referral = await Referrals.findAll({
            where: {
                referral_id: {
                    [Op.eq]: req.session.userId
                }
            }
        });
        
        const bank = await CryptBank.findOne({});

        const dollar = await DollarValue.findOne({})

        res.render("dashboards/users/external_wallet", {
            user: user,
            email: user.email,
            phone: user.phone,
            wallet: user.wallet,
            referral: user.referral_count,
            referral_amount: referral.length * 1000,
            messages: unansweredChats,
            moment
        });
    } catch (error) {
        req.flash('error', "Server error");
        res.redirect("back");
    }
}

exports.sellCoinFromInternalWallet = async(req, res) =>{
    try {
        const {amount, coinId, code, user_id, sellBy} = req.body;
        let qty ;
        let dollarAmount;
        let nairaAmount;
        // console.log(req.body);
        
        const user = await Users.findOne({where:{id: user_id}});
        const wallet = await Coin.findOne({where:{userId: user_id, coinId}});
        const product = await Product.findOne({where:{id:coinId}});
        const balance = Number(wallet.balance);
        console.log(user.oauth_token);
        console.log(user);
        if (code  !== user.oauth_token) {
            req.flash('warning', "Wrong Transaction Code");
            res.redirect("back");
        }

        let dollarRate = Number(product.dollarRate);
        let nairaRate = Number(product.rate);

        if (sellBy === "usd") {
            dollarAmount = amount;
            qty = (amount/dollarRate);
            nairaAmount = qty*nairaRate.toFixed(3)
        }else if (sellBy === "naira") {
            nairaAmount = Number(amount);
            qty = (amount/nairaRate);
            dollarAmount = (qty*dollarRate).toFixed(3)
        }else if (sellBy === "qty") {
            qty = amount;
            nairaAmount = qty*nairaRate.toFixed(3)
            dollarAmount = (qty*dollarRate).toFixed(3)
        }
        // Todo 
        console.log(qty, nairaAmount, dollarAmount);
        let reference = generateUniqueId({
            length: 15,
            useLetters: true,
          });
        const newBalance = balance - qty;
        await Internal.create({userId:user_id, coinId, qty, sellBy, dollarAmount, nairaAmount, reference});
        await Coin.update({balance:newBalance}, {where:{userId: user_id, coinId}});
        
        
        // const paybuymaxAmount = nairaAmount;
        // nairaAmount = 10;
        const userAcctBal = Number(user.wallet);
        const newWalletBalance = (nairaAmount+ userAcctBal).toFixed(3);
        await Users.update({wallet:newWalletBalance}, {where:{id: user_id}});
        const coinTypes = product.name;
        const symbol = product.symbol;
        const now = moment();
        // nairaAmount = Intl.NumberFormat('de-DE', { style: 'currency', currency: 'NGN' }).format(nairaAmount);
        // dollarAmount = Intl.NumberFormat('de-DE', { style: 'currency', currency: 'USD' }).format(dollarAmount);
        const output = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Paybuymax Receipt</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">
            <style>
                .receipt-div{
                    border: 1px solid rgb(202, 202, 202);
                    padding: 12px;
                }
                .receipt-div img{
                    padding-bottom: 30px;
                }
                .receipt-div .header-alert{
                    background-color: #BB702B;
                    padding: 10px;
                    color: #fff;
                    font-size: 20px;
                }
                .receipt-div .amount-div{
                    padding: 30px 10px !important;
                    background-color: rgb(238, 238, 238);
                }
                .receipt-div .amount-div .amount{
                    margin-top: -10px;
                    font-size: 45px;
                    color: #BB702B;
                    font-weight: bold;
                }
                .receipt-div .amount-div p{
                    font-size: 20px;
                }
                .receipt-div .details p{
                    font-size: 15px;
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <main>
                <div class="container py-2">
                    <div class="row">
                        <div class="col-sm-3"></div>
                        <div class="col-sm-6">
                            <div class="receipt-div">
                                <div class="row">
                                    <div class="col-sm-12 text-center">
                                        <img src="https://res.cloudinary.com/yhomi1996/image/upload/v1635179234/ecoin/logo_creup6.png" alt="Paybuymax Logo">
                                    </div>
                                    <div class="col-sm-12 text-center header-alert">
                                    Your Transaction was successful
                                    </div>
                                    <div class="col-sm-12 text-center amount-div">
                                        <h1 class="amount">You sold ${qty} ${symbol}</h1>
                                        <p>from Your Paybuymax wallet</p>
                                    </div>
                                    <div class="col-sm-12 py-3 text-center" style="font-size: 25px; font-weight: bold; text-decoration: underline;">
                                        Transaction Details
                                    </div>
                                    <div class="col-sm-12 details">
                                        <p><span>Coin Type:</span> <span style="float: right;">${coinTypes}</span></p>
                                        <hr size="3">
                                        <p><span>Quantity:</span> <span style="float: right;">${qty} ${symbol}</span></p>
                                        <hr size="3">
                                        <p><span>USD Amount:</span> <span style="float: right;">${dollarAmount}</span></p>
                                        <hr size="3">
                                        <p><span>Naira Amount:</span> <span style="float: right;">${nairaAmount}</span></p>
                                        <hr size="3">
                                        <p><span>Transaction Reference:</span> <span style="float: right;">${reference}</span></p>
                                        <hr size="3">
                                        <p><span>Wallet Credit:</span> <span style="float: right;">N${nairaAmount.toFixed(3)}</span></p>
                                        <hr size="3">
                                        <p><span>Transaction Date:</span> <span style="float: right;">${now}</span></p>
                                        <hr size="3">
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-sm-3"></div>
                    </div>
                </div>
            </main>
        </body>
        </html>`;
      let transporter = await nodemailer.createTransport({
        host: parameters.EMAIL_HOST,
        port: parameters.EMAIL_PORT,
        secureConnection: true, // true for 465, false for other ports
        auth: {
          user: parameters.EMAIL_USERNAME, // generated ethereal user
          pass: parameters.EMAIL_PASSWORD, // generated ethereal password
        },
        
      });

      // send mail with defined transport object
      let mailOptions = {
        from: ` "PayBuyMax" <${parameters.EMAIL_USERNAME}>`, // sender address
        to: `${user.email}`, // list of receivers
        subject: "[PayBuyMax] Transaction Receipt", // Subject line
        text: "PayBuyMax", // plain text body
        html: output, // html body
      };
      const sendMail = await transporter.sendMail(mailOptions, async(err, info) => {
        if (err) {
            console.log(err);
          
        } else {
            // return res.json({success:"Done"});
            req.flash("success", "Transaction Successful");
            res.redirect("back");
        }
      });

        
    } catch (error) {
        req.flash('error', "Server error");
        res.redirect("back");
    }
}

exports.BuyCoinFromInternalWallet = async(req, res) =>{
    try {
        const {amount, coinId, code, user_id, medium, conRate} = req.body;
        let qty ;
        let dollarAmount;
        let nairaAmount;
        let rate = Number(conRate)
        // console.log(req.body);
        
        const user = await Users.findOne({where:{id: user_id}});
        const wallet = await Coin.findOne({where:{userId: user_id, coinId}});
        const product = await Product.findOne({where:{id:coinId}});
        const balance = Number(wallet.balance);
        if (code  !== user.oauth_token) {
            req.flash('warning', "Wrong Transaction Code");
            res.redirect("back");
        }

        const customerName = user.name ? user.name : null;
        const customerEmail = user.email;
        let dollarRate = Number(product.dollarRate);
        let nairaRate = Number(product.rate);

        if (medium === "usd") {
            dollarAmount = amount;
            qty = (amount/dollarRate);
            nairaAmount = amount*rate
        }else if (medium === "naira") {
            nairaAmount = Number(amount);
            qty = (amount/nairaRate);
            dollarAmount = (amount/rate).toFixed(3)
        }else if (medium === "qty") {
            qty = amount;
            nairaAmount = qty*nairaRate.toFixed(3)
            dollarAmount = (qty*dollarRate).toFixed(3)
        }

        let reference = generateUniqueId({
            length: 15,
            useLetters: true,
          });

          
        const userWallet = Number(user.wallet);
        const naiaraBalance = userWallet - nairaAmount
        await Users.update({wallet:naiaraBalance},{where:{id:user.id}})
        
        const newBal = balance + qty;

        await Coin.update({balance: newBal}, {where:{userId: user_id, coinId}})
        console.log("Coin Updated");
        
        await InternalBuy.create({
            userId:user_id, 
            customerName, 
            exchange:conRate,
            customerEmail,
            coinId, qty, 
            medium, 
            dollarAmount, 
            nairaAmount, 
            reference
        });
        
        
        
        const coinTypes = product.name;
        const symbol = product.symbol;
        const now = moment();
        // nairaAmount = Intl.NumberFormat('de-DE', { style: 'currency', currency: 'NGN' }).format(nairaAmount);
        // dollarAmount = Intl.NumberFormat('de-DE', { style: 'currency', currency: 'USD' }).format(dollarAmount);
        const output = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Paybuymax Receipt</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">
            <style>
                .receipt-div{
                    border: 1px solid rgb(202, 202, 202);
                    padding: 12px;
                }
                .receipt-div img{
                    padding-bottom: 30px;
                }
                .receipt-div .header-alert{
                    background-color: #BB702B;
                    padding: 10px;
                    color: #fff;
                    font-size: 20px;
                }
                .receipt-div .amount-div{
                    padding: 30px 10px !important;
                    background-color: rgb(238, 238, 238);
                }
                .receipt-div .amount-div .amount{
                    margin-top: -10px;
                    font-size: 45px;
                    color: #BB702B;
                    font-weight: bold;
                }
                .receipt-div .amount-div p{
                    font-size: 20px;
                }
                .receipt-div .details p{
                    font-size: 15px;
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <main>
                <div class="container py-2">
                    <div class="row">
                        <div class="col-sm-3"></div>
                        <div class="col-sm-6">
                            <div class="receipt-div">
                                <div class="row">
                                    <div class="col-sm-12 text-center">
                                        <img src="https://res.cloudinary.com/yhomi1996/image/upload/v1635179234/ecoin/logo_creup6.png" alt="Paybuymax Logo">
                                    </div>
                                    <div class="col-sm-12 text-center header-alert">
                                    Your Transaction was successful
                                    </div>
                                    <div class="col-sm-12 text-center amount-div">
                                        <h1 class="amount">You bought ${qty} ${symbol}</h1>
                                        <p>from Paybuymax </p>
                                    </div>
                                    <div class="col-sm-12 py-3 text-center" style="font-size: 25px; font-weight: bold; text-decoration: underline;">
                                        Transaction Details
                                    </div>
                                    <div class="col-sm-12 details">
                                        <p><span>Coin Type:</span> <span style="float: right;">${coinTypes}</span></p>
                                        <hr size="3">
                                        <p><span>Quantity:</span> <span style="float: right;">${qty} ${symbol}</span></p>
                                        <hr size="3">
                                        <p><span>USD Amount:</span> <span style="float: right;">${dollarAmount}</span></p>
                                        <hr size="3">
                                        <p><span>Naira Amount:</span> <span style="float: right;">${nairaAmount}</span></p>
                                        <hr size="3">
                                        <p><span>Transaction Reference:</span> <span style="float: right;">${reference}</span></p>
                                        <hr size="3">
                                        <p><span>Wallet Debit:</span> <span style="float: right;">N${nairaAmount}</span></p>
                                        <hr size="3">
                                        <p><span>Transaction Date:</span> <span style="float: right;">${now}</span></p>
                                        <hr size="3">
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-sm-3"></div>
                    </div>
                </div>
            </main>
        </body>
        </html>`;
      let transporter = await nodemailer.createTransport({
        host: parameters.EMAIL_HOST,
        port: parameters.EMAIL_PORT,
        secureConnection: true, // true for 465, false for other ports
        auth: {
          user: parameters.EMAIL_USERNAME, // generated ethereal user
          pass: parameters.EMAIL_PASSWORD, // generated ethereal password
        },
        
      });

      // send mail with defined transport object
      let mailOptions = {
        from: ` "PayBuyMax" <${parameters.EMAIL_USERNAME}>`, // sender address
        to: `${user.email}`, // list of receivers
        subject: "[PayBuyMax] Transaction Receipt", // Subject line
        text: "PayBuyMax", // plain text body
        html: output, // html body
      };
      const sendMail = await transporter.sendMail(mailOptions, async(err, info) => {
        if (err) {
            console.log(err);
          
        } else {
            // return res.json({success:"Done"});
            req.flash("success", "Transaction Successful");
            res.redirect("back");
        }
      });

        
    } catch (error) {
        req.flash('error', "Server error");
        res.redirect("back");
    }
}

exports.sendConfirmationCode = async(req, res) =>{
    try {
        const {userId, coinId, amount, medium} = req.body;
        // console.log(req.body);
        const user = await Users.findOne({where:{id: userId}});
        const wallet = await Coin.findOne({where:{userId: userId, coinId}, include:['coinTypes']});
        const code = Math.floor(100000 + Math.random() * 900000);
        
        // get coin ballance
        const balance = Number(wallet.balance);
        // console.log(balance);

        // find coin
        const product = await Product.findOne({where:{id:coinId}});

        // find coin exchange rate
        var dollarRate = Number(product.dollarRate);
        var nairaRate = Number(product.rate);
        // console.log(dollarRate,nairaRate );

        // covert coin balance to respective exchange
        let dollarAmount = (balance * dollarRate);
        dollarAmount.toFixed(3)
        let nairaAmount = (balance * nairaRate);
        nairaAmount.toFixed(3)
        // console.log(nairaAmount, dollarAmount);
        
        if (medium === "usd" && (amount > dollarAmount)) {
            return res.json({msg:"Your balance is Low. Can't Perform this transaction"});
        }else if (medium === "naira" && (amount > nairaAmount)) {
            return res.json({msg:"Your balance is Low. Can't Perform this transaction"});
        }else if (medium === "qty" && (amount > balance)) {
            return res.json({msg:"Your balance is Low. Can't Perform this transaction"});
        }else{

            const output = `<html>
            <head>
            <title>TRANSACTION CONFIRMATION</title>
            </head>
            <body>
            <p>Use The Code Below to ComPlete Your Transaction. It will Expire in 3 minutes </p>
            <h2> ${code} </h2>
            </body>
                    </html>`;
            let transporter = await nodemailer.createTransport({
                host: parameters.EMAIL_HOST,
                port: parameters.EMAIL_PORT,
                secureConnection: true, // true for 465, false for other ports
                auth: {
                user: parameters.EMAIL_USERNAME, // generated ethereal user
                pass: parameters.EMAIL_PASSWORD, // generated ethereal password
                },
                
            });

            // send mail with defined transport object
            let mailOptions = {
                from: ` "PayBuyMax" <${parameters.EMAIL_USERNAME}>`, // sender address
                to: `${user.email}`, // list of receivers
                subject: "[PayBuyMax] Transaction Code", // Subject line
                text: "PayBuyMax", // plain text body
                html: output, // html body
            };
            const sendMail = await transporter.sendMail(mailOptions, async(err, info) => {
                if (err) {
                    console.log(err);
                return res.json({msg:"Error sending mail, please try again"});
                
                } else {
                    await Users.update({oauth_token: code}, {where:{id: userId}})
                    return res.json({success:"Code Sent"});
                
                }
            });
        }
        // return res.json({user, wallet, code});
    } catch (error) {
        req.flash('error', "Server error");
        res.redirect("back");
    }
}

exports.testQuery = (req,res) =>{
    return res.send({msg:req.query.activity})
}

exports.sendConfirmationCodeForBuy = async(req, res) =>{
    try {
        const {userId, coinId, amount, buyBy, exchange} = req.body;
        console.log(req.body);
        const user = await Users.findOne({where:{id: userId}});
        const wallet = await Coin.findOne({where:{userId: userId, coinId}, include:['coinTypes']});
        const product = await Product.findOne({where:{id:coinId}});

        // generate random code
        const code = Math.floor(100000 + Math.random() * 900000);
        
        // get user ballance
        const balance = Number(user.wallet);
        const rate = Number(exchange)
        const amt = Number(amount);
        const nairaRate = Number(product.rate);
        // console.log(balance);

        let convertedAmt;
        if (buyBy === "usd") {
            convertedAmt = amt * rate;
        }else if (buyBy === "naira"){
            convertedAmt = amt
        }else if (buyBy === "qty"){
            convertedAmt = amt * nairaRate
        }
        
        if (convertedAmt > balance) {
            return res.json({success:false, msg:"Your balance is Low. Can't Perform this transaction"});
        }else{

            const output = `<html>
            <head>
            <title>TRANSACTION CONFIRMATION</title>
            </head>
            <body>
            <p>Use The Code Below to ComPlete Your Transaction. It will Expire in 3 minutes </p>
            <h2> ${code} </h2>
            </body>
                    </html>`;
            let transporter = await nodemailer.createTransport({
                host: parameters.EMAIL_HOST,
                port: parameters.EMAIL_PORT,
                secureConnection: true, // true for 465, false for other ports
                auth: {
                user: parameters.EMAIL_USERNAME, // generated ethereal user
                pass: parameters.EMAIL_PASSWORD, // generated ethereal password
                },
                
            });

            // send mail with defined transport object
            let mailOptions = {
                from: ` "PayBuyMax" <${parameters.EMAIL_USERNAME}>`, // sender address
                to: `${user.email}`, // list of receivers
                subject: "[PayBuyMax] Transaction Code", // Subject line
                text: "PayBuyMax", // plain text body
                html: output, // html body
            };
            const sendMail = await transporter.sendMail(mailOptions, async(err, info) => {
                if (err) {
                    console.log(err);
                return res.json({msg:"Error sending mail, please try again"});
                
                } else {
                    await Users.update({oauth_token: code}, {where:{id: userId}})
                    return res.json({success: true, msg:"Code Sent"});
                
                }
            });
        }
        // return res.json({user, wallet, code});
    } catch (error) {
        req.flash('error', "Server error");
        res.redirect("back");
    }
}

exports.getExchange = async(req,res)=>{
    try {
        const {id} = req.params
        const product = await Product.findOne({where:{id}})
        return res.json(product)
    } catch (error) {
        return res.send({msg:error.response})
    }
}

exports.getExchangeRate = async(req,res)=>{
    try {
        const {id} = req.params
        const rate = await Rate.findOne({where:{id}})
        return res.json(rate)
    } catch (error) {
        return res.send({msg:error.response})
    }
}

exports.checkBalance = async(req,res)=>{
    try {
        const {userId,coinId} = req.params
        const coin = await Coin.findOne({where:{userId, coinId}})
        return res.json(coin)
    } catch (error) {
        return res.send({msg:error.response})
    }
}

exports.generateReceiptForExternal = async(req, res) =>{
    try {
        const admin = await Admins.findOne({where:{id:req.session.adminId}});
        const product = await Product.findAll();
        res.render("dashboards/Trader/external",{
            admin,
            products:product
        })
    } catch (error) {
        req.flash('error', "Server error");
        res.redirect("back");
    }
}

exports.editExchangeRate = async(req, res) =>{
    try {
        const admin = await Admins.findOne({where:{id:req.session.adminId}});
        const rate = await Rate.findOne({where:{id:req.params.id}});
        res.render("dashboards/edit_rate",{
            admin,
            rate
        })
    } catch (error) {
        req.flash('error', "Server error");
        res.redirect("back");
    }
}

exports.generateReceiptForGiftCard = async(req, res) =>{
    try {
        const admin = await Admins.findOne({where:{id:req.session.adminId}});
        const product = await Card.findAll();
        res.render("dashboards/Trader/gift-card",{
            admin,
            products:product
        })
    } catch (error) {
        req.flash('error', "Server error");
        res.redirect("back");
    }
}

exports.createReceiptForGiftCard = async(req, res) =>{
    try {
        const {name, email, acctName, acctNumber, bankName, cardId, quantity, amountPaid, traderId} = req.body;
        console.log(req.body);
        let reference = generateUniqueId({
            length: 15,
            useLetters: true,
        });
        const gift = await GiftCard.create({
            name,
            email,
            traderId,
            cardId,
            acctName,
            acctNumber,
            bankName,
            reference,
            quantity,
            amountPaid
        });
        req.flash('succes', "Receipt Generated");
        res.redirect("/pending-gift-card/transaction");
    } catch (error) {
        req.flash('error', "Server error");
        res.redirect("back");
    }
}

exports.getPendingExternalTransaction = async(req, res)=>{
    try {
        const transactions = await External.findAll({where:{status:"pending", traderId: req.session.adminId}, include:["coin","trader"],order: [
            ['createdAt', 'DESC'],
        ],});
        res.render("dashboards/Trader/unapproved_external",{
            transactions,
            moment
        })
        // return res.json({transactions})
    } catch (error) {
        req.flash('error', "Server error");
        res.redirect("back");
    }
}

exports.getPendingGiftCardTransaction = async(req, res)=>{
    try {
        
        const transactions = await GiftCard.findAll({where:{status:"pending", traderId: req.session.adminId}, include:["card","trader"], order: [
            ['createdAt', 'DESC'],
        ],});
        console.log(transactions);
        res.render("dashboards/Trader/unapproved_external_gift_card",{
            transactions,
            moment
        })
        // return res.json({transactions})
    } catch (error) {
        req.flash('error', "Server error");
        res.redirect("back");
    }
}

exports.getPendingInternalTransaction = async(req, res)=>{
    try {
        const transactions = await InternalBuy.findAll({include:["coin", "user"], order:[["createdAt", "DESC"]]});
        
        res.render("dashboards/Trader/unapproved_internal",{
            transactions,
            moment
        })
        // return res.json({transactions})
    } catch (error) {
        req.flash('error', "Server error");
        res.redirect("back");
    }
}

exports.getInternalSellTransaction = async(req, res)=>{
    try {
        const transactions = await Internal.findAll({include:["coin", "user"], order:[["createdAt", "DESC"]]});
        
        res.render("dashboards/Trader/internal_sell",{
            transactions,
            moment
        })
        // return res.json({transactions})
    } catch (error) {
        req.flash('error', "Server error");
        res.redirect("back");
    }
}

exports.getMyInternalSellTransaction = async(req, res)=>{
    try {
        const transactions = await Internal.findAll({where:{userId:req.session.userId}, include:["coin", "user"], order:[["createdAt", "DESC"]]});
        const messages = await AdminMessages.findAll();
        const user = await Users.findOne({where:{id:req.session.userId}})
        res.render("dashboards/users/internal_sell",{
            transactions,
            moment,
            messages,
            user
        })
        // return res.json({transactions})
    } catch (error) {
        req.flash('error', "Server error");
        res.redirect("back");
    }
}

exports.getMyInternalBuyTransaction = async(req, res)=>{
    try {
        const transactions = await InternalBuy.findAll({where:{userId:req.session.userId}, include:["coin", "user"], order:[["createdAt", "DESC"]]});
        const messages = await AdminMessages.findAll();
        const user = await Users.findOne({where:{id:req.session.userId}})
        res.render("dashboards/users/internal_buy",{
            transactions,
            moment,
            messages,
            user
        })
        // return res.json({transactions})
    } catch (error) {
        req.flash('error', "Server error");
        res.redirect("back");
    }
}

exports.viewMyInternalSold = async(req, res)=>{
    try {
        const transaction = await Internal.findOne({where:{id:req.params.id}, include:["coin", "user"], order:[["createdAt", "DESC"]]});
        const messages = await AdminMessages.findAll();
        const user = await Users.findOne({where:{id:req.session.userId}})
        res.render("dashboards/users/view_internal_sell",{
            transaction,
            moment,
            messages,
            user
        })
        // return res.json({transactions})
    } catch (error) {
        req.flash('error', "Server error");
        res.redirect("back");
    }
}

exports.viewMyInternalBuy = async(req, res)=>{
    try {
        const transaction = await InternalBuy.findOne({where:{id:req.params.id}, include:["coin", "user"], order:[["createdAt", "DESC"]]});
        const messages = await AdminMessages.findAll();
        const user = await Users.findOne({where:{id:req.session.userId}})
        res.render("dashboards/users/view_internal_buy",{
            transaction,
            moment,
            messages,
            user
        })
        // return res.json({transactions})
    } catch (error) {
        req.flash('error', "Server error");
        res.redirect("back");
    }
}

exports.getApprovedExternalTransaction = async(req, res)=>{
    try {
        const transactions = await External.findAll({where:{status:"approved", traderId: req.session.adminId}, include:["coin","trader"]});
        res.render("dashboards/Trader/approved_external",{
            transactions,
            moment
        })
    } catch (error) {
        req.flash('error', "Server error");
        res.redirect("back");
    }
}

exports.getApprovedGiftCardTransaction = async(req, res)=>{
    try {
        const transactions = await GiftCard.findAll({where:{status:"approved", traderId: req.session.adminId}, include:["card","trader"]});
        console.log(transactions);
        res.render("dashboards/Trader/approved_gift_card",{
            transactions,
            moment
        })
    } catch (error) {
        req.flash('error', "Server error");
        res.redirect("back");
    }
}

exports.getApprovedInternalTransaction = async(req, res)=>{
    try {
        const transactions = await InternalBuy.findAll({where:{status:"approved"}, include:["coin","user"], order:[["createdAt", "DESC"]]});
        res.render("dashboards/Trader/approved_internal",{
            transactions,
            moment
        })
    } catch (error) {
        req.flash('error', "Server error");
        res.redirect("back");
    }
}

exports.viewPendingExternalTx = async(req, res)=>{
    try {
        const transaction = await External.findOne({where:{id:req.params.id}, include:["coin","trader"]});
        res.render("dashboards/Trader/view_pending",{
            transaction,
            moment
        })
    } catch (error) {
        req.flash('error', "Server error");
        res.redirect("back");
    }
}

exports.viewPendingGiftCardTx = async(req, res)=>{
    try {
        const transaction = await GiftCard.findOne({where:{id:req.params.id}, include:["card","trader"]});
        res.render("dashboards/Trader/view_pending_gift_card",{
            transaction,
            moment
        })
    } catch (error) {
        req.flash('error', "Server error");
        res.redirect("back");
    }
}

exports.viewPendingInternalTx = async(req, res)=>{
    try {
        const transaction = await InternalBuy.findOne({where:{id:req.params.id}, include:["coin","user"]});
        res.render("dashboards/Trader/view_internal_pending",{
            transaction,
            moment
        })
    } catch (error) {
        req.flash('error', "Server error");
        res.redirect("back");
    }
}

exports.viewInternalSellTx = async(req, res)=>{
    try {
        const transaction = await Internal.findOne({where:{id:req.params.id}, include:["coin","user"]});
        res.render("dashboards/Trader/view_internal_sell",{
            transaction,
            moment
        })
    } catch (error) {
        req.flash('error', "Server error");
        res.redirect("back");
    }
}

exports.createReceiptForExternalTransaction = async(req, res)=>{
    try {
        const {name, email, quantity, coinId, rate, medium, transaction, acctName, acctNumber, bankName} = req.body;
        const trader = await Admins.findOne({where:{id:req.session.adminId}});
        if (!name || !email || !quantity || !coinId) {
            req.flash("danger", "Please Fill all Fields!");
            res.redirect("back");
        }
        const product = await Product.findOne({where:{id:coinId}});
        let qty ;
        let dollarAmount;
        let nairaAmount;
        let dollarRate = Number(product.dollarRate);
        let nairaRate = Number(product.rate);
        console.log(req.body);
        let reference = generateUniqueId({
            length: 15,
            useLetters: true,
          });

        if (medium === "usd") {
            dollarAmount = Number(quantity);
            qty = (quantity/dollarRate);
            nairaAmount = qty*nairaRate.toFixed(3)
        }else if (medium === "naira") {
            nairaAmount = Number(quantity);
            qty = (quantity/nairaRate);
            dollarAmount = (qty*dollarRate).toFixed(3)
        }else if (medium === "qty") {
            qty = Number(quantity);
            nairaAmount = qty*nairaRate.toFixed(3)
            dollarAmount = (qty*dollarRate).toFixed(3)
        }

        const request = {
            name,
            email,
            reference,
            traderId: trader.id,
            coinId,
            currentRate: nairaRate,
            currentDollarRate: dollarRate,
            sellBy: medium,
            dollarAmount,
            quantity: qty,
            amount: nairaAmount,
            transaction,
            acctName,
            acctNumber,
            bankName
        }
        await External.create(request);
        req.flash("success", "Transaction generated successfully");
        res.redirect("back");
    } catch (error) {
        req.flash('error', "Server error");
        res.redirect("back");
    }
}

exports.sendConfirmationCodeForWithdraw = async(req, res) =>{
    try {
        const {userId, amount,type } = req.body;
        const user = await Users.findOne({where:{id: userId}});
        
        
        const code = Math.floor(100000 + Math.random() * 900000);
        let balance;
        // Todo 
        if (type === "coin") {
            const coin = await Coin.findOne({where:{userId, coinId:req.body.coinId}, include: ["coinTypes"]});
            
            balance = Number(coin.balance);
            const maxWithdrawal = Number(coin.coinTypes.maxWithdrawal);
            const maximumWithdrawal = balance* (maxWithdrawal/100)
            // console.log(coin, maximumWithdrawal);
            if (balance < amount ) {
                return res.json({success: false,msg:"Your Coin balance is Low"});
            }else if (amount >= maximumWithdrawal) {
                return res.json({success: false,msg:`You exceed the maximum withdrawal. You can only withdraw ${maxWithdrawal}% of your coin`});
            }
        }

        if (type === "money") {
            balance = Number(user.wallet);
            walletBalance = balance - amount
            if (balance <= 500 || balance < amount) {
                return res.json({success: false,msg:"Your Account balance is Low. Can't Perform this transaction"});
            }else if (walletBalance <= 500) {
                return res.json({success: false,msg:"Low Balance: Your Minimum balance is N500"});
            }
        }
       

        const output = `<html>
        <head>
          <title>TRANSACTION CONFIRMATION</title>
        </head>
        <body>
        <p>Use The Code Below to ComPlete Your Transaction. It will Expire in 3 minutes </p>
        <h2> ${code} </h2>
        </body>
                </html>`;
      let transporter = nodemailer.createTransport({
        host: parameters.EMAIL_HOST,
        port: parameters.EMAIL_PORT,
        secureConnection: true, // true for 465, false for other ports
        auth: {
          user: parameters.EMAIL_USERNAME, // generated ethereal user
          pass: parameters.EMAIL_PASSWORD, // generated ethereal password
        },
        
      });

      // send mail with defined transport object
      let mailOptions = {
        from: ` "PayBuyMax" <${parameters.EMAIL_USERNAME}>`, // sender address
        to: `${user.email}`, // list of receivers
        subject: "[PayBuyMax] Transaction Code", // Subject line
        text: "PayBuyMax", // plain text body
        html: output, // html body
      };
      const sendMail = transporter.sendMail(mailOptions, async (err, info) => {
          if (err) {
              console.log(err);
              return res.json({ success: false, msg: "Error sending mail, please try again" });

          } else {
              await Users.update({ oauth_token: code }, { where: { id: userId } });
              return res.json({ success: true, msg: "Code Sent" });

          }
      });

        // return res.json({user, wallet, code});
    } catch (error) {
        req.flash('error', "Server error");
        res.redirect("back");
    }
}

exports.sellFromInternalWallet = async(req, res) =>{
    try {
        const unansweredChats = await Chats.findAll({
            where: {
                [Op.and]: [{
                        receiver_id: {
                            [Op.eq]: req.session.userId
                        }
                    },
                    {
                        read_status: {
                            [Op.eq]: 0
                        }
                    }
                ]
            },
            include: ["user"],
        });
        const user = await Users.findOne({where:{id: req.session.userId}, include:[
            {
                model: Coin,
                as: "coins",
                include: {
                    model: Product,
                    as: "coinTypes"
                }
            }
        ] })
        const referral = await Referrals.findAll({
            where: {
                referral_id: {
                    [Op.eq]: req.session.userId
                }
            }
        });
        
        const bank = await CryptBank.findOne({});

        const dollar = await DollarValue.findOne({})
        const products = await Product.findAll();
        const coins = user.coins
        res.render("dashboards/users/internal_wallet", {
            user: user,
            email: user.email,
            phone: user.phone,
            wallet: user.wallet,
            referral: user.referral_count,
            referral_amount: referral.length * 1000,
            messages: unansweredChats,
            moment,
            products,
            coins
        });
    } catch (error) {
        req.flash('error', "Server error");
        res.redirect("back");
    }
}

const fetchRates = () =>{
    axios.get("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false")
    .then(res =>{
        // console.log(res);
        const data = res.data;
        return data;
        
    }).catch(err =>{
        console.log(err);
    })
}

exports.getMethodForSelling = async(req,res)=>{
    try {
        const unansweredChats = await Chats.findAll({
            where: {
                [Op.and]: [{
                        receiver_id: {
                            [Op.eq]: req.session.userId
                        }
                    },
                    {
                        read_status: {
                            [Op.eq]: 0
                        }
                    }
                ]
            },
            include: ["user"],
        });
        const user = await Users.findOne({
            where: {
                id: {
                    [Op.eq]: req.session.userId
                }
            }
        });
        const referral = await Referrals.findAll({
            where: {
                referral_id: {
                    [Op.eq]: req.session.userId
                }
            }
        });
        
        const bank = await CryptBank.findOne({});

        const dollar = await DollarValue.findOne({});

        let coin = [];
        const resp = await axios.get("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false");
        coin = resp.data;
        coin = coin.slice(0,9)

        res.render("dashboards/users/method", {
            user: user,
            email: user.email,
            phone: user.phone,
            wallet: user.wallet,
            referral: user.referral_count,
            referral_amount: referral.length * 1000,
            messages: unansweredChats,
            moment,
            coins:coin
        });
    } catch (error) {
        req.flash('error', "Server error");
        res.redirect("back");
    }
}

exports.getRates = async(req,res) =>{
    try {
        // const coin = fetchRates(); 
        // console.log(coin);
        const unansweredChats = await Chats.findAll({
            where: {
                [Op.and]: [{
                        receiver_id: {
                            [Op.eq]: req.session.userId
                        }
                    },
                    {
                        read_status: {
                            [Op.eq]: 0
                        }
                    }
                ]
            },
            include: ["user"],
        });
        const user = await Users.findOne({
            where: {
                id: {
                    [Op.eq]: req.session.userId
                }
            }
        });
        const referral = await Referrals.findAll({
            where: {
                referral_id: {
                    [Op.eq]: req.session.userId
                }
            }
        });
        
        const bank = await CryptBank.findOne({});

        const dollar = await DollarValue.findOne({});
        let loading = false;
        let coin = [];
        const resp = await axios.get("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false");
        coin = resp.data

        res.render("dashboards/users/rates", {
            user: user,
            email: user.email,
            phone: user.phone,
            wallet: user.wallet,
            referral: user.referral_count,
            referral_amount: referral.length * 1000,
            messages: unansweredChats,
            moment,
            coins: coin,
            loading
        });
    } catch (error) {
        req.flash('error', "Server error");
        res.redirect("back");
    }
}