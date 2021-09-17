// package imports
const Sequelize = require("sequelize");
const moment = require('moment');

// local imports
const parameters = require("../config/params");
const Users = require("../models").User;
const Investments = require("../models").Investment;
const Package = require("../models").Package;
const Chats = require("../models").Chat;
const Investment = require("../models").Investment;
const AdminMessages = require('../models').AdminMessage;
// imports initialization
const Op = Sequelize.Op;


exports.userInvestments = (req, res, next) => {
    AdminMessages.findAll()
    .then(unansweredChats => {
        Investments.findAll({
            where: {
                user_id: {
                    [Op.eq]: req.session.userId
                }
            },
            include: ["package"] ,
            order: [
                ['createdAt', 'DESC'],
            ],
        })
        .then(investments => {
            Users.findOne({
                where:{
                    id:{
                        [Op.eq]: req.session.userId
                    }
                }
            }).then(user=>{
                res.render("dashboards/users/user_investment", {
                investments: investments,
                messages: unansweredChats,
                user,
                moment
            });
            }).catch(err=>{
                res.redirect('back')
            })
            
        })
        .catch(error => {
            console.log(error)
            //res.redirect("/");
            req.flash('error', `Server Error`);
            res.redirect("back");
        });
    })
    .catch(error => {
        console.log(error)
        req.flash('error', "Server error!");
        res.redirect("/");
    });
    
}

exports.viewInvestment = (req, res, next) => {
    AdminMessages.findAll()
    .then(unansweredChats => {
        Investments.findOne({
            where: {
                id: req.params.id
            },
            include: ["package", "user"] ,
            order: [
                ['createdAt', 'DESC'],
            ],
        })
        .then(investments => {
            Users.findOne({
                where:{
                    id:{
                        [Op.eq]: req.session.userId
                    }
                }
            }).then(user=>{
                res.render("dashboards/users/investment_details", {
                investments: investments,
                messages: unansweredChats,
                user,
                moment
            });
            }).catch(err=>{
                res.redirect('back')
            })
            
        })
        .catch(error => {
            console.log(error)
            //res.redirect("/");
            req.flash('error', `Server Error`);
            res.redirect("back");
        });
    })
    .catch(error => {
        console.log(error)
        req.flash('error', "Server error!");
        res.redirect("/");
    });
    
}