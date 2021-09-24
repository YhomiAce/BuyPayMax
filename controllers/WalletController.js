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
const helpers = require("../helpers/cryptedge_helpers");
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
    const coins = user.coins;
    res.render("dashboards/users/account_balance", {
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
    req.flash('error', "Server error!");
            res.redirect("/home");
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
              products
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
    // first check if the user email is valid
    let email = req.body.email;
    let amount = req.body.amount;
    let walletAddressId = req.body.walletAddressId
    const {walletAddress, balance} = await Wallet.findOne({where:{id: walletAddressId}})
    let reference = generateUniqueId({
      length: 15,
      useLetters: true,
    });;
    let channel = req.body.channel;
    let userId;
    // amount = 0.2;
    Users.findOne({
            where: {
                email: {
                    [Op.eq]: email
                }
            }
        })
        .then(user => {
            if (user) {
                userId = user.id;
                 // add it to transaction as deposits, and also add it to the deposit table with useful details
                        Transactions.create({
                                user_id: userId,
                                amount,
                                type: "DEPOSIT"
                            })
                            .then(transaction => {
                                Deposits.create({
                                        user_id: userId,
                                        amount,
                                        reference,
                                        channel,
                                        walletAddressId
                                    })
                                    .then(deposit => {
                                      // const updateBalance = Number(amount) + Number(balance)
                                      Wallet.update({status: 'in_use', userId}, {where: {walletAddress}})
                                      .then(wallet =>{

                                        req.flash("success", "Deposit Successful wait for Admin Confirmation");
                                        res.redirect("back");
                                      })
                                    })
                                    .catch(error => {
                                        console.log(`deposit error`);
                                        res.redirect("back");
                                    });
                            })
                            .catch(error => {
                                console.log(`transaction error`);
                                res.redirect("back");
                            });
            } else {
                console.log(`user not found`);
                res.redirect("back");
            }
        })
        .catch(error => {
            console.log(`fetching user error`);
            res.redirect("back");
        });
}