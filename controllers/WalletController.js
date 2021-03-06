// package imports
const Sequelize = require("sequelize");
const moment = require("moment");
// local imports
const parameters = require("../config/params");
const Users = require("../models").User;
const Deposits = require("../models").Deposit;
const Transactions = require("../models").Transaction;
const Referrals = require("../models").Referral;
const Chats = require("../models").Chat;
const CryptBank = require("../models").CryptBank;
const DollarValue = require("../models").DollarValue;
const AdminMessages = require("../models").AdminMessage;
const Product = require("../models").Product;
const Coin = require("../models").Coin;
const Wallet = require("../models").Wallet;
const History = require("../models").History;
const Payment = require("../models").Payment;
const Rate = require("../models").Rate;
const PrePayment = require("../models").PrePayment;
const helpers = require("../helpers/cryptedge_helpers");
const notification = require("../helpers/notification");
const generateUniqueId = require("generate-unique-id");

// imports initialization
const Op = Sequelize.Op;

exports.walletPage = (req, res, next) => {
    Chats.findAll({
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
        })
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
                        Referrals.findAll({
                                where: {
                                    referral_id: {
                                        [Op.eq]: req.session.userId
                                    }
                                }
                            })
                            .then(referral => {
                                CryptBank.findOne({})
                                    .then(bank => {
                                        DollarValue.findOne({})
                                            .then(dollar => {
                                              Product.findAll().then(products =>{
                                                res.render("dashboards/users/user_wallet", {
                                                    user: user,
                                                    email: user.email,
                                                    phone: user.phone,
                                                    wallet: user.wallet,
                                                    referral: user.referral_count,
                                                    referral_amount: referral.length * 1000,
                                                    messages: unansweredChats,
                                                    moment,
                                                    products
                                                    
                                                });

                                              })
                                            })
                                            .catch(error => {
                                                req.flash('error', "Server error!");
                                                res.redirect("/");
                                            });
                                    })
                                    .catch(error => {
                                        req.flash('error', "Server error!");
                                        res.redirect("/");
                                    });
                            })
                            .catch(error => {
                                req.flash('error', "Server error!");
                                res.redirect("/");
                            });
                    } else {
                        res.redirect("back");
                    }
                })
                .catch(error => {
                    req.flash('error', "Server error!");
                    res.redirect("/home");
                });
        })
        .catch(error => {
            req.flash('error', "Server error!");
            res.redirect("/home");
        });
}

exports.fundYourWallet = async(req, res) =>{
  try {
    const messages = await AdminMessages.findAll();
    const user = await Users.findOne({where:{id: req.session.userId}, include:[
        {
            model: Coin,
            as: "coins",
            include: {
                model: Product,
                as: "coinTypes"
            }
        }
    ]});
    const coins = user.coins;
    const products = await Product.findAll()

    res.render("dashboards/users/wallet_action", {
      user,
      messages,
      moment,
      coins,
      products
    });

  } catch (error) {
    req.flash('error', "Server error!");
    res.redirect("/home");
  }
}

exports.fundYourCryptoWallet = async(req, res) =>{
  try {
    const messages = await AdminMessages.findAll();
    const user = await Users.findOne({where:{id: req.session.userId}, include:[
        {
            model: Coin,
            as: "coins",
            include: {
                model: Product,
                as: "coinTypes"
            }
        }
    ]});
    const coins = user.coins;
    const products = await Product.findAll()

    res.render("dashboards/users/crypto_wallet", {
      user,
      messages,
      moment,
      coins,
      products
    });

  } catch (error) {
    req.flash('error', "Server error!");
    res.redirect("/home");
  }
}

const fetchPriceInRealTime = async(id)=>{
  const user = setInterval(async() => {
    const user = await Users.findOne({where:{id}, include:[
        {
            model: Coin,
            as: "coins",
            include: {
                model: Product,
                as: "coinTypes"
            }
        }
      ] 
    })
    return user;
  }, 5000);
}

