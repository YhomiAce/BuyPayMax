// package imports
const bcrypt = require("bcryptjs");
const Sequelize = require("sequelize");
const moment = require("moment");

// local imports
const parameters = require("../config/params");
const Users = require("../models").User;
const Chats = require("../models").Chat;
const Blog = require("../models").Blog;

const { stripHtml} = require("../helpers/helpers")

const cloudinary = require("../helpers/cloudinary");

// imports initialization
const Op = Sequelize.Op;

exports.createPost = async(req, res)=>{
    try {
        res.render("dashboards/new_blog_post")
    } catch (error) {
        req.flash('error', "Server error!");
        res.redirect("back");
    }
}

exports.viewPost = async(req, res)=>{
    try {
        const posts = await Blog.findAll({});
        console.log(posts);
        res.render("dashboards/view_post",{
            posts,
            moment
        });
    } catch (error) {
        req.flash('error', "Server error!");
        res.redirect("back");
    }
}

exports.findPost = async(req, res)=>{
    try {
        const posts = await Blog.findOne({where:{id: req.params.id}});
        console.log(posts);
        res.render("dashboards/blog",{
            posts,
            moment,
            stripHtml
        });
    } catch (error) {
        req.flash('error', "Server error!");
        res.redirect("back");
    }
}

exports.createNewPost = async(req, res) =>{
    try {
        const {body, title, author} = req.body;
        console.log(req.file);
        const result = await cloudinary.uploader.upload(req.file.path);
        const docPath = result.secure_url;
        await Blog.create({body, author, title, image: docPath});
        req.flash("success", "Blog Post created successfully");
        res.redirect("/view/post");
    } catch (error) {
        req.flash('error', "Server error!");
        res.redirect("back");
    }
}

exports.publishPost = async(req, res) =>{
    try {
        const {id} = req.body;
        
        await Blog.update({publish: true}, {where:{id}});
        req.flash("success", "Blog Post Published successfully");
        res.redirect("back");
    } catch (error) {
        req.flash('error', "Server error!");
        res.redirect("back");
    }
}

exports.deletePost = async(req, res) =>{
    try {
        const {id} = req.body;
        
        await Blog.destroy({where:{id}});
        req.flash("success", "Blog Post Deleted successfully");
        res.redirect("/view/post");
    } catch (error) {
        req.flash('error', "Server error!");
        res.redirect("back");
    }
}

exports.addManager = (req, res, next) => {
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
        res.render("dashboards/add_managers", {
            edit: false,
            messages: unansweredChats
        });
    })
    .catch(error => {
        req.flash('error', "Server error!");
        res.redirect("/");
    });
}

exports.editManager = (req, res, next) => {
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
        Users.findOne({
            where: {
                id: {
                    [Op.eq]: id
                }
            }
        })
        .then(manager => {
            if (manager) {
                res.render("dashboards/add_managers", {
                    edit: true,
                    manager: manager,
                    messages: unansweredChats
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
}

exports.allAdmins = (req, res, next) => {
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
        Users.findAll({
            order: [
                ['name', 'ASC'],
                ['createdAt', 'DESC'],
            ],
            where: {
                [Op.and]: [{
                        deletedAt: {
                            [Op.eq]: null
                        }
                    },
                    {
                        role: 2
                    }
                ]
            }
        })
        .then(managers => {
            res.render("dashboards/view_managers", {
                managers: managers,
                messages: unansweredChats
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

exports.postAddManagers = (req, res, next) => {
    const mailformat = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    const digits_only = string => [...string].every(c => '+0123456789'.includes(c));
    const {
        name,
        email,
        phone,
        password,
    } = req.body;

    if (!name) {
        req.flash('warning', "Please enter name");
        res.redirect("back");
    } else if (!email) {
        req.flash('warning', "Please enter email");
        res.redirect("back");
    } else if (!phone) {
        req.flash('warning', "Please enter phone");
        res.redirect("back");
    } else if (!password) {
        req.flash('warning', "Please enter password");
        res.redirect("back");
    } else if (!email.match(mailformat)) {
        req.flash('warning', "Enter valid email address");
        res.redirect("back");
    } else if (!digits_only(phone) || phone.length < 11) {
        req.flash('warning', "Enter valid mobile phone");
        res.redirect("back");
    } else if (name.length < 5) {
        req.flash('warning', "Name must be greater than 5 letters");
        res.redirect("back");
    } else if (password.length < 6) {
        req.flash('warning', "Passwords must be greater than 5 letters");
        res.redirect("back");
    }
    Users.findOne({
            where: {
                email: {
                    [Op.eq]: email
                }
            }
        })
        .then((user) => {
            if (!user) {
                let name = req.body.name;
                let email = req.body.email;
                let phone = req.body.phone;
                let password = bcrypt.hashSync(req.body.password, 10);

                Users.create({
                        name: name,
                        email: email,
                        phone: phone,
                        password: password,
                        role: 2
                    })
                    .then((response) => {
                        req.flash('success', "Manager added successfully");
                        res.redirect("back");
                    })
                    .catch(error => {
                        req.flash('error', "Something went wrong try again");
                        res.redirect("back");
                    });
            } else {
                req.flash('warning', "Email already taken!");
                res.redirect("back");
            }
        })
        .catch(error => {
            req.flash('error', "Something went wrong try again");
            res.redirect("back");
        });
}

exports.postUpdateManagers = (req, res, next) => {
    const digits_only = string => [...string].every(c => '+0123456789'.includes(c));
    const {
        name,
        phone,
        password,
    } = req.body;
    if (!name) {
        req.flash('warning', "Please enter name");
        res.redirect("back");
    } else if (!phone) {
        req.flash('warning', "Please enter phone");
        res.redirect("back");
    } else if (!password) {
        req.flash('warning', "Please enter password");
        res.redirect("back");
    } else if (!digits_only(phone) || phone.length < 11) {
        req.flash('warning', "Enter valid mobile phone");
        res.redirect("back");
    } else if (name.length < 5) {
        req.flash('warning', "Name must be greater than 5 letters");
        res.redirect("back");
    } else if (password.length < 6) {
        req.flash('warning', "Passwords must be greater than 5 letters");
        res.redirect("back");
    }
    Users.findOne({
            where: {
                id: {
                    [Op.eq]: req.body.id
                }
            }
        })
        .then((user) => {
            if (user) {
                let name = req.body.name;
                let phone = req.body.phone;
                let password = bcrypt.hashSync(req.body.password, 10);

                Users.update({
                        name: name,
                        phone: phone,
                        password: password,
                    }, {
                        where: {
                            id: {
                                [Op.eq]: req.body.id
                            }
                        }
                    })
                    .then((response) => {
                        req.flash('success', "Manager updated successfully");
                        res.redirect("back");
                    })
                    .catch(error => {
                        req.flash('error', "Something went wrong try again");
                        res.redirect("back");
                    });
            } else {
                req.flash('warning', "Invalid user!");
                res.redirect("back");
            }
        })
        .catch(error => {
            req.flash('error', "Something went wrong try again");
            res.redirect("back");
        });
}

exports.deleteManager = (req, res, next) => {
    Users.destroy({
            where: {
                id: {
                    [Op.eq]: req.body.id
                }
            }
        })
        .then(response => {
            req.flash('success', "manager deleted successfully");
            res.redirect("back");
        })
        .catch(error => {
            req.flash('error', "something went wrong");
            res.redirect("back");
        });
}