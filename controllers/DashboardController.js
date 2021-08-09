// package imports
const Sequelize = require("sequelize");
const moment = require("moment");

// local imports
const Referrals = require("../models").Referral;
const Users = require("../models").User;
const Packages = require("../models").Package;
const Kycs = require("../models").Kyc;
const Investments = require("../models").Investment;
const Chats = require("../models").Chat;
const AdminMessages = require('../models').AdminMessage;
const Admins = require('../models').Admin;

// imports initialization
const Op = Sequelize.Op;


exports.home = async(req, res, next) => {
    try {
        const unansweredChats = await Chats.findAll({where: {sender_id: req.session.userId }});
        const user = await Users.findOne({where: {id: req.session.userId}});
        const referral = await Referrals.findAll({where:{referral_id: req.session.userId}});
        const investment = await  Investments.findAll({where: {user_id: req.session.userId}});
        const activeInvestments = await Investments.findAll({
            where: {
                [Op.and]: [{
                        user_id: {
                            [Op.eq]: req.session.userId
                        }
                    },
                    {
                        expiredAt: {
                            [Op.gte]: moment().format('YYYY-MM-DD HH:mm:ss')
                        }
                    }
                ]
            },
            paranoid: false,
        });
        const kyc = await Kycs.findOne({
            where: {
                user_id: {
                    [Op.eq]: req.session.userId
                }
            }
        })

        if (kyc) {
            res.render("dashboards/users/user_home", {
                user: user,
                kyc: kyc.status,
                wallet: user.wallet,
                revenue:user.revenue,
                referral: referral.length,
                investment: investment.length,
                active_investment: activeInvestments.length,
                messages: unansweredChats,
                moment
            });
        } else {
            res.render("dashboards/users/user_home", {
                user: user,
                kyc: 0,
                wallet: user.wallet,
                revenue:user.revenue,
                referral: referral.length,
                referral_amount: referral.length * 20,
                investment: investment.length,
                active_investment: activeInvestments.length,
                messages: unansweredChats,
                moment
            });
        }
    
    } catch (err) {
        console.log(err);
        req.flash('error', "Server error!");
            res.redirect("/");
    }
     
}

exports.AdminHome = async(req,res,next) =>{
    try {
        const user = await Users.findAll();
        let usersCount = user.length;
        const admins = await Admins.findAll();
        let adminCount = admins.length;
        const packages = await  Packages.findAll();
        let packageCount = packages.length;
        const unansweredChats = await AdminMessages.findAll();
        const referral = await Referrals.findAll();
        const referralCount = referral.length;
        res.render("dashboards/home", {
            usersCount: usersCount,
            adminCount: adminCount,
            activeUsersCount: usersCount,
            referralCount: referralCount,
            packageCount: packageCount,
            users: user,
            messages: unansweredChats,
            moment
      })
    } catch (err) {
        res.redirect("/")
    }
}

exports.agentHome = async(req,res,next) =>{
    try {
        const user = await Users.findAll();
        let usersCount = user.length;
        const admins = await Admins.findAll();
        let adminCount = admins.length;
        const packages = await  Packages.findAll();
        let packageCount = packages.length;
        const unansweredChats = await AdminMessages.findAll();
        const referral = await Referrals.findAll();
        const referralCount = referral.length;
        res.render("dashboards/home", {
            usersCount: usersCount,
            adminCount: adminCount,
            activeUsersCount: usersCount,
            referralCount: referralCount,
            packageCount: packageCount,
            users: user,
            messages: unansweredChats,
            moment
      })
    } catch (err) {
        res.redirect("/")
    }
}

exports.password = (req, res, next) => {
    AdminMessages.findAll()
        .then(unansweredChats => {
            if (req.session.role == 2 || req.session.role == "2" || req.session.role == 3 || req.session.role == "3") {
                res.render("dashboards/users/user_password", {
                    messages: unansweredChats,
                    moment
                });
            } else {
                res.redirect("/");
            }
        })
        .catch(error => {
            req.flash('error', "Server error!");
            res.redirect("/");
        });
}

exports.adminPassword = (req, res, next) => {
    AdminMessages.findAll()
        .then(unansweredChats => {
            
                res.render("dashboards/change_password", {
                    messages: unansweredChats
                });
        })
        .catch(error => {
            req.flash('error', "Server error!");
            res.redirect("/");
        });
}

exports.userReferral = (req, res, next) => {
    AdminMessages.findAll()
        .then(unansweredChats => {
            Referrals.findAll({
                    where: {
                        referral_id: req.session.userId
                    },
                    order: [
                        ['createdAt', 'DESC'],
                    ],
                    include: ["user"],
                })
                .then(referrals => {
                    Users.findOne({
                            where: {
                                id: {
                                    [Op.eq]: req.session.userId
                                }
                            }
                        })
                        .then(user => {
                            res.render("dashboards/users/user_referral", {
                                referrals: referrals,
                                messages: unansweredChats,
                                user: user,
                                moment
                            });
                        })
                        .catch(error => {
                            req.flash('error', "Server error!");
                            res.redirect("/");
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

exports.allReferral = (req, res, next) => {
    AdminMessages.findAll()
        .then(unansweredChats => {
            Referrals.findAll({
                    where: {
                        deletedAt: null
                    },
                    order: [
                        ['createdAt', 'DESC'],
                    ],
                    include: ["referrals", "user"],
                })
                .then(referrals => {
                    res.render("dashboards/all_referrals", {
                        referrals: referrals,
                        messages: unansweredChats,
                        moment
                    });
                })
                .catch(error => {
                    //res.redirect("/");
                    console.log(error);
                });
        })
        .catch(error => {
            req.flash('error', "Server error!");
            res.redirect("/");
        });
}