exports.walletBalance = async (req, res) =>{
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
    // const id = req.session.userId
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

    const rate = await Rate.findOne({where:{name:"Dollar"}})
    
    const coins = user.coins;
    console.log(coins);
    res.render("dashboards/users/account_balance", {
      user: user,
      email: user.email,
      phone: user.phone,
      wallet: user.wallet,
      messages: unansweredChats,
      moment,
      coins,
      rate
  });
  } catch (error) {
    req.flash('error', "Server error!");
    res.redirect("/home");
  }
}

exports.FetchWalletBalance = async (req, res) =>{
  try {
    const id = req.session.userId
    const coins = await Coin.findAll({where:{userId: id}, include:[
      {
        model: Product,
        as: "coinTypes",        
      }
    ]});

    return res.status(200).send({status: true, coins})
    
    
  } catch (error) {
    return res.status(500).send({status: false, message: error})
  }
}


exports.getResendLink = (req, res, next) => {
  res.render("resendlink");
};

exports.postResendLink = async (req, res, next) => {
  let email = req.body;
  if (!email) {
    req.flash("warning", "Email is required");
    res.redirect("back");
  } else {
    //check if user exists in the database
    const user = await Users.findOne({
      where: {
        email: {
          [Op.eq]: req.body.email,
        },
      },
    });
    if (user) {
      let email_token = uniqueString();
      const output = `<html>
        <head>
          <title>EMAIL VERIFICATION</title>
        </head>
        <body>
        <p>You requested to change your password, please ignore If you didn't make the request</p>
        <a href='${parameters.SITE_URL}/verifyemail?email=${user.email}&token=${email_token}'>ACTIVATE YOUR ACCOUNT</a>
        </body>
                </html>`;
      let transporter = nodemailer.createTransport({
        host: parameters.EMAIL_HOST,
        port: parameters.EMAIL_PORT,
        secure: true, // true for 465, false for other ports
        auth: {
          user: parameters.EMAIL_USERNAME, // generated ethereal user
          pass: parameters.EMAIL_PASSWORD, // generated ethereal password
        },
      });

      // send mail with defined transport object
      let mailOptions = {
        from: ` "BITMINT OPTION" <${parameters.EMAIL_USERNAME}>`, // sender address
        to: `${user.email}`, // list of receivers
        subject: "[Bitmint] Please activate your account", // Subject line
        text: "BITMINT", // plain text body
        html: output, // html body
      };
      const sendMail =  transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          req.flash("error", "Error sending mail, please try again");
          res.redirect("back");
        } else {
          req.flash("success", "Activation link sent to email");
          res.redirect("/login");
        }
      });
    
      
    } else {
      req.flash("error", "User not found");
          res.redirect("back");
    }
  }
};






exports.editWallet = (req, res, next) => {
  const id = req.params.id;

  Users.findOne({
    where: {
      id: {
        [Op.eq]: id,
      },
    },
  })
    .then((user) => {
      if (user) {
        Coin.findAll({where:{userId: id}, include:["coinTypes"]})
        .then(coins =>{
          // console.log(coins);
          Product.findAll()
          .then(products =>{
            res.render("dashboards/editUser", {
              user: user,
              coins,
              products,
              edit: false
            });

          })

        })
      } else {
        res.redirect("back");
      }
    })
    .catch((error) => {
      req.flash("error", "Server error!");
      res.redirect("back");
    });
};






