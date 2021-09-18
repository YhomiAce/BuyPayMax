// package imports
const Sequelize = require("sequelize");
const moment = require('moment');
const nodemailer = require("nodemailer");

// local imports
const parameters = require("../config/params");
const Users = require("../models").User;
const Investments = require("../models").Investment;
const Package = require("../models").Package;
const Chats = require("../models").Chat;
const Investment = require("../models").Investment;
const AdminMessages = require('../models').AdminMessage;
// imports initialization
const Op = Sequelize.Op;


exports.userInvestments = (req, res, next) => {
    AdminMessages.findAll()
    .then(unansweredChats => {
        Investments.findAll({
            where: {
                user_id: {
                    [Op.eq]: req.session.userId
                },
                [Op.and]: [
                    {
                        expiredAt: {
                            [Op.gte]: moment().format('YYYY-MM-DD HH:mm:ss')
                        }
                    },
                    {
                        status: "active"
                    }
                ]
            },
            include: ["package"] ,
            order: [
                ['createdAt', 'DESC'],
            ]
        })
        .then(investments => {
            Users.findOne({
                where:{
                    id:{
                        [Op.eq]: req.session.userId
                    }
                }
            }).then(user=>{
                const totalEarned = investments.reduce((b, invest)=>{
                    return invest.weeklyEarning + b;
                },0)
                res.render("dashboards/users/user_investment", {
                investments: investments,
                messages: unansweredChats,
                user,
                moment,
                totalEarned
            });
            }).catch(err=>{
                res.redirect('back')
            })
            
        })
        .catch(error => {
            console.log(error)
            //res.redirect("/");
            req.flash('error', `Server Error`);
            res.redirect("back");
        });
    })
    .catch(error => {
        console.log(error)
        req.flash('error', "Server error!");
        res.redirect("back");
    });
    
}

exports.myInvestmentHistory = (req, res, next) => {
    AdminMessages.findAll()
    .then(unansweredChats => {
        Investments.findAll({
            where: {
                user_id: {
                    [Op.eq]: req.session.userId
                }
            },
            include: ["package"] ,
            order: [
                ['createdAt', 'DESC'],
            ]
        })
        .then(investments => {
            Users.findOne({
                where:{
                    id:{
                        [Op.eq]: req.session.userId
                    }
                }
            }).then(user=>{
                const totalEarned = investments.reduce((b, invest)=>{
                    return invest.weeklyEarning + b;
                },0);
                
                res.render("dashboards/users/my_investment_history", {
                investments: investments,
                messages: unansweredChats,
                user,
                moment
            });
            }).catch(err=>{
                res.redirect('back')
            })
            
        })
        .catch(error => {
            console.log(error)
            //res.redirect("/");
            req.flash('error', `Server Error`);
            res.redirect("back");
        });
    })
    .catch(error => {
        console.log(error)
        req.flash('error', "Server error!");
        res.redirect("back");
    });
    
}

exports.viewMyInvestment = (req, res, next) => {
    AdminMessages.findAll()
    .then(unansweredChats => {
        Investments.findOne({
            where: {
                id: req.params.id
            },
            include: ["package", "user"] ,
            order: [
                ['createdAt', 'DESC'],
            ],
        })
        .then(investments => {
            Users.findOne({
                where:{
                    id:{
                        [Op.eq]: req.session.userId
                    }
                }
            }).then(user=>{
                var now = investments.createdAt;
                var new_date = moment(now, "DD-MM-YYYY").add(28, 'days');
                res.render("dashboards/users/user_investment_details", {
                    investments,
                    messages: unansweredChats,
                    user,
                    moment,
                    new_date
                })
            }).catch(err=>{
                res.redirect('back')
            })
            
        })
        .catch(error => {
            console.log(error)
            //res.redirect("/");
            req.flash('error', `Server Error`);
            res.redirect("back");
        });
    })
    .catch(error => {
        console.log(error)
        req.flash('error', "Server error!");
        res.redirect("back");
    });
    
}


exports.viewUserInvestment = (req, res, next) => {
    Chats.findAll()
    .then(unansweredChats => {
        Investments.findOne({
            where: {
                id: req.params.id
            },
            include: ["package", "user"] ,
            order: [
                ['createdAt', 'DESC'],
            ],
        })
        .then(investments => {
            var now = investments.createdAt;
            var new_date = moment(now, "DD-MM-YYYY").add(28, 'days');
            res.render("dashboards/investment_detail_admin", {
                investments: investments,
                messages: unansweredChats,
                moment,
                new_date
            })
        })
        .catch(error => {
            console.log(error)
            //res.redirect("/");
            req.flash('error', `Server Error`);
            res.redirect("back");
        });
    })
    .catch(error => {
        console.log(error)
        req.flash('error', "Server error!");
        res.redirect("back");
    });
    
}


