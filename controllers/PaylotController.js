// package imports
const Sequelize = require("sequelize");
const axios = require('axios');

// local imports
const Withdrawals = require("../models").Withdrawal;
const Users = require("../models").User;
const Deposit = require("../models").Deposit;
const Product = require("../models").Product;
const PrePayment = require("../models").PrePayment;
const parameters = require("../config/params");
const auth = require("../config/auth");
const helpers = require("../helpers/cryptedge_helpers");
const { Service } = require("../helpers/paystack");

// imports initialization
const Op = Sequelize.Op;


exports.initializePayment = async (req, res) =>{
    try {
        const {coinId, userId, amount} = req.body
        const user = await Users.findOne({where:{id:userId}});
        const product = await Product.findOne({where:{id:coinId}});
        const {name} = product
        let currency;
        if (name === "Bitcoin") {
            currency = "BTC"
        }else if (name === "Ethereum") {
            currency = "ETH"
        }else if (name === "Tether") {
            currency = "USDC"
        }

        const reference = 'T-'+Date.now() + '' + Math.floor((Math.random() * 1000000000) + 1);
        console.log(currency, reference);

        const payload = {
            currency: currency,
            reference: reference,
            key: parameters.PAYLOT_KEY,
            email: user.email,
            sendMail: false,
            data: {
                amount: Number(amount),
                currency: "USD"
            }
        }
        // const pass = JSON.stringify(payload)
        // console.log(payload);
        const paylot = await Service.Paylot.initializePayment(payload);
        return res.status(200).send({
            success: true,
            data: paylot,
            payload,
            product
        })
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: "Unable to Connect to Paystack"
        });
    }
}

exports.verifyTransaction = async (req, res) =>{
    try {
        const {reference} = req.params
        const response = await Service.Paylot.verifyPayment(reference);
        
        return res.status(200).send({
            success: true,
            response
        });
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: "Unable to Connect to Paylot"
        });
    }
}

exports.savePrePaymentLog = async (req, res) =>{
    try {
        await PrePayment.create(req.body);
        req.flash('success', "Transaction Verification In Progress.");
        res.redirect("back");
    } catch (error) {
        req.flash('error', "Server error!");
        res.redirect("back");
    }
}
