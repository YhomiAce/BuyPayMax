// package imports
const Sequelize = require("sequelize");
const moment = require('moment');

// local imports
const Users = require("../models").User;
const Chats = require("../models").Chat;
const AdminMessages = require("../models").AdminMessage;
const Admins = require('../models').Admin
const Coin = require('../models').Coin
const Product = require('../models').Product

// imports initialization
const Op = Sequelize.Op;



exports.allUsers = (req, res, next) => {
     AdminMessages.findAll()
    .then(unansweredChats => {
        Users.findAll({
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
        .then(users => {
            console.log(users.userCoins);
            res.render("dashboards/all_users", {
                users: users,
                messages: unansweredChats,
                moment
            });
        })
        .catch(error => {
            res.redirect("/dashboard");
        });
    })
    .catch(error => {
        req.flash('error', "Server error!");
        res.redirect("/");
    });
    
}

exports.allAdmins = async(req,res,next)=>{
    AdminMessages.findAll()
    .then(unansweredChats => {
        Admins.findAll({
            where: {
                    deletedAt: {
                        [Op.eq]: null
                    }
            },
            order: [
                ['name', 'ASC'],
                ['createdAt', 'DESC'],
            ],
        })
        .then(users => {
            res.render("dashboards/all_admin", {
                users: users,
                messages: unansweredChats,
                moment
            });
        })
        .catch(error => {
            res.redirect("/dashboard");
        });
    })
    .catch(error => {
        req.flash('error', "Server error!");
        res.redirect("/");
    });
}

exports.viewDeletedUsers = (req, res, next) => {
     AdminMessages.findAll()
    .then(unansweredChats => {
        Users.findAll({
            where: {
                deletedAt: {
                    [Op.ne]: null
                }
            },
                paranoid: false,
            })
            .then(users => {
                res.render("dashboards/deleted_users", {
                    users: users,
                    messages: unansweredChats,
                    moment
                });
            })
            .catch(error => {
                res.redirect("/home");
            });
    })
    .catch(error => {
        req.flash('error', "Server error!");
        res.redirect("/");
    });
}

exports.viewDeletedAdmins = (req, res, next) => {
    AdminMessages.findAll()
   .then(unansweredChats => {
       Admins.findAll({
           where: {
               deletedAt: {
                   [Op.ne]: null
               }
           },
               paranoid: false,
           })
           .then(users => {
               res.render("dashboards/deleted_admin", {
                   users: users,
                   messages: unansweredChats,
                   moment
               });
           })
           .catch(error => {
               res.redirect("/home");
           });
   })
   .catch(error => {
       req.flash('error', "Server error!");
       res.redirect("/");
   });
}

exports.deleteUser = (req, res, next) => {
    Users.destroy({
            where: {
                id: {
                    [Op.eq]: req.body.id
                }
            }
        })
        .then(response => {
            req.flash('success', "User deleted successfully");
            res.redirect("back");
        })
        .catch(error => {
            req.flash('error', "something went wrong");
            res.redirect("back");
        });
}

exports.deleteAdmin = (req, res, next) => {
    Admins.destroy({
            where: {
                id: {
                    [Op.eq]: req.body.id
                }
            }
        })
        .then(response => {
            req.flash('success', "User deleted successfully");
            res.redirect("back");
        })
        .catch(error => {
            req.flash('error', "something went wrong");
            res.redirect("back");
        });
}

exports.restoreUser = (req, res, next) => {
    Users.restore({
            where: {
                id: {
                    [Op.eq]: req.body.id
                }
            }
        })
        .then(response => {
            req.flash('success', "User deleted successfully");
            res.redirect("back");
        })
        .catch(error => {
            req.flash('error', "something went wrong");
            res.redirect("back");
        });
}

exports.restoreAdmin = (req, res, next) => {
    Admins.restore({
            where: {
                id: {
                    [Op.eq]: req.body.id
                }
            }
        })
        .then(response => {
            req.flash('success', "User deleted successfully");
            res.redirect("back");
        })
        .catch(error => {
            req.flash('error', "something went wrong");
            res.redirect("back");
        });
}