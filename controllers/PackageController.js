// package imports
const Sequelize = require("sequelize");
const moment = require("moment");

// local imports
const Packages = require("../models").Package;
const Users = require("../models").User;
const Investments = require("../models").Investment;
const History = require('../models').History;
const helpers = require("../helpers/cryptedge_helpers");
const Chats = require("../models").Chat;
const AdminMessages = require('../models').AdminMessage;
const Product = require('../models').Product;
const Wallet = require('../models').Wallet;
const Coin = require('../models').Coin;
const Admin = require('../models').Admin;

// imports initialization
const Op = Sequelize.Op;

exports.addPackage = (req, res, next) => {
    AdminMessages.findAll()
        .then(unansweredChats => {
            res.render("dashboards/add_packages", {
                edit: false,
                messages: unansweredChats,
                moment
            });
        })
        .catch(error => {
            req.flash('error', "Server error!");
            res.redirect("/");
        });
}

exports.addCoinPackage = (req, res, next) => {
    AdminMessages.findAll()
        .then(unansweredChats => {
            res.render("dashboards/add_coins", {
                edit: false,
                messages: unansweredChats,
                moment
            });
        })
        .catch(error => {
            req.flash('error', "Server error!");
            res.redirect("/");
        });
}

exports.usersPackages = (req, res, next) => {
     AdminMessages.findAll()
        .then(unansweredChats => {
            Packages.findAll({
                    where: {
                        deletedAt: {
                            [Op.eq]: null
                        },
                        description: {
                            [Op.eq]: "Bitcoin"
                        }
                    },
                    order: [
                        ['createdAt', 'ASC'],
                    ],
                })
                .then(packages => {
                    Users.findOne({
                        where:{
                            id : {
                                [Op.eq] : req.session.userId
                            }
                        }
                    }).then(user=>{
                        res.render("dashboards/users/packages", {
                            packages: packages,
                            user:user,
                            messages: unansweredChats,
                            moment
                        });
                    }).catch(error=>{
                        res.redirect('/')
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

exports.usersPackagesEthereum = (req, res, next) => {
    AdminMessages.findAll()
       .then(unansweredChats => {
           Packages.findAll({
                   where: {
                       deletedAt: {
                           [Op.eq]: null
                       },
                       description: {
                        [Op.eq]: "Ethereum"
                       }
                   },
                   order: [
                       ['createdAt', 'ASC'],
                   ],
               })
               .then(packages => {
                   Users.findOne({
                       where:{
                           id : {
                               [Op.eq] : req.session.userId
                           }
                       }
                   }).then(user=>{
                       res.render("dashboards/users/packages", {
                           packages: packages,
                           user:user,
                           messages: unansweredChats,
                           moment
                       });
                   }).catch(error=>{
                       res.redirect('/')
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

exports.eachPackage = (req, res, next) => {
    const id = req.params.id;
    AdminMessages.findAll()
        .then(unansweredChats => {
            Packages.findOne({
                    where: {
                        id: {
                            [Op.eq]: id
                        }
                    }
                })
                .then(package => {
                    if (package) {
                        res.render("dashboards/users/each_package", {
                            package: package,
                            messages: unansweredChats,
                            moment
                        });
                    } else {
                        res.redirect("/");
                    }
                })
                .catch(error => {
                    res.redirect("/");
                });
        })
        .catch(error => {
            req.flash('error', "Server error!");
            res.redirect("/");
        });

};


//invest package new
exports.investPackage = (req,res,next)=>{
    let id  = req.body.idd;
    let owner = req.session.userId;
    let amount_p = req.body.amount;
    let type = 'BTC Deposit';
    let desc = 'BTC Investment made';

    Packages.findOne({
        where:{
            id:{
                [Op.eq]:id
            }
        }
    }).then(package=>{
        if(!package){
            req.flash('Warning', 'Invalid package');
            res.redirect('back');
        }else{

            let duration = Math.abs(Number(package.duration));
            let amount = Math.abs(Number(package.price));

            Investments.create({
                user_id:owner,
                package_id:id,
                amount,
                status: 0,
                interest: package.dailyEarning,
                expiredAt: moment().add(duration, 'days')
               

            }).then(investment=>{
                History.create({
                    user_id:req.session.userId,
                    value:amount_p,
                    type,
                    desc
                })
                req.flash('success', "Investment made successfully!");
                res.redirect("back");
            }).catch(error=>{
                req.flash('error', "Unable to create investment!");
                res.redirect("back");
            }).catch(error=>{
                req.flash('error', "Could not add investment!");
                res.redirect("back");
            })
        }
    })
}


// invest in a package
exports.investPackages = (req, res, next) => {
    let id = req.body.idd;
   
    Packages.findOne({
            where: {
                id: {
                    [Op.eq]: id
                }
            }
        })
        .then(package => {
            if (package) {
                let duration = Math.abs(Number(package.duration));
               
                // check details of package if it is greater than max_amt of package 
                // return max amount exceeded
                // if it is less, return min_amt exceeded
                if (!package) {
                    req.flash('warning', "invalid package");
                    res.redirect("back");
                } else {
                    if (amount > maxAmt) {
                        req.flash('warning', "Maximum package limit exeeded");
                        res.redirect("back");
                    }else {
                        Users.findOne({
                                where: {
                                    id: {
                                        [Op.eq]: req.session.userId
                                    }
                                }
                            })
                            .then(user => {
                                if (user) {
                                    // then once it has been found, check users wallet
                                    let wallet = Math.abs(Number(user.wallet));
                                    // if it is not upto amount return insufficient fund
                                    if (amount > wallet) {
                                        req.flash('warning', "Insufficient fund!");
                                        res.redirect("back");
                                    } else {

                                        // before creating the investments, 
                                        //first check if the user has made an investment before now, 
                                        // if he does proceed as usual
                                        // if he does not credit 3% to the referral of this user
                                        // if he exists
                                        Investments.findOne({
                                                where: {
                                                    user_id: {
                                                        [Op.eq]: req.session.userId
                                                    }
                                                }
                                            })
                                            .then(hasInvestment => {
                                                if (hasInvestment) {
                                                    // else add to investment table,
                                                    // then deduct the amount from users wallet
                                                    // then return status of the whole transaction
                                                    Investments.create({
                                                            user_id: req.session.userId,
                                                            package_id: id,
                                                            amount: amount,
                                                            interest: package.interest,
                                                            expiredAt: moment().add(duration, 'days')
                                                        })
                                                        .then(investment => {
                                                            let currentWallet = wallet - amount;
                                                            Users.update({
                                                                    wallet: currentWallet
                                                                }, {
                                                                    where: {
                                                                        id: {
                                                                            [Op.eq]: req.session.userId
                                                                        }
                                                                    }
                                                                })
                                                                .then(newUser => {
                                                                    req.flash('success', "Investment made successfully!");
                                                                    res.redirect("back");
                                                                })
                                                                .catch(error => {
                                                                    req.flash('error', "Unable to make deductions!");
                                                                    res.redirect("back");
                                                                })
                                                        })
                                                        .catch(error => {
                                                            req.flash('error', "Could not add investment!");
                                                            res.redirect("back");
                                                        });
                                                } else {
                                                    // check if this user has referral
                                                    let referral_id = user.referral_id;
                                                    if (referral_id != null && referral_id != "") {
                                                        Users.findOne({
                                                                where: {
                                                                    id: {
                                                                        [Op.eq]: referral_id
                                                                    }
                                                                }
                                                            })
                                                            .then(refdetails => {
                                                                let refWallet = Math.abs(Number(refdetails.wallet));
                                                                let refAmount = amount * 0.03;
                                                                let refCurrentWallet = refWallet + refAmount;
                                                                let amountAsRefferal = Math.abs(Number(refdetails.referral_amount));
                                                                let currentAmountAsRefferal = amountAsRefferal + refAmount;
                                                                Users.update({
                                                                        wallet: refCurrentWallet,
                                                                        referral_amount: currentAmountAsRefferal
                                                                    }, {
                                                                        where: {
                                                                            id: {
                                                                                [Op.eq]: referral_id
                                                                            }
                                                                        }
                                                                    })
                                                                    .then(refupdated => {
                                                                        // else add to investment table,
                                                                        // then deduct the amount from users wallet
                                                                        // then return status of the whole transaction
                                                                        Investments.create({
                                                                                user_id: req.session.userId,
                                                                                package_id: id,
                                                                                amount: amount,
                                                                                interest: package.interest,
                                                                                expiredAt: moment().add(duration, 'days')
                                                                            })
                                                                            .then(investment => {
                                                                                let currentWallet = wallet - amount;
                                                                                Users.update({
                                                                                        wallet: currentWallet
                                                                                    }, {
                                                                                        where: {
                                                                                            id: {
                                                                                                [Op.eq]: req.session.userId
                                                                                            }
                                                                                        }
                                                                                    })
                                                                                    .then(newUser => {
                                                                                        req.flash('success', "Investment made successfully!");
                                                                                        res.redirect("back");
                                                                                    })
                                                                                    .catch(error => {
                                                                                        req.flash('error', "Unable to make deductions!");
                                                                                        res.redirect("back");
                                                                                    })
                                                                            })
                                                                            .catch(error => {
                                                                                req.flash('error', "Could not add investment!");
                                                                                res.redirect("back");
                                                                            });
                                                                    })
                                                                    .catch(error => {
                                                                        req.flash('error', "Server error!");
                                                                        res.redirect("back");
                                                                    });
                                                            })
                                                            .catch(error => {
                                                                req.flash('error', "Server error!");
                                                                res.redirect("back");
                                                            });
                                                    } else {
                                                        // else add to investment table,
                                                        // then deduct the amount from users wallet
                                                        // then return status of the whole transaction
                                                        Investments.create({
                                                                user_id: req.session.userId,
                                                                package_id: id,
                                                                amount: amount,
                                                                interest: package.interest,
                                                                expiredAt: moment().add(duration, 'days')
                                                            })
                                                            .then(investment => {
                                                                let currentWallet = wallet - amount;
                                                                Users.update({
                                                                        wallet: currentWallet
                                                                    }, {
                                                                        where: {
                                                                            id: {
                                                                                [Op.eq]: req.session.userId
                                                                            }
                                                                        }
                                                                    })
                                                                    .then(newUser => {
                                                                        req.flash('success', "Investment made successfully!");
                                                                        res.redirect("back");
                                                                    })
                                                                    .catch(error => {
                                                                        req.flash('error', "Unable to make deductions!");
                                                                        res.redirect("back");
                                                                    })
                                                            })
                                                            .catch(error => {
                                                                req.flash('error', "Could not add investment!");
                                                                res.redirect("back");
                                                            });
                                                    }
                                                }
                                            })
                                            .catch(error => {
                                                req.flash('error', "Server error!");
                                                res.redirect("back");
                                            });
                                    }
                                } else {
                                    req.flash('warning', "User not found!");
                                    res.redirect("back");
                                }
                            })
                            .catch(error => {
                                req.flash('error', "Could not verify user!");
                                res.redirect("back");
                            });
                    }
                }
            } else {
                req.flash('warning', "Invalid package");
                res.redirect("back");
            }
        })
        .catch(error => {
            req.flash('error', "error connecting to server");
            res.redirect("back");
        });


}

exports.editPackage = (req, res, next) => {
    const id = req.params.id;
    AdminMessages.findAll()
        .then(unansweredChats => {
            Packages.findOne({
                    where: {
                        id: {
                            [Op.eq]: id
                        }
                    }
                })
                .then(package => {
                    if (package) {
                        res.render("dashboards/add_packages", {
                            edit: true,
                            package: package,
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

exports.deleteCoin = async(req, res)=>{
    try {
        const {id} = req.params;
        const product = await Product.findOne({where:{id}});
        if (!product) {
            req.flash('warning', "Invalid Coin Type");
            res.redirect("back");
        }
        await Product.destroy({where:{id}});
        const coins = await Coin.findAll({where:{coinId:id}});
        await Promise.all(coins.map(async coin =>{
            await Coin.destroy({where:{id:coin.id}})
        }))
        req.flash('success', "Coin Type deleted Successfully");
        res.redirect("back");
    } catch (error) {
        req.flash('error', "Server error!");
        res.redirect("back");
    }
}

exports.deleteWalletAddress = async(req, res)=>{
    try {
        const {id} = req.params;
        const wallet = await Wallet.findOne({where:{id}});
        if (!wallet) {
            req.flash('warning', "Wallet address does not exist!");
            res.redirect("back");
        }
        if (wallet.userId != null || wallet.status === "in_use") {
            req.flash('warning', "This Wallet is still in use");
            res.redirect("back");
        }else{
            await Wallet.destroy({where:{id}});
            req.flash('success', "Wallet Address deleted Successfully");
            res.redirect("back");
        }
        
    } catch (error) {
        req.flash('error', "Server error!");
        res.redirect("back");
    }
}

exports.editCoin = (req, res, next) => {
    const id = req.params.id;
    AdminMessages.findAll()
        .then(unansweredChats => {
            Product.findOne({
                    where: {
                        id: {
                            [Op.eq]: id
                        }
                    }
                })
                .then(product => {
                    if (product) {
                        res.render("dashboards/add_coins", {
                            edit: true,
                            coin:product,
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

exports.adminAllPackages = (req, res, next) => {
    AdminMessages.findAll()
        .then(unansweredChats => {
            Packages.findAll({
                    where: {
                        deletedAt: {
                            [Op.eq]: null
                        }
                    },
                    order: [
                        ['createdAt', 'ASC'],
                    ],
                })
                .then(packages => {
                    res.render("dashboards/packages_admin", {
                        packages: packages,
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

exports.adminAllCoins = (req, res, next) => {
    AdminMessages.findAll()
        .then(unansweredChats => {
            Product.findAll({
                    where: {
                        deletedAt: {
                            [Op.eq]: null
                        }
                    },
                    order: [
                        ['createdAt', 'ASC'],
                    ],
                })
                .then(products => {
                    res.render("dashboards/coins_packages", {
                        products,
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

exports.viewAllWallets = (req, res, next) => {
    AdminMessages.findAll()
        .then(unansweredChats => {
            Wallet.findAll({
                    where: {
                        deletedAt: {
                            [Op.eq]: null
                        }
                    },
                    
                    order: [
                        ['createdAt', 'ASC'],
                    ],
                    include: [
                        {
                            model: Product,
                            as: 'coin'
                        },
                        {
                            model: Users,
                            as: 'user'
                        },
                        {
                            model: Admin,
                            as: 'trader'
                        },
                    ]
                })
                .then(wallets => {
                    // console.log(wallets);
                    res.render("dashboards/wallets", {
                        wallets,
                        messages: unansweredChats,
                        moment
                    });
                    // return res.send(wallets)
                })
                .catch(error => {
                    res.redirect("/");
                    // return res.send("Server error");
                });
        })
        .catch(error => {
            req.flash('error', "Server error!");
            res.redirect("/");
            // return res.send("Server error");
        });
}

exports.viewAllTradersWallet = (req, res, next) => {
    AdminMessages.findAll()
        .then(unansweredChats => {
            Wallet.findAll({
                    where: {
                        traderId:req.session.adminId
                    },
                    
                    order: [
                        ['createdAt', 'ASC'],
                    ],
                    include: [
                        {
                            model: Product,
                            as: 'coin'
                        },
                        {
                            model: Users,
                            as: 'user'
                        },
                        {
                            model: Admin,
                            as: 'trader'
                        },
                    ]
                })
                .then(wallets => {
                    // console.log(wallets);
                    Admin.findOne({where:{id:req.session.adminId}})
                    .then(admin =>{

                        res.render("dashboards/Trader/wallets", {
                            wallets,
                            messages: unansweredChats,
                            moment,
                            admin
                        });
                    })
                    // return res.send(wallets)
                })
                .catch(error => {
                    res.redirect("/");
                    // return res.send("Server error");
                });
        })
        .catch(error => {
            req.flash('error', "Server error!");
            res.redirect("/");
            // return res.send("Server error");
        });
}

exports.addWalletAddress = (req, res, next) => {
    AdminMessages.findAll()
        .then(unansweredChats => {
            Product.findAll({
                    where: {
                        deletedAt: {
                            [Op.eq]: null
                        }
                    },
                    order: [
                        ['createdAt', 'ASC'],
                    ],
                })
                .then(products => {
                    console.log(products);
                    res.render("dashboards/add_wallet", {
                        products,
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

exports.updateWalletAddress = async(req,res)=>{
    try {
        const request = req.body;
        
        const walletAddress = await Wallet.findOne({where:{id:request.id}});
        if (!walletAddress) {
            req.flash('warning', "This Wallet Address already exist");
            res.redirect("back");
        }else{
            
            await Wallet.update(request, {where: {id: request.id}});
            req.flash('success', "Wallet Address updated successful");
            res.redirect("back");
        }

    } catch (error) {
        req.flash('error', "Server error!");
        res.redirect("back");
    }
}

exports.getFreeWallet = async(req, res) =>{
    try {
        const {coinId} = req.params;
        const wallet = await Wallet.findOne({where: {coinId, status: "pending"}});
        return res.json({wallet}) 
    } catch (error) {
        return res.status(500).json({msg: 'Server Error'})
    }
}

exports.editWalletAddress = (req, res, next) => {
    AdminMessages.findAll()
        .then(unansweredChats => {
            Wallet.findOne({
                    where: {
                        deletedAt: {
                            [Op.eq]: null
                        },
                        id: req.params.id
                    },
                    include: [
                        {
                            model: Product,
                            as: "coin"
                        },
                        {
                            model: Users,
                            as: "user"
                        },
                        {
                            model: Admin,
                            as: "trader"
                        },
                    ]
                })
                .then(wallet => {
                    Admin.findAll({where:{level:2}})
                    .then(trader =>{
                        console.log(wallet);
                        Admin.findOne({where:{id:req.session.adminId}})
                        .then(admin =>{
                            res.render("dashboards/edit_wallet", {
                                wallet,
                                messages: unansweredChats,
                                moment,
                                traders:trader,
                                admin
                            });

                        })

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

exports.createWalletAddress = async(req,res) =>{
    try {
        const {coinId, wallet} = req.body;
        if(!coinId || !wallet) {
            req.flash('warning', "Fill all Field");
            res.redirect("back");
        }
        const walletAddress = await Wallet.findOne({where:{walletAddress:wallet}});
        if (walletAddress) {
            req.flash('warning', "This Wallet Address already exist");
            res.redirect("back");
        }else{
            await Wallet.create({coinId, walletAddress: wallet});
            req.flash('success', "Wallet Address Added successful");
            res.redirect("back");
        }

    } catch (error) {
        req.flash('error', "Server error!");
        res.redirect("back");
    }
}

exports.deletePackage = (req, res, next) => {
    Investments.findOne({
            where: {
                package_id: {
                    [Op.eq]: req.body.id
                }
            }
        })
        .then(investment => {
            console.log(investment);
            if (investment) {
                req.flash('warning', "Package already has investors!");
                res.redirect("back");
            } else {
                Packages.destroy({
                        where: {
                            id: {
                                [Op.eq]: req.body.id
                            }
                        }
                    })
                    .then(response => {
                        req.flash('success', "package deleted successfully");
                        res.redirect("back");
                    })
                    .catch(error => {
                        req.flash('error', "something went wrong");
                        res.redirect("back");
                    });
            }
        })
        .catch(error => {
            req.flash('error', "Server error!");
            res.redirect("back");
        });
}

exports.postAddPackage = (req, res, next) => {
    const {
        name,
        price,
        harsh_power,
        dailyEarning,
        withdrawal,
        duration,
        description
    } = req.body;
    // check if any of them are empty
    if (!name || !price || !harsh_power || !dailyEarning || !withdrawal || !duration || !description) {
        req.flash('warning', "enter all fields");
        res.redirect("back");
    } else if (!helpers.isNumeric(price)) {
        req.flash('warning', "enter valid minimum investment(digits only)");
        res.redirect("back");
    } else if (!helpers.isNumeric(dailyEarning)) {
        req.flash('warning', "enter valid maximum investment(digits only)");
        res.redirect("back");
    }  
    // else if (Math.abs(Number(interest)) > 100) {
    //     req.flash('warning', "Interest must be less than 100%");
    //     res.redirect("back");
    // } 
     else {
        Packages.findOne({
                where: {
                    name: {
                        [Op.eq]: req.body.name
                    },
                    description: {
                        [Op.eq]: req.body.description
                    }
                }
            })
            .then(package => {
                if (package) {
                    req.flash('warning', "name already exists");
                    res.redirect("back");
                } else {
                    Packages.create({
                        name,
                        price,
                        harsh_power,
                        dailyEarning,
                        withdrawal,
                        duration,
                        description
                        })
                        .then(packages => {
                            req.flash('success', "Package added successfully!");
                            res.redirect("back");
                        })
                        .catch(error => {
                            req.flash('error', "Something went wrong!");
                            res.redirect("back");
                        });
                }
            })
            .catch(error => {
                req.flash('error', "something went wrong");
                res.redirect("back");
            });
    }
}

exports.postAddCoin =  async(req, res, next) => {
    const {
        name,
        symbol,
        rate
    } = req.body;
    // check if any of them are empty
    if (!name || !symbol || !rate) {
        req.flash('warning', "enter all fields");
        res.redirect("back");
    }
    // else if (Math.abs(Number(interest)) > 100) {
    //     req.flash('warning', "Interest must be less than 100%");
    //     res.redirect("back");
    // } 
     else {
        Product.findOne({
                where: {
                    name: {
                        [Op.eq]: req.body.name
                    }
                }
            })
            .then(product => {
                if (product) {
                    req.flash('warning', "name already exists");
                    res.redirect("back");
                } else {
                    Product.create({
                        name,
                        rate,
                        symbol
                        })
                        .then( async products => {
                            const users=  await Users.findAll();
                            await Promise.all(users.map(async user=>{
                                await Coin.create({userId: user.id, coinId: products.id})
                            }))
                            req.flash('success', "Package added successfully!");
                            res.redirect("back");
                        })
                        .catch(error => {
                            req.flash('error', "Something went wrong!");
                            res.redirect("back");
                        });
                }
            })
            .catch(error => {
                req.flash('error', "something went wrong");
                res.redirect("back");
            });
    }
}

exports.postUpdatePackage = (req, res, next) => {
    const {
        name,
        price,
        harsh_power,
        dailyEarning,
        withdrawal,
        duration,
    } = req.body;
    // check if any of them are empty
    if (!name || !price || !harsh_power || !dailyEarning || !withdrawal || !duration) {
        req.flash('warning', "enter all fields");
        res.redirect("back");
    } else if (!helpers.isNumeric(price)) {
        req.flash('warning', "enter valid price(digits only)");
        res.redirect("back");
    } else if (!helpers.isNumeric(dailyEarning)) {
        req.flash('warning', "enter valid daily earning (digits only)");
        res.redirect("back");
    } 
    // else if (Math.abs(Number(interest)) > 100) {
    //     req.flash('warning', "Interest must be less than or equal to 100%");
    //     res.redirect("back");
    // } 
    else if (!helpers.isNumeric(duration)) {
        req.flash('warning', "enter valid duration(digits only)");
        res.redirect("back");
    } else {
        Packages.findOne({
                where: {
                    id: {
                        [Op.eq]: req.body.id
                    }
                }
            })
            .then(package => {
                if (!package) {
                    req.flash('warning', "Invalid Package");
                    res.redirect("back");
                } else {
                    Packages.update({
                        name,
                        price,
                        harsh_power,
                        dailyEarning,
                        withdrawal,
                        duration,
                        }, {
                            where: {
                                id: {
                                    [Op.eq]: req.body.id
                                }
                            }
                        })
                        .then(packages => {
                            req.flash('success', "Package updated successfully!");
                            res.redirect("back");
                        })
                        .catch(error => {
                            req.flash('error', "Something went wrong!");
                            res.redirect("back");
                        });
                }
            })
            .catch(error => {
                req.flash('error', "something went wrong");
                res.redirect("back");
            });
    }
}

exports.postUpdateCoin = (req, res, next) => {
    const {
        name,
        symbol,
        rate
    } = req.body;
    // check if any of them are empty
    if (!name || !symbol || !rate) {
        req.flash('warning', "enter all fields");
        res.redirect("back");
    } else {
        Product.findOne({
                where: {
                    id: {
                        [Op.eq]: req.body.id
                    }
                }
            })
            .then(product => {
                if (!product) {
                    req.flash('warning', "Invalid Coin Type");
                    res.redirect("back");
                } else {
                    Product.update({
                        name,
                        symbol,
                        rate
                        }, {
                            where: {
                                id: {
                                    [Op.eq]: req.body.id
                                }
                            }
                        })
                        .then(packages => {
                            req.flash('success', "Coin Type updated successfully!");
                            res.redirect("back");
                        })
                        .catch(error => {
                            req.flash('error', "Something went wrong!");
                            res.redirect("back");
                        });
                }
            })
            .catch(error => {
                req.flash('error', "something went wrong");
                res.redirect("back");
            });
    }
}