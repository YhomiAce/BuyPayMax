// package imports
const Sequelize = require("sequelize");
const moment = require("moment");
const axios = require('axios');

// local imports
const Users = require("../models").User;
const helpers = require("../helpers/cryptedge_helpers");
const Deposits = require("../models").Deposit;
const Withdrawals = require("../models").Withdrawal;
const History = require("../models").History;
const Chats = require("../models").Chat;
const AdminMessages = require("../models").AdminMessage;
const Transactions = require("../models").Transaction;
const Referrals = require("../models").Referral;
const CryptBank = require("../models").CryptBank;
const DollarValue = require("../models").DollarValue;


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
             res.redirect("/");
        })
            
           
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


exports.withdrawWallet = (req, res, next) => {
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
                
                let wallet = Math.abs(Number(user.wallet));
                let revenue = Math.abs(Number(user.revenue));
                let userTotal = wallet + revenue
                res.render("dashboards/users/user_withdrawing", {
                    user: user,
                    userTotal,
                    wallet,
                    messages: unansweredChats,
                    moment
                });
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

exports.withdrawFromWallet = (req, res, next) => {
    let {
       
        wallet_name,
        wallet_address,
        amount
    } = req.body;
   
    if (!wallet_name || !wallet_address || !amount) {
        req.flash('warning', "Enter all fields");
        res.redirect("back");
    } else if (!helpers.isNumeric(amount)) {
        req.flash('warning', "Enter valid amount");
        res.redirect("back");
    } else {
        // get user wallet
        Users.findOne({
                where: {
                    id: {
                        [Op.eq]: req.session.userId
                    }
                }
            })
            .then(user => {
                if (user) {
                    let type = 'Withdrawal'
                    let desc = 'Withdrawal request initiated'
                    let userWallet = Math.abs(Number(user.wallet));
                    amount = Math.abs(Number(amount));
                    let currentWallet = userWallet - amount;
                    if (amount > userWallet) {
                        req.flash('warning', "Insufficient fund");
                        res.redirect("back");
                    } else {
                        Users.update({
                                wallet: currentWallet
                            }, {
                                where: {
                                    id: req.session.userId
                                }
                            })
                            .then(updatedUser => {
                                let owner = req.session.userId
                                Withdrawals.create({
                                       
                                        amount,
                                        user_id:owner,
                                        wallet_name,
                                        wallet_address,
                                        status: 0
                                    })
                                    .then(withdrawal => {
                                        
                                         History.create({
                                                type,
                                                desc,
                                                value:req.body.amount,
                                                user_id:req.session.userId
                                            })
                                        req.flash('success', "Withdrawal success, awaiting disbursement!");
                                        res.redirect("back");
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
                } else {
                    req.flash('warning', "Session expired");
                    res.redirect("back");
                }
            })
            .catch(error => {
                req.flash('error', "Server error");
                res.redirect("back");
            });
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



exports.unapprovedWithdrawals = (req, res, next) => {
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
            console.log({withdrawals});
            res.render("dashboards/unapproved_withdrawals", {
                withdrawals,
                messages: unansweredChats
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
                status: {
                    [Op.eq]: 1
                }
            },
            include: ["user"],
            order: [
                ['createdAt', 'DESC'],
            ],
        })
        .then(withdrawals => {
            res.render("dashboards/approved_withdrawals", {
                withdrawals: withdrawals,
                messages: unansweredChats,
                moment
            });
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

exports.postApproveWithdrawal = (req, res, next) => {
   let id = req.body.id;
   let amount = req.body.amount
  
    Withdrawals.findOne({
            where: {
                id: {
                    [Op.eq]: id
                }
            }
        })
        .then(withdrawal => {
            if(withdrawal) {
                let owner = withdrawal.user_id
                
                Withdrawals.update({
                    status: 1
                }, {
                    where: {
                        id: {
                            [Op.eq]: id
                        }
                    }
                })
                .then(updatedWithdrawal => {
                    
                     let type = 'Withdrawal'
                    let desc = 'Withdrawal request approved'
                     History.create({
                        type,
                        desc,
                        value:req.body.amount,
                        user_id:owner
                    })
                    req.flash('success', "Withdrawal updated successfully");
                    res.redirect("back");
                })
                .catch(error => {
                    req.flash('error', "Server error");
                    res.redirect("back");
                });
            } else {
                req.flash('error', "Invalid withdrawal");
                    res.redirect("/");
            }
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
                    status: 0
                }, {
                    where: {
                        id: {
                            [Op.eq]: id
                        }
                    }
                })
                .then(updatedWithdrawal => {
                    req.flash('success', "Withdrawal updated successfully");
                    res.redirect("back");
                })
                .catch(error => {
                    req.flash('error', "Server error");
                    res.redirect("back");
                });
            } else {
                req.flash('error', "Invalid withdrawal");
                    res.redirect("/");
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