// package imports
const Sequelize = require("sequelize");
const moment = require("moment");

// local imports
const Referrals = require("../models").Referral;
const Users = require("../models").User;
const Packages = require("../models").Package;
const Kycs = require("../models").KYC;
const Investments = require("../models").Investment;
const Chats = require("../models").Chat;
const AdminMessages = require('../models').AdminMessage;
const Admins = require('../models').Admin;
const Product = require('../models').Product;
const Coin = require('../models').Coin;
const Deposit = require('../models').Deposit;
const Withdrawal = require('../models').Withdrawal;

// imports initialization
const Op = Sequelize.Op;
const params = require("../config/params");


exports.home = async(req, res, next) => {
    try {
        const unansweredChats = await Chats.findAll({where: {sender_id: req.session.userId }});
        const user = await Users.findOne({where:{id: req.session.userId}, include:[
            {
                model: Coin,
                as: "coins",
                include: [ {
                    model: Product,
                    as: "coinTypes"
                }]
            }
        ] })
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
        });
        const coins = user.coins;
        const products = await Product.findAll();
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
                moment,
                coins,
                products,
                reflink: params.REF_LINK
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
                moment,
                coins,
                products,
                reflink: params.REF_LINK
            });
        }
    
    } catch (err) {
        console.log(err);
        req.flash('error', "Server error!");
        res.redirect("/");
    }
     
}

exports.cryptoProducts = async (req,res) =>{
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
        

        res.render("dashboards/users/crypto", {
            user: user,
            email: user.email,
            phone: user.phone,
            wallet: user.wallet,
            messages: unansweredChats,
            moment
        });
    } catch (error) {
        // console.log(err);
        req.flash('error', "Server error!");
        res.redirect("/dashboard");
    }
}

exports.giftCardProducts = async (req,res) =>{
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
        

        res.render("dashboards/users/gift_card", {
            user: user,
            email: user.email,
            phone: user.phone,
            wallet: user.wallet,
            messages: unansweredChats,
            moment
        });
    } catch (error) {
        // console.log(err);
        req.flash('error', "Server error!");
        res.redirect("/dashboard");
    }
}

exports.getCoinsWithProduct = async(req, res)=>{
    try {
        id= "d4ea57b0-ffa0-11eb-b779-49a06245dff8"
        const user = await Users.findOne({where:{id }, include:[
            {
                model: Coin,
                as: "coins",
                include: [ {
                    model: Product,
                    as: "coinTypes"
                }]
            }
        ] });
        const {coins} =  user
        return res.send({user, coins})
    } catch (error) {
        return res.send({err:error.response})
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
        const withdrawal = await Withdrawal.findAll({where:{status:"pending"}, 
            include:[{model: Users, as: "user"}],
            order: [
                ['createdAt', 'DESC'],
            ],
        });
        const deposit = await Deposit.findAll({
           
            where: {
                status: "pending"
            },
            include: ["user"],
            order: [
                ['createdAt', 'DESC'],
            ],
        })
        
        const transaction = [...withdrawal, ...deposit]
       
        res.render("dashboards/Trader/home", {
            usersCount: usersCount,
            adminCount: adminCount,
            activeUsersCount: usersCount,
            referralCount: referralCount,
            packageCount: packageCount,
            users: user,
            messages: unansweredChats,
            moment,
            transaction
      })
    } catch (err) {
        res.redirect("/")
    }
}

exports.getWithdrawal = async(req,res,next) =>{
    try {
        
        const withdrawal = await Withdrawal.findAll({where:{status:"pending"}, 
            include:[{model: Users, as: "user"}],
            order: [
                ['createdAt', 'DESC'],
            ],
        });

        const deposit = await Deposit.findAll({
           
            where: {
                status: "pending"
            },
            include: ["user"],
            order: [
                ['createdAt', 'DESC'],
            ],
        })
        
        const transaction = [...withdrawal, ...deposit]
        return res.send({transaction})
       
       
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

exports.getRefferal = async(req, res) => {
    try {
        const referral = await Referrals.findAll({
            where: {
                referral_id: "d4ea57b0-ffa0-11eb-b779-49a06245dff8"
            },
            order: [
                ['createdAt', 'DESC'],
            ],
            include: [
                {
                    model: Users,
                    as: "user",
                    attributes:["email", "name", "id"]
                }
            ],
        })
        return res.send({referral})
    } catch (error) {
        return res.send({error})
    }
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
                    include: [
                        {
                            model: Users,
                            as: "user",
                            attributes:["email", "name", "id"]
                        }
                    ],
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
                            // console.log(referrals);
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