exports.postEditUser = async (req, res, next) => {
  try {
    const { amount, userId, account } = req.body;

  if (!amount || !account) {
    req.flash("warning", "enter required field");
    res.redirect("back");
  } else if (!helpers.isNumeric(amount)) {
    req.flash("warning", "enter valid ledger amount(digits only)");
    res.redirect("back");
  } else {
      const user = await Users.findOne({
        where: {
          id: {
            [Op.eq]: userId,
          },
        },
      });
        if (account === "wallet") {
          const wallet = Number(user.wallet);
          const newAmt = Number(amount);
          const newBal = wallet + newAmt

          
          await Users.update(
            {
              wallet: newBal,
            },
            {
              where: {
                id: {
                  [Op.eq]: userId,
                },
              },
            }
          )
          const referral = await Referrals.findOne({where:{user_id: userId}});
          const hasTakeBonus = referral.haveCollectedBonus
          if (referral && !hasTakeBonus) {
            const refBonus = newAmt*0.1; // 10% of the amount being deposited
            const userToCollectBonus = await Users.findOne({where:{id: referral.referral_id}});
            const usersBalance = Number(userToCollectBonus.wallet)
            const wallBal = refBonus + usersBalance
            await Users.update({wallet: wallBal}, {where:{id: referral.referral_id}})
            await Referrals.update({haveCollectedBonus: true}, {where:{user_id: userId}})
            console.log('Refferal Bonus added: '+refBonus);
          }
          
        }else{
          const coinAmt = Number(amount);
          const coin = await Coin.findOne({where:{userId, coinId: account}});
          const balance = Number(coin.balance);
          const newBalance = balance + coinAmt
          await Coin.update({balance: newBalance},{where:{userId, coinId: account}})
        }
    }
    req.flash("success", "Deposit Successful");
    res.redirect("back");
  } catch (error) {
    req.flash("error", "Server error!");
    res.redirect("back");
  }
};


exports.fundWallet = async (req, res, next) => {
  try {
    const {email, amount, reference, channel, walletAddress, currency, payment_reference} = req.body
    
    const user = await Users.findOne({
      where: {
          email: {
              [Op.eq]: email
          }
      }
    });
      
    if (user) {
        // add it to transaction as deposits, and also add it to the deposit table with useful details
      await Transactions.create({
        user_id: user.id,
        amount,
        type: "DEPOSIT"
      });
                    
      await Deposits.create({
        user_id: user.id,
        amount,
        reference,
        channel,
        walletAddress,
        currency
      });
      const message = `A deposit of ${currency} ${amount} was made by ${user.name} is awaiting Admin Approval`;
      await notification.createNotification({userId: user.id, message, type: "admin"});
      if (channel === "PAYSTACK") {
        // Safe Paystack transaction
        const payment = {
          user_id: user.id,
          payment_category: req.body.payment_category,
          payment_reference: reference,
          amount
        }
        await Payment.create(payment);
        
      }
                            
      return res.status(200).send({status: true, message: "Deposit Made Successfully"});
                              
    } else {
        console.log(`user not found`);
        return res.status(400).send({status: false, message: "User Not Found"})
    }
  } catch (error) {
    return res.status(500).send({status: false, message: "Server Error"})
  }
        
}

exports.walletFundingHistory = async (req, res, next) => {
  try {
   
    const user = await Users.findOne({
      where: {
          id: {
              [Op.eq]: req.session.userId
          }
      }
    });
    const messages = await AdminMessages.findAll();
    const deposits = await Deposits.findAll({where:{user_id: req.session.userId}, order:[["createdAt", "DESC"]], include: ["user"]});
    console.log(deposits);
    res.render("dashboards/users/funding_history",{
      moment,
      user,
      messages,
      deposits
    })
    
  } catch (error) {
    req.flash("error", "Server error!");
    res.redirect("back");
  }
      
}

exports.depositsTransactions = async (req, res, next) => {
  try {
   const {status} = req.query
    
    const messages = await Chats.findAll();
    const deposits = await Deposits.findAll({where:{status} ,order:[["createdAt", "DESC"]], include: ["user"]})
    res.render("dashboards/deposits",{
      moment,
      messages,
      deposits,
      type: "Pending"
    })
    
  } catch (error) {
    req.flash("error", "Server error!");
    res.redirect("back");
  }
      
}

exports.coinDepositsTransactions = async (req, res, next) => {
  try {
   const {status} = req.query
    
    const messages = await Chats.findAll();
    const deposits = await PrePayment.findAll({where:{status} ,order:[["createdAt", "DESC"]], include: ["user", "coin"]});
    
    res.render("dashboards/coin_deposits",{
      moment,
      messages,
      deposits,
      type: "Pending"
    })
    
  } catch (error) {
    req.flash("error", "Server error!");
    res.redirect("back");
  }
      
}

