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
            
            <li>Amount:.....................${withdrawal.amount} </li>
            <li>Account Name:.....................${withdrawal.acct_name} </li>
            <li>Account Number:.....................${withdrawal.acct_number} </li>
            <li>Bank Name:.....................${withdrawal.bank_name} </li>
            <li>Transaction Reference:.....................${withdrawal.reference}</li>
            <li>Transaction Receipt:.....................<a href="${docPath}">Reciept</a></li>
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
        const {amount, coinId, code, user_id} = req.body;
        
        const user = await Users.findOne({where:{id: user_id}});
        const wallet = await Coin.findOne({where:{userId: user_id, coinId}});
        const balance = Number(wallet.balance);
        console.log(user.oauth_token);
        console.log(user);
        if (code  !== user.oauth_token) {
            req.flash('warning', "Wrong Transaction Code");
            res.redirect("back");
        }
        // Todo 
        let reference = generateUniqueId({
            length: 15,
            useLetters: true,
          });
        const newBalance = balance - amount;
        await Internal.create({userId:user_id, coinId, amount, reference});
        await Coin.update({balance:newBalance}, {where:{userId: user_id, coinId}});
        
        const product = await Product.findOne({where:{id:coinId}});
        const paybuymaxAmount = Number(product.rate) * amount;
        const userAcctBal = Number(user.wallet);
        const newWalletBalance = (paybuymaxAmount+ userAcctBal).toFixed(3);
        await Users.update({wallet:newWalletBalance}, {where:{id: user_id}});
        const coinTypes = product.name;
        const symbol = product.symbol;
        const now = moment();
        const output = `<html>
        <head>
          <title>TRANSACTION RECEIPT</title>
        </head>
        <body>
        <p>Your Transaction was successful. You just sold ${amount} ${symbol} from Your PayBuyMax wallet</p>
        <h2> Receipt </h2>
        <ul>
            <li>Coin Type:.....................${coinTypes}</li>
            <li>Quantity:.....................${amount} ${symbol}</li>
            <li>Transaction Reference:.....................${reference}</li>
            <li>Wallet Credit:.....................N${paybuymaxAmount.toFixed(3)}</li>
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
          return res.json({msg:"Error sending mail, please try again"});
          
        } else {
            return res.json({success:"Done"});
          
        }
      });

        req.flash("success", "Done")
        res.redirect("back");
    } catch (error) {
        req.flash('error', "Server error");
        res.redirect("back");
    }
}

exports.sendConfirmationCode = async(req, res) =>{
    try {
        const {userId, coinId, amount} = req.body;
        const user = await Users.findOne({where:{id: userId}});
        const wallet = await Coin.findOne({where:{userId: userId, coinId}});
        const code = Math.floor(100000 + Math.random() * 900000);
        // Todo 
        const balance = Number(wallet.balance);
        console.log(userId, coinId, amount, balance);
        if (balance < amount) {
            return res.json({msg:"Your balance is Low. Can't Perform this transaction"});
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

exports.getPendingExternalTransaction = async(req, res)=>{
    try {
        const transactions = await External.findAll({where:{status:"pending"}, include:["coin","trader"]});
        res.render("dashboards/Trader/unapproved_external",{
            transactions,
            moment
        })
    } catch (error) {
        req.flash('error', "Server error");
        res.redirect("/agent/home");
    }
}

exports.getApprovedExternalTransaction = async(req, res)=>{
    try {
        const transactions = await External.findAll({where:{status:"approved"}, include:["coin","trader"]});
        res.render("dashboards/Trader/approved_external",{
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

exports.createReceiptForExternalTransaction = async(req, res)=>{
    try {
        const {traderId, name, email, amount, quantity, coinId, rate} = req.body;
        if (!amount || !name || !email || !quantity || !coinId) {
            req.flash("danger", "Please Fill all Fields!");
            res.redirect("back");
        }
        let reference = generateUniqueId({
            length: 15,
            useLetters: true,
          });
        await External.create({
            traderId,
            name,
            email,
            amount,
            quantity,
            currentRate: rate,
            coinId,
            reference
        });
        req.flash("success", "Transaction generated successfully");
            res.redirect("back");
    } catch (error) {
        req.flash('error', "Server error");
        res.redirect("back");
    }
}

exports.sendConfirmationCodeForWithdraw = async(req, res) =>{
    try {
        const {userId, amount } = req.body;
        const user = await Users.findOne({where:{id: userId}});
        
        const code = Math.floor(100000 + Math.random() * 900000);
        // Todo 
        const balance = Number(user.wallet);
       
        if (balance < amount) {
            return res.json({msg:"Your balance is Low. Can't Perform this transaction"});
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