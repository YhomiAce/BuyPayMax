// package imports
const Sequelize = require("sequelize");
const multer = require("multer");
const path = require("path");
const moment = require('moment')

// local imports
const BankDeposits = require("../models").BankDeposit;
const Investment = require('../models').Investment
const Deposits = require("../models").Deposit;
const AdminMessages = require("../models").AdminMessage;
const Users = require("../models").User;
const Chats = require("../models").Chat;
const History = require('../models').History;
const helpers = require("../helpers/cryptedge_helpers");
const Wallet = require("../models").Wallet;
//Here admin can
//1 View all deposits - approved and declined
// 2 Approves all deposits



// imports initialization
const Op = Sequelize.Op;

// constants
const storage = multer
    .diskStorage({
        destination: "./public/uploads/",
        filename: function (req, file, cb) {
            cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
        },
    });

const checkFileType = (file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|JPEG|JPG|PNG|GIF/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error("Images only!"));
    }
}

// init upload 
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb);
    }
}).fields([{
    name: 'image'
}]);


exports.viewADeposit = (req, res, next) => {
    const id = req.params.id;
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
            }]
            
        },
        include: ["user"],
    })
    .then(unansweredChats => {
        Deposits.findOne({
            where: {
                id: {
                    [Op.eq]: id
                },
            },
            include: ["user"],
        })
        .then(deposits => {
            // if (deposits) {
            //     res.render("dashboards/view_bank_deposit", {
            //         deposits: deposits
            //     });
            // } else {
            //     req.flash('error', "Server error!");
            //     res.redirect("/");
            // }
            res.render("dashboards/view_bank_deposit", {
                deposits: deposits,
                messages: unansweredChats,
                moment
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
}

exports.unApprovedDeposit = (req, res, next) => {
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
            }]
            
        },
        include: ["user"],
    })
    .then(unansweredChats => {
        Deposits.findAll({
            where: {status: "pending"},
            include: ["user"],
            order: [
                ['createdAt', 'DESC'],
            ],
        })
        .then(bankdeposits => {
            console.log(bankdeposits);
            res.render("dashboards/bank_deposits", {
                deposits: bankdeposits,
                messages: unansweredChats,
                moment
            });
        })
        .catch(error => {
            console.log(error)
            req.flash('error', "Server error!");
            // res.redirect("/");
        });
    })
    .catch(error => {
        console.log(error)
        req.flash('error', "Server error!");
        res.redirect("/");
    });
}

