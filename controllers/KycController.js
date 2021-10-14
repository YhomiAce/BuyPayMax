const Sequelize = require("sequelize");
const multer = require("multer");
const moment = require("moment");
const cloudinary = require("../helpers/cloudinary");
const path = require("path");
const Chats = require("../models").Chat;
const AdminMessages = require('../models').AdminMessage;
const Kycs = require("../models").KYC
// local imports

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


exports.userKyc = (req, res, next) => {
     AdminMessages.findAll()
    .then(unansweredChats => {
        res.render("dashboards/users/user_kyc", {
            messages: unansweredChats,
            moment
        });
    })
    .catch(error => {
        req.flash('error', "Server error!");
        res.redirect("/");
    });
    
}

exports.uploadKycFile = async(req, res, next) => {
    try {
        const result = await cloudinary.uploader.upload(req.file.path);
        const docPath = result.secure_url;
        console.log(req.file);
        await Kycs.create({user_id:req.session.userId, type:req.body.document, image: docPath, status: false});
        req.flash('success', "Document Uploaded successful");
        res.redirect("back");
    } catch (error) {
        req.flash('error', "Server error!");
        res.redirect("back");
    }
}

exports.uploadKyc = (req, res, next) => {
    upload(req, res, (err) => {
        if (err) {
            req.flash('error', "Check image and try again!");
            res.redirect("back");
        } else {
            console.log(req.files);
            console.log(req.body);
            let document = req.body.document;
            if (!document) {
                req.flash('warning', "Select Document");
                res.redirect("back");
            } else if (req.files.image == "" || req.files.image == null || req.files.image == undefined) {
                req.flash('warning', "Enter Image");
                res.redirect("back");
            } else {
                // insert into bankdeposit table with
                // check if users have already Uploaded
                //if they have then update the image and type 
                // else insert new
                Kycs.findOne({
                    where: {
                        user_id: {
                            [Op.eq]: req.session.userId
                        }
                    }
                })
                .then(kyc => {
                    if (kyc) {
                        Kycs.update({
                            type: document,
                            image: req.files.image[0].filename,
                            status: 0,
                        },{
                            where: {
                                user_id: {
                                    [Op.eq]: req.session.userId
                                }
                            }
                        })
                        .then(kyc2 => {
                            User.update({isKyc: true}, {where:{id:req.session.userId}})
                            .then(resp =>{

                                req.flash('success', "Document uploaded, awaiting confirmation!");
                                res.redirect("back");
                            })
                        })
                        .catch(error => {
                            req.flash('error', "Error in verification, try again!");
                            res.redirect("back");
                        });
                    } else {
                        Kycs.create({
                            user_id: req.session.userId,
                            type: document,
                            image: req.files.image[0].filename,
                            status: 0,
                        })
                        .then(kyc => {
                            req.flash('success', "Document uploaded, awaiting confirmation!");
                            res.redirect("back");
                        })
                        .catch(error => {
                            req.flash('error', "Error in verification, try again!");
                            res.redirect("back");
                        });
                    }
                })
                .catch(error => {
                    req.flash('error', "Error in verification, try again!");
                            res.redirect("back");
                });
            }
        }
    });
}

exports.unApprovedKyc = async(req, res, next) => {
    try {
        const unansweredChats = await Chats.findAll();
        const kycs = await Kycs.findAll({where:{status: false},
            include: ["user"],
            order: [
            ['createdAt', 'DESC'],
        ]})
        console.log(kycs);
        res.render("dashboards/unapproved_kyc", {
            kycs: kycs,
            messages: unansweredChats,
            moment
        });
        // return res.send({kycs, unansweredChats})
    } catch (error) {
        req.flash('error', "Server error!");
        res.redirect("back");
        // return res.send({error})
    }
}

exports.approvedKyc = (req, res, next) => {
     AdminMessages.findAll()
    .then(unansweredChats => {
        Kycs.findAll({
            where: {
                status: {
                    [Op.eq]: 1
                }
            },
            include: ["user"],
            order: [
                ['createdAt', 'DESC']
            ]
        })
        .then(kycs => {
            res.render("dashboards/approved_kyc", {
                kycs: kycs,
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


exports.viewAKyc = (req, res, next) => {
    const id = req.params.id;
    AdminMessages.findAll()
    .then(unansweredChats => {
        Kycs.findOne({
            where: {
                id: {
                    [Op.eq]: id
                },
            },
            include: ["user"],
        })
        .then(kyc => {
            if (kyc) {
                res.render("dashboards/view_kyc", {
                    kyc: kyc,
                    messages: unansweredChats,
                    moment
                });
            } else {
                req.flash('error', "Server error!");
                res.redirect("/");
            }
        })
        .catch(error => {
            req.flash('error', "Server error!");
            console.log(error);
            res.redirect("/");
        });
    })
    .catch(error => {
        req.flash('error', "Server error!");
        res.redirect("/");
    });
    
}

exports.approveAKYC = (req, res, next) => {
    id = req.body.id;
    Kycs.findOne({
            where: {
                id: {
                    [Op.eq]: id
                }
            },
            include: ["user"],
        })
        .then(kyc => {
            if (kyc) {
                // fund the users account before anything
                Kycs.update({
                    status: 1
                }, {
                    where: {
                        id: {
                            [Op.eq]: id
                        }
                    }
                })
                .then(kyc2 => {
                    req.flash('success', "KYC updated successfully!");
                res.redirect("back");    
                })
                .catch(error => {
                    req.flash('error', "Server error!");
                    res.redirect("back");
                });
            } else {
                req.flash('warning', "Invalid KYC!");
                res.redirect("back");
            }
        })
        .catch(error => {
            req.flash('error', "Server error!");
            res.redirect("back");
        });
}

exports.disApproveAKYC = (req, res, next) => {
    id = req.body.id;
    Kycs.findOne({
            where: {
                id: {
                    [Op.eq]: id
                }
            },
            include: ["user"],
        })
        .then(kyc => {
            if (kyc) {
                // fund the users account before anything
                Kycs.update({
                    status: 0
                }, {
                    where: {
                        id: {
                            [Op.eq]: id
                        }
                    }
                })
                .then(kyc2 => {
                    req.flash('success', "KYC updated successfully!");
                res.redirect("back");    
                })
                .catch(error => {
                    req.flash('error', "Server error!");
                    res.redirect("back");
                });
            } else {
                req.flash('warning', "Invalid KYC!");
                res.redirect("back");
            }
        })
        .catch(error => {
            req.flash('error', "Server error!");
            res.redirect("back");
        });
}

