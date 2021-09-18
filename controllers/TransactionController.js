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
                Product
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
            const week = dur * 4
            const days = week * 7
            const now = moment();
            var new_date = moment(now, "DD-MM-YYYY").add(days, 'days');
            const amtUsed = Number(amount);
            const request = {
                package_id,
                user_id,
                amount:amtUsed,
                earning,
                duration: week,
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
                                    reference
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

exports.withdrawFromWallet = (req, res, next) => {
    let {
        code,
        acct_name,
        acct_number,
        amount,
        bank_name,
        userId
    } = req.body;
   
    if (!acct_name || !acct_number || !amount || !bank_name) {
        req.flash('warning', "Enter all fields");
        res.redirect("back");
    } else {
        // get user wallet
        Users.findOne({
                where: {
                    id: {
                        [Op.eq]: userId
                    }
                }
            })
            .then(user => {
                if (user.oauth_token === code) {
                    let type = 'Withdrawal'
                    let desc = 'Withdrawal request initiated'
                    let userWallet = Math.abs(Number(user.wallet));
                    amount = Math.abs(Number(amount));
                    let currentWallet = userWallet - amount;
                    if (amount > userWallet) {
                        req.flash('warning', "Insufficient fund");
                        res.redirect("back");
                    } else {
                        let reference = generateUniqueId({
                            length: 15,
                            useLetters: true,
                          });
                        Withdrawals.create({
                                amount,
                                user_id:userId,
                                bank_name,
                                acct_name,
                                acct_number,
                                reference
                            })
                            .then(withdrawal => {
                                
                                History.create({
                                    type,
                                    desc,
                                    value:amount,
                                    user_id:userId
                                }).then(hist =>{

                                    req.flash('success', "Withdrawal success, awaiting disbursement!");
                                    res.redirect("back");
                                })
                            })
                            .catch(error => {
                                req.flash('error', "Server error");
                                res.redirect("back");
                            });
                    }
                } else {
                    req.flash('warning', "Invalid Confirmation Code");
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
                status: "completed"
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

exports.postApproveWithdrawal = async(req, res, next) => {
   
   const {id} = req.body;
   const result = await cloudinary.uploader.upload(req.file.path);
   const docPath = result.secure_url;
  
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
                    status: "completed",
                    fileDoc: docPath
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
                    }).then(history =>{
                        Users.findOne({where:{id:owner}}).then(user =>{
                            const userBalance = Number(user.wallet) - Number(withdrawal.amount);
                            const email = user.email;
                            Users.update({wallet: userBalance}, {where:{id: user.id}}).then(update =>{
                                const now  = moment();
                                const output = `<html>
        <head>
          <title>TRANSACTION RECEIPT</title>
        </head>
        <body>
        <p>Your Withdrawal was successful. You just withdraw ${withdrawal.amount} from Your PayBuyMax wallet</p>
        <h2> Receipt </h2>
        <ul>
            
            <li>Amount:.....................N${withdrawal.amount} </li>
            <li>Account Name:.....................${withdrawal.acct_name} </li>
            <li>Account Number:.....................${withdrawal.acct_number} </li>
            <li>Bank Name:.....................${withdrawal.bank_name} </li>
            <li>Transaction Reference:.....................${withdrawal.reference}</li>
            <li>Date:.....................${now}</li>
        </ul>
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
            req.flash('success', "Withdrawal updated successfully");
            res.redirect("back");
          
        }
      });
                    
                            })
                        })
                    })
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

exports.postApproveCoinWithdrawal = async(req, res, next) => {
   try {
    const {id, hash} = req.body;
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
    const update = await WithdrawalCoin.update({status: "approved",fileDoc: hash}, {where: {id}})
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
        const charge = Number(withdrawal.coin.charge);
        const actualAmount = (charge/100) * withdrawAmoount;
        const amountSent = (withdrawAmoount - actualAmount).toFixed(3)
        const output = `<html>
         <head>
           <title>TRANSACTION RECEIPT</title>
         </head>
         <body>
         <p>Your Transfer was successful. You just transfer ${withdrawal.amount} ${withdrawal.coin.symbol} from Your PayBuyMax wallet</p>
         <h2> Receipt </h2>
         <ul>
             
             <li>Amount Transferred:.....................${withdrawal.amount} ${withdrawal.coin.symbol}</li>
             <li>Type of Fund:.....................${withdrawal.coin.name}</li>
             <li>Transferred Charge:.....................${charge}% </li>
             <li>Amount Sent:.....................${amountSent} </li>
             <li>Name:.....................${withdrawal.user.name} </li>
             <li>Email:.....................${withdrawal.user.email} </li>
             <li>Wallet Address:.....................${withdrawal.walletAddress} </li>
             <li>Transaction Reference:.....................${withdrawal.reference}</li>
             <li>Transaction Hash:.....................${hash}</li>
             <li>Date:.....................${now}</li>
         </ul>
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
        const output = `<html>
        <head>
          <title>TRANSACTION RECEIPT</title>
        </head>
        <body>
        <p>Your Transaction was successful. You just sold ${qty} ${symbol} from Your PayBuyMax wallet</p>
        <h2> Receipt </h2>
        <ul>
            <li>Coin Type:.....................${coinTypes}</li>
            <li>Quantity:.....................${qty} ${symbol}</li>
            <li>USD Amount:.....................${ dollarAmount} </li> 
            <li>Naira Amount:.....................${nairaAmount} </li>
            <li>Transaction Reference:.....................${reference}</li>
            <li>Wallet Credit:.....................N${nairaAmount.toFixed(3)}</li>
            <li>Date:.....................${now}</li>
        </ul>
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
        const output = `<html>
        <head>
          <title>TRANSACTION RECEIPT</title>
        </head>
        <body>
        <p>Your Transaction was successful. Request to buy ${qty} ${symbol} from Your PayBuyMax wallet</p>
        <h2> Receipt </h2>
        <ul>
            <li>Coin Type:.....................${coinTypes}</li>
            <li>Quantity:.....................${qty} ${symbol}</li>
            <li>USD Amount:.....................${ dollarAmount} </li> 
            <li>Naira Amount:.....................${nairaAmount} </li>
            <li>Transaction Reference:.....................${reference}</li>
            <li>Transaction Status:.....................Pending</li>
            <li>Wallet Debit:.....................N${nairaAmount}</li>
            <li>Date:.....................${now}</li>
        </ul>
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
        res.redirect("/agent/home");
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
        res.redirect("/agent/home");
    }
}

exports.getPendingInternalTransaction = async(req, res)=>{
    try {
        const transactions = await InternalBuy.findAll({where:{status:"pending"}, include:["coin", "user"]});
        res.render("dashboards/Trader/unapproved_internal",{
            transactions,
            moment
        })
        // return res.json({transactions})
    } catch (error) {
        req.flash('error', "Server error");
        res.redirect("/agent/home");
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
        res.redirect("/agent/home");
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
        res.redirect("/agent/home");
    }
}

exports.getApprovedInternalTransaction = async(req, res)=>{
    try {
        const transactions = await InternalBuy.findAll({where:{status:"approved"}, include:["coin","user"]});
        res.render("dashboards/Trader/approved_internal",{
            transactions,
            moment
        })
    } catch (error) {
        req.flash('error', "Server error");
        res.redirect("/agent/home");
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
        res.redirect("/agent/home");
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
        res.redirect("/agent/home");
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
        res.redirect("/agent/home");
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
            const coin = await Coin.findOne({where:{userId, coinId:req.body.coinId}});
            balance = Number(coin.balance);
            if (balance < amount) {
                return res.json({success: false,msg:"Your Coin balance is Low. Can't Perform this transaction"});
            }
        }

        if (type === "money") {
            balance = Number(user.wallet);
            if (balance < amount) {
                return res.json({success: false,msg:"Your Account balance is Low. Can't Perform this transaction"});
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
      const sendMail = await transporter.sendMail(mailOptions, async(err, info) => {
        if (err) {
            console.log(err);
          return res.json({success: false,msg:"Error sending mail, please try again"});
          
        } else {
            await Users.update({oauth_token: code}, {where:{id: userId}})
            return res.json({success: true,msg:"Code Sent"});
          
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