exports.viewCoinDepositsTransaction = async (req, res, next) => {
  try {
   const {id} = req.params
    
    const messages = await Chats.findAll();
    const deposits = await PrePayment.findOne({where:{id} , include: ["user", "coin"]});
    
    res.render("dashboards/view_coin_deposits",{
      moment,
      messages,
      deposits
    })
    
  } catch (error) {
    req.flash("error", "Server error!");
    res.redirect("back");
  }
      
}


exports.approveCoinDeposits = async(req, res, next) => {
  id = req.body.id;
  
   
  PrePayment.findOne({
          where: {
              id: {
                  [Op.eq]: id
              }
          },
          include: ["user"],
      })
      .then(async deposit => {
        console.log(deposit);
          if (deposit) {
              let owner = deposit.user_id
              amount = Math.abs(Number(deposit.quantity));
              // fund the users account before anything
              const coin = await Coin.findOne({where: {userId: deposit.user_id, coinId: deposit.coinId}})
              let userWallet = Math.abs(Number(coin.balance));
              console.log(userWallet);
              let currentWallet = userWallet + amount;
              Coin.update({
                  balance: currentWallet
              }, {
                  where: {userId: deposit.user_id, coinId: deposit.coinId}
              })
              .then(async userUpdated => {
                  const data = {
                    user_id: deposit.user_id,
                    amount: deposit.amountSent,
                    channel: "PAYLOT",
                    walletAddress: deposit.wallet_address,
                    reference: deposit.reference,
                    currency: deposit.currency,
                    status: "approved"
                  }
                  Deposits.create(data)
                  .then(updatedDeposit => {
                        
                      let desc = 'Your deposit was approved'
                      let type = "Crytpo Wallet"
                      History.create({
                          user_id:owner,
                          type,
                          desc,
                          value:deposit.amountSent 
                              
                      }).then(async resp =>{
                        await PrePayment.update({status: "approved"}, {where:{id}})
                        const message = `Your deposit of ${deposit.amountSent} ${deposit.currency} was Approved`;
                        await notification.createNotification({userId:owner, message, type: "user"})
                        req.flash('success', "Wallet Deposit approved");
                        res.redirect("back");

                      })
                          
                  })
                  .catch(error => {
                      req.flash('error', "Server error!" + error);
                      res.redirect("back");
                  });
              })
              .catch(error => {
                  req.flash('error', "Server error!"+ error);
                  res.redirect("back");
              });
          } else {
              req.flash('warning', "Invalid deposit!");
              res.redirect("back");
          }
      })
      .catch(error => {
          req.flash('error', "Server error!"+ error);
          res.redirect("back");
      });
}

exports.unApproveACoinDeposits = async(req, res, next) => {
  id = req.body.id;
  PrePayment.findOne({
          where: {
              id: {
                  [Op.eq]: id
              }
          },
          include: ["user", "coin"],
      })
      .then(deposit => {
          if (deposit) {
              const data = {
                user_id: deposit.user_id,
                amount: deposit.amountSent,
                channel: "PAYLOT",
                walletAddress: deposit.wallet_address,
                reference: deposit.reference,
                currency: deposit.currency,
                status: "disapproved"
              }
              Deposits.create(data).then(async approved =>{
                await PrePayment.update({status: "disapproved"}, {where:{id}})
                const message = `Your deposit of ${deposit.amountSent} ${deposit.currency} was Disapproved`;
                await notification.createNotification({userId:deposit.user_id, message, type: "user"});
                  req.flash('success', "Wallet Deposit disapproved");
                  res.redirect("back");
              })
              .catch(error => {
                  req.flash('error', "Server error!"+ error);
                  res.redirect("back");
              });
          } else {
              req.flash('warning', "Invalid deposit!");
              res.redirect("back");
          }
      })
      .catch(error => {
          req.flash('error', "Server error!"+ error);
          res.redirect("back");
      });
}
