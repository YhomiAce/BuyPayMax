// package imports
const Sequelize = require("sequelize");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const moment = require('moment');

// local imports
const Referrals = require("../models").Referral;
const Users = require("../models").User;
const Chats = require("../models").Chat;
const Verifications = require("../models").Verification;
const AdminMessages = require('../models').AdminMessage;
const parameters = require("../config/params");

// imports initialization
const Op = Sequelize.Op;

exports.profilePage = (req, res, next) => {
     AdminMessages.findAll()
        .then(unansweredChats => {
            Referrals.findAll({
                    where: {
                        referral_id: {
                            [Op.eq]: req.session.userId
                        }
                    },
                    order: [
                        ['createdAt', 'DESC'],
                    ],
                    include: ["referrals", "user"],
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
                            Verifications.findOne({
                                where: {
                                    user_id: {
                                        [Op.eq]: req.session.userId
                                    }
                                }
                            })
                            .then(verified => {
                                twoway = false;
                                emailAuth = false;

                                if(verified && verified.twofa_status == 1) {
                                   twoway = true; 
                                }

                                if(verified && verified.email_status == 1) {
                                    emailAuth = true; 
                                 }
                                res.render("dashboards/users/user_profile", {
                                    referrals: referrals,
                                    messages: unansweredChats,
                                    user: user,
                                    edit: false,
                                    twoway: twoway,
                                    email_auth: emailAuth,
                                    moment
                                }); 
                            })
                            .catch(error => {
                                res.redirect("/");    
                            });
                        })
                        .catch(error => {
                            res.redirect("/");
                        });
                })
                .catch(error => {
                    res.redirect("/");
                    //console.log(error);
                });
        })
        .catch(error => {
            req.flash('error', "Server error!");
            res.redirect("/");
        });
}

exports.settingsPage = (req, res, next) => {
     AdminMessages.findAll()
        .then(unansweredChats => {
            Referrals.findAll({
                    where: {
                        referral_id: {
                            [Op.eq]: req.session.userId
                        }
                    },
                    order: [
                        ['createdAt', 'DESC'],
                    ],
                    include: ["referrals", "user"],
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
                            Verifications.findOne({
                                where: {
                                    user_id: {
                                        [Op.eq]: req.session.userId
                                    }
                                }
                            })
                            .then(verified => {
                                twoway = false;
                                emailAuth = false;

                                if(verified && verified.twofa_status == 1) {
                                   twoway = true; 
                                }

                                if(verified && verified.email_status == 1) {
                                    emailAuth = true; 
                                 }
                                res.render("dashboards/users/user_settings", {
                                    referrals: referrals,
                                    messages: unansweredChats,
                                    user: user,
                                    edit: false,
                                    twoway: twoway,
                                    email_auth: emailAuth,
                                    moment
                                }); 
                            })
                            .catch(error => {
                                res.redirect("/");    
                            });
                        })
                        .catch(error => {
                            res.redirect("/");
                        });
                })
                .catch(error => {
                    res.redirect("/");
                    //console.log(error);
                });
        })
        .catch(error => {
            req.flash('error', "Server error!");
            res.redirect("/");
        });
}

exports.editSettingsPage = (req, res, next) => {
     AdminMessages.findAll()
        .then(unansweredChats => {
            Referrals.findAll({
                    where: {
                        referral_id: {
                            [Op.eq]: req.session.userId
                        }
                    },
                    order: [
                        ['createdAt', 'DESC'],
                    ],
                    include: ["referrals", "user"],
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
                            Verifications.findOne({
                                where: {
                                    user_id: {
                                        [Op.eq]: req.session.userId
                                    }
                                }
                            })
                            .then(verified => {
                                twoway = false;
                                emailAuth = false;

                                if(verified && verified.twofa_status == 1) {
                                   twoway = true; 
                                }

                                if(verified && verified.email_status == 1) {
                                    emailAuth = true; 
                                 }
                                res.render("dashboards/users/user_settings", {
                                    referrals: referrals,
                                    messages: unansweredChats,
                                    user: user,
                                    edit: true,
                                    twoway: twoway,
                                    email_auth: emailAuth,
                                    moment
                                }); 
                            })
                            .catch(error => {
                                res.redirect("/");    
                            });
                        })
                        .catch(error => {
                            res.redirect("/");
                        });
                })
                .catch(error => {
                    res.redirect("/");
                    //console.log(error);
                });
        })
        .catch(error => {
            req.flash('error', "Server error!");
            res.redirect("/");
        });
}

exports.editProfilePage = (req, res, next) => {
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
                    Users.findOne({
                            where: {
                                id: {
                                    [Op.eq]: req.session.userId
                                }
                            }
                        })
                        .then(user => {
                            res.render("dashboards/users/user_settings", {
                                referrals: referrals,
                                messages: unansweredChats,
                                user: user,
                                edit: true,
                                moment
                            });
                        })
                        .catch(error => {
                            res.redirect("/");
                        });
                })
                .catch(error => {
                    res.redirect("/");
                    //console.log(error);
                });
        })
        .catch(error => {
            req.flash('error', "Server error!");
            res.redirect("/");
        });
}

exports.editProfileSettings = (req, res, next) => {
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
                    Users.findOne({
                            where: {
                                id: {
                                    [Op.eq]: req.session.userId
                                }
                            }
                        })
                        .then(user => {
                            res.render("dashboards/users/user_settings", {
                                referrals: referrals,
                                messages: unansweredChats,
                                user: user,
                                edit: true,
                                moment
                            });
                        })
                        .catch(error => {
                            res.redirect("/");
                        });
                })
                .catch(error => {
                    res.redirect("/");
                    //console.log(error);
                });
        })
        .catch(error => {
            req.flash('error', "Server error!");
            res.redirect("/");
        });
}