exports.approvedDeposit = (req, res, next) => {
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
            }]
            
        },
        include: ["user"],
    })
    .then(unansweredChats => {
        Deposits.findAll({
            where: {
                status: "completed"
            },
            include: ["user"],
            order: [
                ['createdAt', 'DESC'],
            ],
        })
        .then(bankdeposits => {
            res.render("dashboards/approved_deposits", {
                deposits: bankdeposits,
                messages: unansweredChats,
                moment
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
}

exports.approvedCoinDesposit = async(req, res) =>{
    try {
        const {id} = req.params;
        const deposit = await Deposits.findOne({where: {id}});
        await Deposits.update({status:"completed"}, {where:{id}});
        const userId = deposit.user_id;
        const amount = Number(deposit.amount);
        const walletAddressId = deposit.walletAddressId;
        const walletAddress = await Wallet.findOne({where:{id: walletAddressId}})
        const {wallet} = await Users.findOne({where:{id: userId}});
        const balance = Number(wallet) + amount;
        await Users.update({wallet: balance}, {where:{id: userId}});
        const walletAddBalance = amount + Number(walletAddress.balance);
        await Wallet.update({balance: walletAddBalance, status:"pending", userId: null}, {where:{id: walletAddressId}});
        req.flash('success', "Deposit Approved");
        res.redirect("back");
    } catch (error) {
        req.flash('error', "Server error!");
        res.redirect("/dashboard");
    }
}

exports.approveDeposits = (req, res, next) => {
    id = req.body.id;
    let amount;
    let amount_p = req.body.amount
     
    Investment.findOne({
            where: {
                id: {
                    [Op.eq]: id
                }
            },
            include: ["user"],
        })
        .then(bankdeposit => {
            if (bankdeposit) {
                let owner = bankdeposit.user_id
                amount = Math.abs(Number(bankdeposit.amount));
                // fund the users account before anything
                let userWallet = Math.abs(Number(bankdeposit.user.wallet));
                let currentWallet = userWallet + amount;
                Users.update({
                    wallet: currentWallet
                }, {
                    where: {
                        id: {
                            [Op.eq]: bankdeposit.user_id
                        }
                    }
                })
                .then(userUpdated => {
                    Investment.update({
                        status: 1
                    }, {
                        where: {
                            id: {
                                [Op.eq]: id
                            }
                        }
                    })
                    .then(updatedDeposit => {
                           
                        
                        
                        Deposits.create({
                                user_id: bankdeposit.user_id,
                                amount: amount,
                                channel: "WALLET DEPOSIT"
                            })
                            .then(deposit => {
                                 let desc = 'Your BTC deposit was approved'
                                 let type = 'BTC deposit'
                                 History.create({
                                            user_id:owner,
                                            type,
                                            desc,
                                            value:amount_p 
                                           
                                        })
                                req.flash('success', "Wallet Deposit approved");
                                res.redirect("back");
                            })
                            .catch(error => {
                                req.flash('error', "Server error!");
                                res.redirect("back");
                            });
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

exports.unApproveADeposits = (req, res, next) => {
    id = req.body.id;
    let amount;
    Investment.findOne({
            where: {
                id: {
                    [Op.eq]: id
                }
            },
            include: ["user"],
        })
        .then(bankdeposit => {
            if (bankdeposit) {
                amount = Math.abs(Number(bankdeposit.amount));
                // fund the users account before anything
                let userWallet = Math.abs(Number(bankdeposit.user.wallet));
                let currentWallet = userWallet - amount;
                Users.update({
                    wallet: currentWallet
                }, {
                    where: {
                        id: {
                            [Op.eq]: bankdeposit.user_id
                        }
                    }
                })
                .then(userUpdated => {
                    Investment.update({
                        status: 0
                    }, {
                        where: {
                            id: {
                                [Op.eq]: id
                            }
                        }
                    })
                    .then(updatedDeposit => {
                        Deposits.create({
                                user_id: req.session.userId,
                                amount: amount,
                                channel: "BANK DEPOSIT"
                            })
                            .then(deposit => {
                                req.flash('success', "Wallet Deposit disapproved");
                                res.redirect("back");
                            })
                            .catch(error => {
                                req.flash('error', "Server error!");
                                res.redirect("back");
                            });
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

exports.usersUploads = (req, res, next) => {
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
            }]
            
        },
        include: ["user"],
    })
    .then(unansweredChats => {
        BankDeposits.findAll({
            where: {
                user_id: {
                    [Op.eq]: req.session.userId
                }
            },
            order: [
                ['createdAt', 'DESC'],
            ],
        })
        .then(bankdeposits => {
            res.render("dashboards/users/user_bank_deposits", {
                deposits: bankdeposits,
                messages: unansweredChats,
                moment
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
}

exports.uploadBankDeposit = (req, res, next) => {

    upload(req, res, (err) => {
        if (err) {
            req.flash('error', "Check image and try again!");
            res.redirect("back");
        } else {
            let amount = req.body.amount;
            if (amount.length < 1) {
                req.flash('warning', "Enter amount");
                res.redirect("back");
            } else if (!helpers.isNumeric(amount)) {
                req.flash('warning', "Enter valid amount");
                res.redirect("back");
            } else if (req.files.image == "" || req.files.image == null || req.files.image == undefined) {
                req.flash('warning', "Enter Image");
                res.redirect("back");
            } else {
                // insert into bankdeposit table with
                BankDeposits.create({
                        user_id: req.session.userId,
                        amount: amount,
                        image: req.files.image[0].filename,
                        status: 0,
                    })
                    .then(deposit => {
                        req.flash('success', "Wallet Deposit uploaded, awaiting confirmation!");
                        res.redirect("back");
                    })
                    .catch(error => {
                        req.flash('error', "Error creating wallet deposit!");
                        res.redirect("back");
                    });
            }
        }
    });
}