// package imports
const bcrypt = require("bcryptjs");
const Sequelize = require("sequelize");
const uniqueString = require("unique-string");
const nodemailer = require("nodemailer");
const speakeasy = require("speakeasy");
const moment = require("moment");
const generateUniqueId = require("generate-unique-id");

const { stripHtml} = require("../helpers/helpers")

// local imports
const parameters = require("../config/params");
const resetpassword = require("../models/resetpassword");
const Users = require("../models").User;
const ResetPasswords = require("../models").ResetPassword;
const Referrals = require("../models").Referral;
const Chats = require("../models").Chat;
const Admins = require("../models").Admin;
const Verifications = require("../models").Verification;
const helpers = require("../helpers/cryptedge_helpers");
const countries = require("../libs/Data");
const mailService = require("../config/mailService");
const Coin = require("../models").Coin;
const Product = require("../models").Product;
const Blog = require("../models").Blog;
const { error } = require("shelljs");
// imports initialization
const Op = Sequelize.Op;

exports.index = (req, res, next) => {
  //res.render("auths/login2");
  res.render("index");
};

exports.adminLogin = (req, res, next) => {
  res.render("auths/loginb");
};

exports.signInUser = (req, res, next) => {
  //res.render("auths/login2");
  res.render("loginb");
};

exports.signUpUser = (req, res, next) => {
  //res.render("auths/login2");
  res.render("signup");
};

exports.about = (req, res, next) => {
  //res.render("auths/login2");
  res.render("about");
};

exports.faq = (req, res, next) => {
  //res.render("auths/login2");
  res.render("faq");
};

exports.blog = (req, res, next) => {

  Blog.findAll({where:{publish: true}, order: [
    ['createdAt', 'DESC'],
]}).then(blogs =>{
  console.log(blogs);
    res.render("blog", {
      blogs,
      moment,
      stripHtml
    });
  }).catch(error =>{
    req.flash("error", "Server Error!");
    res.redirect("/");
  })
  
};

exports.pricing = (req, res, next) => {
  //res.render("auths/login2");
  res.render("pricing");
};

exports.terms = (req, res, next) => {
  //res.render("auths/login2");
  res.render("terms");
};

exports.forgotPassword = (req, res, next) => {
  //res.render("auths/login2");
  res.render("forgot");
};

exports.contact = (req, res, next) => {
  //res.render("auths/login2");
  res.render("contact");
};

exports.privacy = (req, res, next) => {
  //res.render("auths/login2");
  res.render("privacy");
};

exports.training = (req, res, next) => {
  //res.render("auths/login2");
  res.render("training");
};

exports.getResendLink = (req, res, next) => {
  res.render("resendlink");
};

exports.loginAdmin = async(req,res,next) =>{
  try {
    const {email, password } = req.body;
    if (!email || !password) {
      req.flash("error", "Please Fill all Fields!");
      res.redirect("back");
    }else{
      const admin = await Admins.findOne({where: {email}});
      if (!admin) {
        req.flash("error", "Invalid Details!");
        res.redirect("back");
      }else{
        const compare = await bcrypt.compareSync(password, admin.password);
        if (!compare) {
          req.flash("error", "Incorrect Password!");
          res.redirect("back");
        }else{
          if (admin.level === 2 ) {
            req.flash("success", "LoggedIn Successfully");
            req.session.adminId = admin.id;
            req.session.role = admin.level
            res.redirect('/agent/home')
          }else{
            req.flash("success", "LoggedIn Successfully");
            req.session.adminId = admin.id;
            req.session.role = admin.level
            res.redirect('/dashboard')
          }
        }
      }
    }
  } catch (err) {
    req.flash("error", "Server Error!");
    res.redirect("back");
  }
}

exports.createAdmin = async(req, res, next)=>{
  const mailformat = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  try {
    const {name, email, password, level} = req.body;
    if (!name || !email || !password || !level) {
      req.flash("danger", "Please Fill all Fields!");
      res.redirect("back");
    } else if (!email.match(mailformat)){
      req.flash("warning", "Wrong Email Format!");
      res.redirect("back");
    }else if(password.length < 5) {
      req.flash("warning", "Password should be more than 5 characters!");
      res.redirect("back");
    }else{
      const admin = await Admins.findOne({where: {email}});
      if(admin) {
        req.flash("warning", "This Email already exists!");
        res.redirect("back");
      }else{
        
        const hashPwd = await bcrypt.hashSync(password, 10);
        const newAdmin = await Admins.create({name, email, password:hashPwd, level});
        req.flash("success", "Admin Created Succsessfully");
        res.redirect("back");
      }
    }
  } catch (err) {
    req.flash("danger", "Server Error!");
    res.redirect("back");
  }
}