exports.updateProfile = (req, res, next) => {
    const digits_only = string => [...string].every(c => '+0123456789'.includes(c));
    const {
        phone, name
    } = req.body;
    if (!phone) {
        req.flash('warning', "Please enter phone");
        res.redirect("back");
    } else if (!digits_only(phone) || phone.length < 11) {
        req.flash('warning', "Enter valid mobile phone");
        res.redirect("back");
    } else {
        Users.update({
                phone: phone,
                name
            }, {
                where: {
                    id: {
                        [Op.eq]: req.session.userId
                    }
                }
            })
            .then(update => {
                req.flash('success', "Profile Updated successfully!");
                res.redirect("/settings");
            })
            .catch(error => {
                req.flash('error', "Error something went wrong!");
                res.redirect("back");
            });
    }
}

exports.updateTwoWay = (req, res, next) => {
    //This input has changed
    // check if the previous value is 0
    // if it is change it to 1 else change to 0
    Users.findOne({
        where: {
            id: {
                [Op.eq]: req.session.userId
            }
        }
    })
    .then(user => {
        if(user) {
            Verifications.findOne({
                where: {
                    user_id: {
                        [Op.eq]: req.session.userId
                    }
                }
            })
            .then(verify => {
                if (verify) {
                    // user exists before, simply change status to 1 or 0 depending on which
                    if (verify.twofa_status == 0 || verify.twofa_status == "0") {
                        Verifications.update({
                                twofa_status: 1,
                                email_status: 0
                            }, {
                                where: {
                                    user_id: {
                                        [Op.eq]: req.session.userId
                                    }
                                }
                            })
                            .then(updated => {
                                res.status(200).json({
                                    status: true,
                                    message: "Two-Factor Auth activated Successfully!"
                                });
                            })
                            .catch(error => {
                                res.status(500).json({
                                    status: false,
                                    message: "Something went wrong!"
                                });
                            });
                    } else if (verify.twofa_status == 1 || verify.twofa_status == "1") {
                        Verifications.update({
                                twofa_status: 0
                            }, {
                                where: {
                                    user_id: {
                                        [Op.eq]: req.session.userId
                                    }
                                }
                            })
                            .then(updated => {
                                res.status(200).json({
                                    status: true,
                                    message: "Two-Factor Auth cancelled Successfully!"
                                });
                            })
                            .catch(error => {
                                res.status(500).json({
                                    status: false,
                                    message: "Something went wrong!"
                                });
                            });
                    }
                } else {
    
                    let secret = speakeasy.generateSecret({
                        name: `${parameters.APP_NAME} (${user.name})`
                    });
    
                    qrcode.toDataURL(secret.otpauth_url, (err, data) => {
                        if (err) {
                            res.status(500).json({
                                status: false,
                                message: "Something went wrong!"
                            });
                        } else {
                            // create new Verification
                            Verifications.create({
                                    user_id: req.session.userId,
                                    twofa_image: data,
                                    twofa_status: 1,
                                    email_status: 0,
                                    twofa_code: secret.base32
                                })
                                .then(created => {
                                    res.status(200).json({
                                        status: true,
                                        message: "Two-Factor Auth created Successfully!"
                                    });
                                })
                                .catch(error => {
                                    res.status(500).json({
                                        status: false,
                                        message: "Something went wrong!"
                                    });
                                });
                        }
                    });
                }
            })
            .catch(error => {
                res.status(500).json({
                    status: false,
                    message: "Something went wrong!"
                });
            });
        } else {
            res.redirect("/");
        }
    })
    .catch(error => {
        res.redirect("/");
    });
    
}

exports.updateEmailWay = (req, res, next) => {
    //This input has changed
    // check if the previous value is 0
    // if it is change it to 1 else change to 0
    Verifications.findOne({
            where: {
                user_id: {
                    [Op.eq]: req.session.userId
                }
            }
        })
        .then(verify => {
            if (verify) {
                // user exists before, simply change status to 1 or 0 depending on which
                if (verify.email_status == 0 || verify.email_status == "0") {
                    Verifications.update({
                            email_status: 1,
                            twofa_status: 0
                        }, {
                            where: {
                                user_id: {
                                    [Op.eq]: req.session.userId
                                }
                            }
                        })
                        .then(updated => {
                            res.status(200).json({
                                status: true,
                                message: "Email Verification activated Successfully!"
                            });
                        })
                        .catch(error => {
                            res.status(500).json({
                                status: false,
                                message: "Something went wrong!"
                            });
                        });
                } else if (verify.email_status == 1 || verify.email_status == "1") {
                    Verifications.update({
                            email_status: 0
                        }, {
                            where: {
                                user_id: {
                                    [Op.eq]: req.session.userId
                                }
                            }
                        })
                        .then(updated => {
                            res.status(200).json({
                                status: true,
                                message: "Email Verification disabled Successfully!"
                            });
                        })
                        .catch(error => {
                            res.status(500).json({
                                status: false,
                                message: "Something went wrong!"
                            });
                        });
                }
            } else {
                Verifications.create({
                    user_id: req.session.userId,
                    email_status: 1,
                    twofa_status: 0
                })
                .then(created => {
                    res.status(200).json({
                        status: true,
                        message: "Email Verification enabled Successfully!"
                    });
                })
                .catch(error => {
                    res.status(500).json({
                        status: false,
                        message: "Something went wrong!"
                    });
                });
            }
        })
        .catch(error => {
            res.status(500).json({
                status: false,
                message: "Something went wrong!"
            });
        });
}