exports.activeInvestment = (req, res, next) => {
    Chats.findAll()
    .then(unansweredChats => {
        Investments.findAll({
            where: {
                status: "active",
                expiredAt: {
                    [Op.gte]: moment().format('YYYY-MM-DD HH:mm:ss')
                }
            },
            include: ["package", "user"] ,
            order: [
                ['createdAt', 'DESC'],
            ],
        })
        .then(investments => {
            res.render("dashboards/active_investment", {
                investments,
                messages: unansweredChats,
                moment,
                active: true
            });
            
        })
        .catch(error => {
            console.log(error)
            //res.redirect("/");
            req.flash('error', `Server Error`);
            res.redirect("back");
        });
    })
    .catch(error => {
        console.log(error)
        req.flash('error', "Server error!");
        res.redirect("back");
    });
    
}

exports.inActiveInvestment = (req, res, next) => {
    Chats.findAll()
    .then(unansweredChats => {
        Investments.findAll({
            where: {
                [Op.or]: [
                    {status: "inactive"},
                {expiredAt: {
                    [Op.lte]: moment().format('YYYY-MM-DD HH:mm:ss')
                }}
                ]
            },
            include: ["package", "user"] ,
            order: [
                ['createdAt', 'DESC'],
            ],
        })
        .then(investments => {
            console.log(investments);
            res.render("dashboards/active_investment", {
                investments,
                messages: unansweredChats,
                moment,
                active: false
            });
            
        })
        .catch(error => {
            console.log(error)
            //res.redirect("/");
            req.flash('error', `Server Error`);
            res.redirect("back");
        });
    })
    .catch(error => {
        console.log(error)
        req.flash('error', "Server error!");
        res.redirect("back");
    });
    
}

// exports.viewInvestment = (req, res, next) => {
//     Chats.findAll()
//     .then(unansweredChats => {
//         Investments.findOne({
//             where: {
//                 id: req.params.id
//             },
//             include: ["package", "user"]
//         })
//         .then(investments => {
//             res.render("dashboards/investment_details", {
//                 investments,
//                 messages: unansweredChats,
//                 moment
//             });
            
//         })
//         .catch(error => {
//             console.log(error)
//             //res.redirect("/");
//             req.flash('error', `Server Error`);
//             res.redirect("back");
//         });
//     })
//     .catch(error => {
//         console.log(error)
//         req.flash('error', "Server error!");
//         res.redirect("back");
//     });
    
// }

exports.cancelInvestment = async(req, res)=>{
    try {
        const {amount, user_id, investmentId} = req.body;
        console.log(req.body);
        const user = await Users.findOne({where: {id: user_id}});
        const investment = await Investment.findOne({where: {id:investmentId}, include: ["package", "user"]});
        const wallet = Number(user.wallet);
        const amtToadd = Number(amount)
        const newBal = wallet +amtToadd;
        await Users.update({wallet: newBal}, {where:{id: user_id}});
        await Investment.update({status:"inactive", weeklyEarning:amtToadd}, {where:{id:investmentId}})
        const now = moment();

        const output = `<head>
           <title>TRANSACTION RECEIPT</title>
         </head>
         <body>
         <p>Your Investment was Terminated as per your request.</p>
         <h2> Details Of Transaction </h2>
         <ul>
             
             <li>Name:.....................${user.name} </li>
             <li>Email:.....................${user.email} </li>
             <li>Investment Package:.....................${investment.package.name} Plan</li>
             <li>Capital:.....................N${investment.amount }</li>
             <li>Investment Commission:.....................${investment.package.commission}% </li>
             <li>Cancellation charge:.....................20% of N${investment.amount } </li>
             <li>Money Returned:.......................N${amount } </li>
             <li>Date of Investment:.....................${investment.createdAt}</li>
             <li>Expected Date of Expiration:.....................${investment.expiredAt}</li>
             <li>Date of Cancellation:.....................${now}</li>
         </ul>

         <h5>Thank You for Investing with Us!</h5>
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
         subject: "[PayBuyMax] Investment Cancellation Receipt", // Subject line
         text: "PayBuyMax", // plain text body
         html: output, // html body
       };
       const sendMail = transporter.sendMail(mailOptions, async(err, info) => {
         if (err) {
             console.log(err);
           return res.json({msg:"Error sending mail, please try again"});
           
         } else {
            req.flash('success', "Investment Canclled Successfully");
            res.redirect("back");
           
         }
       });
        
    } catch (error) {
        console.log(error)
        req.flash('error', "Server error!");
        res.redirect("back");
    }
}