exports.postResendLink = async (req, res, next) => {
  const { email } = req.body;
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
        from: ` "PayBuyMax" <${parameters.EMAIL_USERNAME}>`, // sender address
        to: `${user.email}`, // list of receivers
        subject: "[PayBuyMax] Please activate your account", // Subject line
        text: "PayBuyMax", // plain text body
        html: output, // html body
      };
      const sendMail = transporter.sendMail(mailOptions, (error, info) => {
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

exports.getLink = (req, res, next) => {
  res.render("forgot");
};

exports.twofaPage = (req, res, next) => {
  Verifications.findOne({
    where: {
      user_id: {
        [Op.eq]: req.session.userId,
      },
    },
  })
    .then((verified) => {
      if (
        verified &&
        (verified.twofa_status == 1 || verified.twofa_status == "1")
      ) {
        res.render("auths/auth_twofa", {
          imageurl: verified.twofa_image,
        });
      } else {
        res.redirect("/");
      }
    })
    .catch((error) => {
      res.redirect("/");
    });
};

exports.emailFaPage = (req, res, next) => {
  Users.findOne({
    where: {
      id: {
        [Op.eq]: req.session.userId,
      },
    },
  })
    .then((user) => {
      Verifications.findOne({
        where: {
          user_id: {
            [Op.eq]: req.session.userId,
          },
        },
      })
        .then((verified) => {
          if (
            verified &&
            (verified.email_status == 1 || verified.email_status == "1")
          ) {
            let email_value = helpers.makeid();
            Verifications.update(
              {
                email_code: email_value,
              },
              {
                where: {
                  user_id: {
                    [Op.eq]: req.session.userId,
                  },
                },
              }
            )
              .then((auth) => {
                const output = `<html>
                                        <head>
                                          <title>PayBuyMax Email Authentication</title>
                                        </head>
                                        <body>
                                        <p>Use the below value to verify your email</p></br>
                                        <strong>${email_value}</strong>
                                        
                                       
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

                let mailOptions = {
                  from: ` "PayBuyMax" <${parameters.EMAIL_USERNAME}>`, // sender address
                  to: `${user.email}`, // list of receivers
                  subject: "[PayBuyMax] Email Authentication", // Subject line
                  text: "PayBuyMax", // plain text body
                  html: output, // html body
                };
                transporter.sendMail(mailOptions, (error, info) => {
                  if (error) {
                    console.log(error);
                    req.flash("error", "Error sending mail, refresh page");
                    res.render("auths/auth_email");
                  } else {
                    console.log("success");
                    req.flash("success", "Reset link sent to email");
                    res.render("auths/auth_email");
                  }
                });
                //res.render("auths/auth_email");
              })
              .catch((error) => {
                res.redirect("/");
              });
          } else {
            res.redirect("/");
          }
        })
        .catch((error) => {
          res.redirect("/");
        });
    })
    .catch((error) => {
      res.redirect("/");
    });
};

exports.verify2FaKey = (req, res, next) => {
  const { twofa } = req.body;
  if (!twofa) {
    req.flash("warning", "Enter Verification Code");
    res.redirect("back");
  } else {
    Verifications.findOne({
      where: {
        user_id: {
          [Op.eq]: req.session.userId,
        },
      },
    })
      .then((verified) => {
        if (
          verified &&
          (verified.twofa_status == 1 || verified.twofa_status == "1")
        ) {
          let twoWayStatus = speakeasy.totp.verify({
            secret: verified.twofa_code,
            encoding: "base32",
            token: twofa,
          });
          //res.redirect("back");
          if (twoWayStatus) {
            //res.redirect("/home");
            //req.flash('success', "Two-Factor code validated");
            req.session.userTfa = 1;
            res.redirect("home");
          } else {
            req.flash("warning", "Enter a Valid code");
            res.redirect("back");
          }
        } else {
          res.redirect("/");
        }
      })
      .catch((error) => {
        res.redirect("/");
      });
  }
};

exports.emailVerification = (req, res, next) => {
  let email = req.query.email;
  let token = req.query.token;
  Users.findOne({
    where: {
      [Op.and]: [
        {
          email: {
            [Op.eq]: email,
          },
        },
        {
          email_token: {
            [Op.eq]: token,
          },
        },
      ],
    },
  }).then((user) => {
    Users.update(
      {
        activated: 1,
      },
      {
        where: {
          email: {
            [Op.eq]: user.email,
          },
        },
      }
    ).then((updated) => {
      
        req.flash(
          "success",
          "Email activation successful, please login to your account"
        );
        res.redirect("/login");
    });
  });
};

exports.verifyEmail = (req, res, next) => {
  const { email_code } = req.body;
  if (!email_code) {
    req.flash("warning", "Enter Verification Code");
    res.redirect("back");
  } else {
    Verifications.findOne({
      where: {
        user_id: {
          [Op.eq]: req.session.userId,
        },
      },
    })
      .then((verified) => {
        if (
          verified &&
          (verified.email_status == 1 || verified.email_status == "1")
        ) {
          if (verified.email_code == email_code) {
            req.session.userTFEmail = 1;
            res.redirect("home");
          } else {
            req.flash("warning", "Enter a Valid code");
            res.redirect("back");
          }
        } else {
          res.redirect("/");
        }
      })
      .catch((error) => {
        res.redirect("/");
      });
  }
};

exports.resetPassword = (req, res, next) => {
  let email = req.query.email;
  let token = req.query.token;

  ResetPasswords.findOne({
    where: {
      [Op.and]: [
        {
          user_email: {
            [Op.eq]: email,
          },
        },
        {
          token: {
            [Op.eq]: token,
          },
        },
      ],
    },
  })
    .then((reset) => {
      if (reset) {
        // save as session the reset email and reset token
        req.session.resetEmail = email;
        req.session.resetToken = token;

        res.render("resetfrommail");
      } else {
        req.flash("warning", "Invalid reset details");
        res.redirect("/");
      }
    })
    .catch((error) => {
      req.flash("error", "Server Error, try again!");
      res.redirect("/");
    });
};

exports.postResetPassword = (req, res, next) => {
  const { password1, password2 } = req.body;
  if (!password1 || !password2) {
    req.flash("warning", "Enter Passwords");
    res.redirect("back");
  } else if (password1 != password2) {
    req.flash("warning", "Passwords must match");
    res.redirect("back");
  } else if (password1.length < 6) {
    req.flash("warning", "Passwords must be greater than 5 letters");
    res.redirect("back");
  } else {
    let currentPassword = bcrypt.hashSync(password1, 10);
    Users.update(
      {
        password: currentPassword,
      },
      {
        where: {
          email: {
            [Op.eq]: req.session.resetEmail,
          },
        },
      }
    )
      .then((update) => {
        req.flash("success", "Password changed successfully!");
        res.redirect("/login");
      })
      .catch((error) => {
        req.flash("error", "Server Error, try again!");
        res.redirect("back");
      });
  }
};

exports.postGetLink = async(req, res, next) => {
  const { email } = req.body;
  try {
    if (!email) {
      req.flash("warning", "Please enter email");
      res.redirect("back");
    } else {
      const user =  await Users.findOne({
        where: {
          email: {
            [Op.eq]: email,
          },
        },
      });
        
      if (!user) {
        req.flash("warning", "Email not found");
        res.redirect("back");
      }else{
        let token = uniqueString();
        const output = `<html>
              <head>
                <title>Reset Password link for Bitmint</title>
              </head>
              <body>
              <p>You requested to change your password, please ignore If you didn't make the request</p>
              <a style="width: 100px; background: #FFA73B; color: #fff; height: 50px; padding: 12px 20px; text-decoration: none; margin-top: 30px;" href='${parameters.SITE_URL}/resetpassword?email=${email}&token=${token}'>RESET PASSWORD</a>
              </body>
        </html>`;
          
          let transporter = nodemailer.createTransport({
            host: parameters.EMAIL_HOST,
            port: parameters.EMAIL_PORT,
            secure: false, // true for 465, false for other ports
            auth: {
            user: parameters.EMAIL_USERNAME, // generated ethereal user
            pass: parameters.EMAIL_PASSWORD, // generated ethereal password
            },
          });
          
           // send mail with defined transport object
          let mailOptions = {
            from: ` "PayBuyMax" <${parameters.EMAIL_USERNAME}>`, // sender address
            to: `${email}`, // list of receivers
            subject: "[PayBuyMax] Please reset your password", // Subject line
            text: "PayBuyMax", // plain text body
            html: output, // html body
          };
  
          // insert into forgot password the value of the token and email
          // if email exists already update else insert new
          const reset = await ResetPasswords.findOne({
            where: {
              user_email: {
                [Op.eq]: email,
              },
            },
          })
          if (reset) {
            const update = await ResetPasswords.update(
              {
                token: token,
              },
              {
                where: {
                  user_email: {
                    [Op.eq]: email,
                  },
                },
              }
            )
          }else{
            const newRes = await ResetPasswords.create({
              user_email: email,
              token: token,
              status: 0,
            })
          }
  
          // Send mail
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              req.flash("error", "Error sending mail");
              res.redirect("back");
            } else {
              req.flash("success", "Reset link sent to email");
              res.redirect("back");
            }
          });
      }
    }
  } catch (error) {
    req.flash("error", "Try again, something went wrong!");
    res.redirect("back");
  }
};



exports.signup = (req, res, next) => {
  // let reference = req.query.ref;
  // if (reference != null) {
  //     req.session.ref = reference;
  // } else {
  //     req.session.ref = "";
  // }
  res.render("registerb");
};

exports.login = (req, res, next) => {
  const { email, password } = req.body;
  if (email && password) {
    Users.findOne({
      where: {
        email: {
          [Op.eq]: email,
        },
      },
    })
      .then((user) => {
        if (user.activated !== 1) {
          req.flash("error", "Check your email for activation link");
          res.redirect("back");
        } else {
          
          if (bcrypt.compareSync(password, user.password)) {
            req.session.userId = user.id;
            // req.session.role = user.role;
            res.redirect("/home");
          } else {
            req.flash("warning", "Invalid credentials");
            res.redirect("back");
          }
        }
      })
      .catch((error) => {
        console.log(error);
        req.flash("error", "Try again, something went wrong!!");
        res.redirect("back");
      });
  } else {
    req.flash("warning", "Invalid credentials");
    res.redirect("back");
  }
};

exports.register = async (req, res) => {
  const { email, password } = req.body;
  const mailformat = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  const digits_only = (string) =>
    [...string].every((c) => "+0123456789".includes(c));

  try {
    if (!email || !password) {
      req.flash("warning", "Please Fill all Fields");
      res.redirect("back");
    } else if (!email.match(mailformat)) {
      req.flash("warning", "Enter valid email address");
      res.redirect("back");
    } else if (password.length < 6) {
      req.flash("warning", "Passwords must be greater than 5 letters");
      res.redirect("back");
    } else {
      let uniqueRef = generateUniqueId({
        length: 8,
        useLetters: true,
      });

      console.log(uniqueRef);
      const user = await Users.findOne({ where: { email } });
      if (user) {
        req.flash("warning", "Email already taken!");
        res.redirect("back");
      }else{

        const hasPassword = bcrypt.hashSync(password, 10);
        const reference = await Users.findOne({
            where: {
            reference: {
                [Op.eq]: req.session.ref,
            },
            },
        });
        let newUser;
        if (reference) {
            newUser = await Users.create({
            email,
            password: hasPassword,
            reference: uniqueRef,
            referral_id: reference.id,
            });
            const referral = await Referrals.create({
                    referral_id: reference.id,
                    user_id: newUser.id,
            })
            req.session.ref = "";
            
        }else{
            newUser = await Users.create({
                email,
                password: hasPassword,
                reference:uniqueRef,
            });
            
        }
        const savedUser = await Users.findOne({where:{email}})
            let user_email = savedUser.email;
            let user_name = savedUser.name;
            let email_token = uniqueString();
            const products = await Product.findAll();
        await Promise.all(products.map(async product =>{
            await Coin.create({userId: savedUser.id, coinId: product.id})
        }));
            const output = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
            <html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" style="width:100%;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0">
            <head>
            <meta charset="UTF-8">
            <meta content="width=device-width, initial-scale=1" name="viewport">
            <meta name="x-apple-disable-message-reformatting">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta content="telephone=no" name="format-detection">
            <title>New email template 2021-04-12</title>
            <!--[if (mso 16)]>
            <style type="text/css">
            a {text-decoration: none;}
            </style>
            <![endif]-->
            <!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]-->
            <!--[if gte mso 9]>
            <xml>
            <o:OfficeDocumentSettings>
            <o:AllowPNG></o:AllowPNG>
            <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
            </xml>
            <![endif]-->
            <!--[if !mso]><!-- -->
            <link href="https://fonts.googleapis.com/css?family=Lato:400,400i,700,700i" rel="stylesheet">
            <!--<![endif]-->
            <style type="text/css">
            #outlook a {
            padding:0;
            }
            .ExternalClass {
            width:100%;
            }
            .ExternalClass,
            .ExternalClass p,
            .ExternalClass span,
            .ExternalClass font,
            .ExternalClass td,
            .ExternalClass div {
            line-height:100%;
            }
            .es-button {
            mso-style-priority:100!important;
            text-decoration:none!important;
            }
            a[x-apple-data-detectors] {
            color:inherit!important;
            text-decoration:none!important;
            font-size:inherit!important;
            font-family:inherit!important;
            font-weight:inherit!important;
            line-height:inherit!important;
            }
            .es-desk-hidden {
            display:none;
            float:left;
            overflow:hidden;
            width:0;
            max-height:0;
            line-height:0;
            mso-hide:all;
            }
            @media only screen and (max-width:600px) {p, ul li, ol li, a { line-height:150%!important } h1 { font-size:30px!important; text-align:center; line-height:120%!important } h2 { font-size:26px!important; text-align:center; line-height:120%!important } h3 { font-size:20px!important; text-align:center; line-height:120%!important } .es-header-body h1 a, .es-content-body h1 a, .es-footer-body h1 a { font-size:30px!important } .es-header-body h2 a, .es-content-body h2 a, .es-footer-body h2 a { font-size:26px!important } .es-header-body h3 a, .es-content-body h3 a, .es-footer-body h3 a { font-size:20px!important } .es-menu td a { font-size:16px!important } .es-header-body p, .es-header-body ul li, .es-header-body ol li, .es-header-body a { font-size:16px!important } .es-content-body p, .es-content-body ul li, .es-content-body ol li, .es-content-body a { font-size:16px!important } .es-footer-body p, .es-footer-body ul li, .es-footer-body ol li, .es-footer-body a { font-size:16px!important } .es-infoblock p, .es-infoblock ul li, .es-infoblock ol li, .es-infoblock a { font-size:12px!important } *[class="gmail-fix"] { display:none!important } .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3 { text-align:center!important } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3 { text-align:right!important } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3 { text-align:left!important } .es-m-txt-r img, .es-m-txt-c img, .es-m-txt-l img { display:inline!important } .es-button-border { display:block!important } a.es-button, button.es-button { font-size:20px!important; display:block!important; border-width:15px 25px 15px 25px!important } .es-btn-fw { border-width:10px 0px!important; text-align:center!important } .es-adaptive table, .es-btn-fw, .es-btn-fw-brdr, .es-left, .es-right { width:100%!important } .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width:100%!important; max-width:600px!important } .es-adapt-td { display:block!important; width:100%!important } .adapt-img { width:100%!important; height:auto!important } .es-m-p0 { padding:0px!important } .es-m-p0r { padding-right:0px!important } .es-m-p0l { padding-left:0px!important } .es-m-p0t { padding-top:0px!important } .es-m-p0b { padding-bottom:0!important } .es-m-p20b { padding-bottom:20px!important } .es-mobile-hidden, .es-hidden { display:none!important } tr.es-desk-hidden, td.es-desk-hidden, table.es-desk-hidden { width:auto!important; overflow:visible!important; float:none!important; max-height:inherit!important; line-height:inherit!important } tr.es-desk-hidden { display:table-row!important } table.es-desk-hidden { display:table!important } td.es-desk-menu-hidden { display:table-cell!important } .es-menu td { width:1%!important } table.es-table-not-adapt, .esd-block-html table { width:auto!important } table.es-social { display:inline-block!important } table.es-social td { display:inline-block!important } }
            </style>
            </head>
            <body style="width:100%;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0">
            <div class="es-wrapper-color" style="background-color:#F4F4F4">
            <!--[if gte mso 9]>
            <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
            <v:fill type="tile" color="#f4f4f4"></v:fill>
            </v:background>
            <![endif]-->
            <table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top">
            <tr class="gmail-fix" height="0" style="border-collapse:collapse">
            <td style="padding:0;Margin:0">
            <table cellspacing="0" cellpadding="0" border="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:500px">
            <tr style="border-collapse:collapse">
            <td cellpadding="0" cellspacing="0" border="0" style="padding:0;Margin:0;line-height:1px;min-width:500px" height="0"><img src="https://retfbx.stripocdn.email/content/guids/CABINET_837dc1d79e3a5eca5eb1609bfe9fd374/images/41521605538834349.png" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;max-height:0px;min-height:0px;min-width:500px;width:500px" alt width="500" height="1"></td>
            </tr>
            </table></td>
            </tr>
            <tr style="border-collapse:collapse">
            <td valign="top" style="padding:0;Margin:0">
            <table class="es-header" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:#FFA73B;background-repeat:repeat;background-position:center top">
            <tr style="border-collapse:collapse">
            <td align="center" style="padding:0;Margin:0">
            <table class="es-header-body" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:500px">
            <tr style="border-collapse:collapse">
            <td align="left" style="Margin:0;padding-bottom:10px;padding-left:10px;padding-right:10px;padding-top:20px">
            <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
            <tr style="border-collapse:collapse">
            <td valign="top" align="center" style="padding:0;Margin:0;width:480px">
            <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
            <tr style="border-collapse:collapse">
            <td align="center" style="padding:0;Margin:0;font-size:0px"><img class="adapt-img" src="https://res.cloudinary.com/yhomi1996/image/upload/v1627730985/ecoin/logo_njmt5g.png" alt style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic" width="330"></td>
            </tr>
            </table></td>
            </tr>
            </table></td>
            </tr>
            </table></td>
            </tr>
            </table>
            <table class="es-content" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
            <tr style="border-collapse:collapse">
            <td style="padding:0;Margin:0;background-color:#FFA73B" bgcolor="#ffa73b" align="center">
            <table class="es-content-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:500px" cellspacing="0" cellpadding="0" align="center">
            <tr style="border-collapse:collapse">
            <td align="left" style="padding:0;Margin:0">
            <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
            <tr style="border-collapse:collapse">
            <td valign="top" align="center" style="padding:0;Margin:0;width:500px">
            <table style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:separate;border-spacing:0px;background-color:#FFFFFF;border-radius:4px" width="100%" cellspacing="0" cellpadding="0" bgcolor="#ffffff" role="presentation">
            <tr style="border-collapse:collapse">
            <td align="center" style="Margin:0;padding-bottom:5px;padding-left:30px;padding-right:30px;padding-top:35px"><h1 style="Margin:0;line-height:58px;mso-line-height-rule:exactly;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;font-size:48px;font-style:normal;font-weight:normal;color:#111111">Welcome!</h1></td>
            </tr>
            <tr style="border-collapse:collapse">
            <td bgcolor="#ffffff" align="center" style="Margin:0;padding-top:5px;padding-bottom:5px;padding-left:20px;padding-right:20px;font-size:0">
            <table width="100%" height="100%" cellspacing="0" cellpadding="0" border="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
            <tr style="border-collapse:collapse">
            <td style="padding:0;Margin:0;border-bottom:1px solid #FFFFFF;background:#FFFFFF none repeat scroll 0% 0%;height:1px;width:100%;margin:0px"></td>
            </tr>
            </table></td>
            </tr>
            </table></td>
            </tr>
            </table></td>
            </tr>
            </table></td>
            </tr>
            </table>
            <table class="es-content" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
            <tr style="border-collapse:collapse">
            <td align="center" style="padding:0;Margin:0">
            <table class="es-content-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:500px" cellspacing="0" cellpadding="0" align="center">
            <tr style="border-collapse:collapse">
            <td align="left" style="padding:0;Margin:0">
            <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
            <tr style="border-collapse:collapse">
            <td valign="top" align="center" style="padding:0;Margin:0;width:500px">
            <table style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:separate;border-spacing:0px;border-radius:4px;background-color:#FFFFFF" width="100%" cellspacing="0" cellpadding="0" bgcolor="#ffffff" role="presentation">
            <tr style="border-collapse:collapse">
            <td class="es-m-txt-l" bgcolor="#ffffff" align="left" style="Margin:0;padding-top:20px;padding-bottom:20px;padding-left:30px;padding-right:30px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;line-height:27px;color:#666666;font-size:18px">Hi, <strong>${user_email}</strong><br>We're excited to have you get started. First, you need to activate&nbsp;your account. Just press the button below.</p></td>
            </tr>
            <tr style="border-collapse:collapse">
            <td align="center" style="Margin:0;padding-left:10px;padding-right:10px;padding-top:35px;padding-bottom:35px"><span class="es-button-border" style="border-style:solid;border-color:#FFA73B;background:1px;border-width:1px;display:inline-block;border-radius:2px;width:auto"><a href="${parameters.SITE_URL}/verifyemail?email=${user_email}&token=${email_token}" class="es-button" target="_blank" style="mso-style-priority:100 !important;text-decoration:none;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;color:#FFFFFF;font-size:20px;border-style:solid;border-color:#FFA73B;border-width:15px 30px;display:inline-block;background:#FFA73B;border-radius:2px;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;font-weight:normal;font-style:normal;line-height:24px;width:auto;text-align:center">Activate Account</a></span></td>
            </tr>
        
        
            <tr style="border-collapse:collapse">
            <td class="es-m-txt-l" align="left" style="padding:0;Margin:0;padding-top:20px;padding-left:30px;padding-right:30px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;line-height:27px;color:#666666;font-size:18px">If you have any questions, just reply to this email — <strong>Info@paybuymax.com,</strong> we're always happy to help out.</p></td>
            </tr>
            <tr style="border-collapse:collapse">
            <td class="es-m-txt-l" align="left" style="Margin:0;padding-top:20px;padding-left:30px;padding-right:30px;padding-bottom:40px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;line-height:27px;color:#666666;font-size:18px">Cheers,</p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;line-height:27px;color:#666666;font-size:18px">The PayBuyMax Team</p></td>
            </tr>
            </table></td>
            </tr>
            </table></td>
            </tr>
            </table></td>
            </tr>
            </table>
            <table class="es-content" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
            <tr style="border-collapse:collapse">
            <td align="center" style="padding:0;Margin:0">
            <table class="es-content-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:500px" cellspacing="0" cellpadding="0" align="center">
            <tr style="border-collapse:collapse">
            <td align="left" style="padding:0;Margin:0">
            <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
            <tr style="border-collapse:collapse">
            <td valign="top" align="center" style="padding:0;Margin:0;width:500px">
            <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
            <tr style="border-collapse:collapse">
            <td align="center" style="Margin:0;padding-top:10px;padding-bottom:20px;padding-left:20px;padding-right:20px;font-size:0">
            <table width="100%" height="100%" cellspacing="0" cellpadding="0" border="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
            <tr style="border-collapse:collapse">
            <td style="padding:0;Margin:0;border-bottom:1px solid #F4F4F4;background:#FFFFFF none repeat scroll 0% 0%;height:1px;width:100%;margin:0px"></td>
            </tr>
            </table></td>
            </tr>
            </table></td>
            </tr>
            </table></td>
            </tr>
            </table></td>
            </tr>
            </table>
            <table class="es-content" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
            <tr style="border-collapse:collapse">
            <td align="center" style="padding:0;Margin:0">
            <table class="es-content-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:500px" cellspacing="0" cellpadding="0" align="center">
            <tr style="border-collapse:collapse">
            <td align="left" style="Margin:0;padding-left:20px;padding-right:20px;padding-top:30px;padding-bottom:30px">
            <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
            <tr style="border-collapse:collapse">
            <td valign="top" align="center" style="padding:0;Margin:0;width:460px">
            <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
            <tr style="border-collapse:collapse">
            <td class="es-infoblock made_with" align="center" style="padding:0;Margin:0;line-height:0px;font-size:0px;color:#CCCCCC"><a target="_blank" href="https://viewstripo.email/?utm_source=templates&utm_medium=email&utm_campaign=software2&utm_content=trigger_newsletter" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#CCCCCC;font-size:12px"><img src="https://res.cloudinary.com/yhomi1996/image/upload/v1627730985/ecoin/logoicon-pic_hnfhlz.png" alt width="125" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"></a></td>
            </tr>
            </table></td>
            </tr>
            </table></td>
            </tr>
            </table></td>
            </tr>
            </table></td>
            </tr>
            </table>
            </div>
            </body>
            </html>`
    let transporter = nodemailer.createTransport({
        host: parameters.EMAIL_HOST,
        port: parameters.EMAIL_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
        user: parameters.EMAIL_USERNAME, // generated ethereal user
        pass: parameters.EMAIL_PASSWORD, // generated ethereal password
        },
    });

    // send mail with defined transport object
        let mailOptions = {
            from: ` "PayBuyMax" <${parameters.EMAIL_USERNAME}>`, // sender address
            to: `${email}`, // list of receivers
            subject: "[PayBuyMax] Please activate your account", // Subject line
            text: "PayBuyMax", // plain text body
            html: output, // html body
        };
        transporter.sendMail(mailOptions, async(err, info)=>{
            if (err) {
              console.log(err);
                req.flash("error", "Error sending mail");
                res.redirect("back");
            }else{
                console.log('Mail Sent: ', info);
                const update = await Users.update({email_token}, {where: {email}});
                req.flash(
                    "success",
                    "Registration successful, check your email for activation link. "
                );
                res.redirect("/login");
                req.session.ref = "";
            }
        })

        }
    }
  } catch (err) {
    console.log(err);
    req.flash("danger", "Server Error!");
    res.redirect("back");
  }
};


exports.changePassword = (req, res, next) => {
  const { oldPassword, password, confirmPassword } = req.body;
  // check if any of them are empty
  if (!oldPassword || !password || !confirmPassword) {
    req.flash("warning", "enter all fields");
    res.redirect("back");
  } else if (confirmPassword != password) {
    req.flash("warning", "passwords must match");
    res.redirect("back");
  } else if (confirmPassword.length < 6 || password.length < 6) {
    req.flash("warning", "passwords must be greater than 5 letters");
    res.redirect("back");
  } else {
    Users.findOne({
      where: {
        id: {
          [Op.eq]: req.session.userId,
        },
      },
    })
      .then((response) => {
        if (bcrypt.compareSync(oldPassword, response.password)) {
          // password correct
          // update it then
          let currentPassword = bcrypt.hashSync(password, 10);
          Users.update(
            {
              password: currentPassword,
            },
            {
              where: {
                id: {
                  [Op.eq]: req.session.userId,
                },
              },
            }
          )
            .then((response) => {
              req.flash("success", "Password updated successfully");
              res.redirect("back");
            })
            .catch((error) => {
              req.flash("error", "something went wrong");
              res.redirect("back");
            });
        } else {
          req.flash("warning", "incorrect old password");
          res.redirect("back");
        }
      })
      .catch((error) => {
        req.flash("error", "something went wrong");
        res.redirect("back");
      });
  }
};

exports.changeAdminPassword = (req, res, next) => {
  const { oldPassword, password, confirmPassword } = req.body;
  // check if any of them are empty
  if (!oldPassword || !password || !confirmPassword) {
    req.flash("warning", "enter all fields");
    res.redirect("back");
  } else if (confirmPassword != password) {
    req.flash("warning", "passwords must match");
    res.redirect("back");
  } else if (confirmPassword.length < 6 || password.length < 6) {
    req.flash("warning", "passwords must be greater than 5 letters");
    res.redirect("back");
  } else {
    Admins.findOne({
      where: {
        id: {
          [Op.eq]: req.session.adminId,
        },
      },
    })
      .then((response) => {
        if (bcrypt.compareSync(oldPassword, response.password)) {
          // password correct
          // update it then
          let currentPassword = bcrypt.hashSync(password, 10);
          Admins.update(
            {
              password: currentPassword,
            },
            {
              where: {
                id: {
                  [Op.eq]: req.session.adminId,
                },
              },
            }
          )
            .then((response) => {
              req.flash("success", "Password updated successfully");
              res.redirect("back");
            })
            .catch((error) => {
              req.flash("error", "something went wrong");
              res.redirect("back");
            });
        } else {
          req.flash("warning", "incorrect old password");
          res.redirect("back");
        }
      })
      .catch((error) => {
        req.flash("error", "something went wrong");
        res.redirect("back");
      });
  }
};

exports.logout = (req, res, next) => {
  // req.session.destroy(err => {
  //     if (err) {
  //         return res.redirect("/home");
  //     }
  //     res.clearCookie(parameters.SESSION_NAME);
  //     res.redirect("/");
  // });
  req.session = null;
  res.redirect("/");
};
