const Sequelize = require("sequelize");
const Users = require("../models").User;
const Kycs = require("../models").Kyc;
const Verifications = require("../models").Verification;
// imports initialization
const Op = Sequelize.Op;

exports.redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect("/");
    } else {
        next();
    }
}

exports.authVerirfication = (req, res, next) => {
    Verifications.findOne({
        where: {
            user_id: {
                [Op.eq]: req.session.userId
            }
        }
    })
    .then(verified => {
        if(verified) {
            if((verified.twofa_status == '1' || verified.twofa_status == 1) 
            && (req.session.userTfa != 1 || req.session.userTfa != '1' )) {
                res.redirect("/twofactor");
            } else if((verified.email_status == '1' || verified.email_status == 1) 
            && (req.session.userTFEmail != '1' || req.session.userTFEmail != 1)) {
                res.redirect("/validateemail");
            } else {
                next();
            }
        } else {
            next();
        }
    })
    .catch(error => {
        res.redirect("/");
    });
}

exports.redirect2FALogin = (req, res, next) => {
    if(req.session.userTfa) {
        res.redirect("/home");
    } else {
        next();
    }
}

exports.redirect2FAEmailLogin = (req, res, next) => {
    if(req.session.userTFEmail) {
        res.redirect("back");
    } else {
        next();
    }
}

exports.redirectHome = (req, res, next) => {
    if (req.session.userId) {
        res.redirect("/home");
    } else {
        next();
    }
}

exports.redirectUserLogin = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect("/");
    } else if (req.session.role != '3') {
        res.redirect("/");
    } else {
        next();
    }
}

exports.redirectUserHome = (req, res, next) => {
    if (req.session.userId && (req.session.role == 3 || req.session.role == "3")) {
        res.redirect("/home");
    } else {
        next();
    }
}

exports.redirectAdminLogin = (req, res, next) => {
    if (!req.session.adminId) {
        res.redirect("/");
    } else {
        next();
    }
}

// a middleware that handles the usual authentication
// but you cannot view this page if you are not verified
exports.validatedKYC = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect("/");
    } else if (req.session.role != '3') {
        res.redirect("/");
    } else {
        Kycs.findOne({
                where: {
                    [Op.and]: [{
                            user_id: {
                                [Op.eq]: req.session.userId
                            }
                        },
                        {
                            status: {
                                [Op.eq]: 1
                            }
                        }
                    ]
                }
            })
            .then(kyc => {
                if (kyc) {
                    next();
                } else {
                    res.redirect("/");
                }
            })
            .catch(error => {
                res.redirect("/");
            });
    }
}