// package imports
const express = require('express');
const session = require("express-session");
const flash = require("express-flash-messages");
const passport = require("passport");
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const FacebookStrategy = require("passport-facebook").Strategy;
//const GoogleStrategy = require('passport-google-oauth2').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const Sequelize = require("sequelize");
const Data = require('../libs/Data')
const uniqueString = require('unique-string');
const generateUniqueId = require('generate-unique-id');
const upload = require("../helpers/mult_helper");
const postUpload = require("../helpers/upload");
const cloudinary = require("../helpers/cloudinary");
const multer = require("multer");
const path = require("path");
// const generateUniqueId = require("generate-unique-id");

// imports initialization
const Op = Sequelize.Op;
const router = express.Router();

// local imports
const Users = require("../models").User;
const Referrals = require("../models").Referral;
const parameters = require("../config/params");
const AuthController = require("../controllers/AuthController");
const DashboardController = require("../controllers/DashboardController");
const PackageController = require("../controllers/PackageController");
const ManagerController = require("../controllers/ManagerController");
const UserController = require("../controllers/UserController");

const ChatController = require("../controllers/ChatController");
const WalletController = require("../controllers/WalletController");
const CoinqvestController = require("../controllers/CoinqvestController");
const InvestmentController = require("../controllers/InvestmentController");
const TransactionController = require("../controllers/TransactionController");
const BankDepositController = require("../controllers/BankDepositController");
const KycController = require("../controllers/KycController");
const ProfileController = require("../controllers/ProfileController");
const PaystackController = require("../controllers/PaystackController");
const AuthMiddleware = require("../middlewares/auth_middleware");
const CryptBankController = require('../controllers/CryptBankController');
const PostsController = require('../controllers/PostsController');
const CoinBaseController = require('../controllers/CoinBaseController');
const BinanceController = require('../controllers/BinanceController');
const SEVEN_DAYS = 1000 * 60 * 60 * 24 * 7;

const storage = multer.diskStorage({
    destination:"./public/uploads/",
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    },
  })
  
  const filter = (req,file,cb)=>{
    if(file.mimetype === 'image/jpeg' || file.mimetype ===  'image/jpg' || file.mimetype ===  'image/png'){
      cb(null,true)
    }else{
      cb({error:'You can not upload this type of image'},false)
    }
  }
  
  const uploader = multer({storage:storage,limits:{
        fileSize:1024*1024*5
      },
      fileFilter:filter
  })

// middlewares

router.use(passport.initialize());
router.use(passport.session());
router.use(cookieParser());

// router.use(session({
//     name: parameters.SESSION_NAME,
//     resave: false,
//     saveUninitialized: false,
//     unset: 'destroy',
//     secret: parameters.SESSION_SECRET,
//     cookie: {
//         maxAge: SEVEN_DAYS,
//         sameSite: true,
//         //secure: parameters.NODE_ENV === "production",
//         secure: process.env.NODE_ENV == "production" ? true : false
//     }
// }));

router.use(cookieSession({
    name: parameters.SESSION_NAME,
    keys: [parameters.SESSION_SECRET, parameters.SESSION_SECRET]
  }))

passport.serializeUser(function (user, cb) {
    cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
});

router.use(flash());

// ensuring when users logout they can't go back with back button
router.use(function (req, res, next) {
    if (!req.user)
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
});
// routes

router.post("/upload/test", uploader.single('image'), async(req, res) =>{
    try {
        // const result = await cloudinary.uploader.upload(req.file.path);
        const result = req.file.path
        console.log(req.file);
        return res.json({result})
    } catch (error) {
        console.log(error);
    }
} )

router.use(function(req, res, next) {
    res.locals.role = req.session.role;
    res.locals.countries = Data.countries;
    next();
  });

passport.use(new FacebookStrategy({
        clientID: parameters.CLIENT_ID_FB,
        clientSecret: parameters.CLIENT_SECRET_FB,
        callbackURL: `${parameters.SITE_URL}/auth/facebook/callback`,
        profileFields: ['id', 'displayName', 'emails', 'photos']
    },
    function (accessToken, refreshToken, profile, done) {
        return done(null, profile);
    }
));

passport.use(new GoogleStrategy({
        clientID: parameters.CLIENT_ID_GOOGLE,
        clientSecret: parameters.CLIENT_SECRET_GOOGLE,
        callbackURL: `${parameters.SITE_URL}/auth/google/callback`,
        realm: parameters.SITE_URL,
        passReqToCallback: true
    },
    function (request, accessToken, refreshToken, profile, done) {
        return done(null, profile);
    }
));

router.get("/", AuthController.index);

// Redirect the user to Facebook for authentication.  When complete,
// Facebook will redirect the user back to the application at
//     /auth/facebook/callback
router.get('/auth/facebook', passport.authenticate('facebook', {
    scope: 'email'
}));

// Facebook will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
router.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        failureRedirect: '/'
    }), (req, res) => {
        // if email exists and user does not have token
        // return email exists
        // else try to login the user
        Users.findOne({
                where: {
                    [Op.and]: [{
                            email: {
                                [Op.eq]: req.user.emails[0].value
                            }
                        },
                        {
                            oauth_id: {
                                [Op.eq]: req.user.id
                            }
                        }
                    ],
                },
            })
            .then((user) => {
                if (!user) {
                    let name = req.user.displayName;
                    let email = req.user.emails[0].value;
                    let uniqueRef = generateUniqueId({
                        length: 8,
                        useLetters: true
                      });
                    //let phone = req.body.phone;
                    //let password = bcrypt.hashSync(req.body.password, 10);

                    // check the user with that particular reference
                    Users.findOne({
                            where: {
                                reference: {
                                    [Op.eq]: req.session.ref
                                }
                            }
                        })
                        .then(refuser => {
                            // if the reference is valid, add it to the user as its referral
                            if (refuser) {
                                Users.create({
                                        name: name,
                                        email: email,
                                        //phone: phone,
                                        //password: password,
                                        reference: uniqueRef,
                                        referral_id: refuser.id,
                                        oauth_id: req.user.id,
                                        //facebook_token: req.user.accessToken
                                    })
                                    .then((newuser) => {
                                        // add user to the referral section
                                        Referrals.create({
                                                referral_id: refuser.id,
                                                user_id: newuser.id
                                            })
                                            .then(referral => {
                                                req.session.userId = newuser.id;
                                                req.session.role = newuser.role;
                                                return res.redirect(`${parameters.SITE_URL}/home`);
                                            })
                                            .catch(error => {
                                                req.flash('error', "Something went wrong try again");
                                                res.redirect("back");
                                            });
                                    })
                                    .catch(error => {
                                        req.flash('error', "Something went wrong try again");
                                        res.redirect("back");
                                    });
                            } else {
                                // if referral is not valid, just create the user like that
                                Users.create({
                                        name: name,
                                        email: email,
                                        reference: uniqueRef,
                                        oauth_id: req.user.id,
                                    })
                                    .then((newuser2) => {
                                        req.session.userId = newuser2.id;
                                        req.session.role = newuser2.role;
                                        req.session.views
                                        return res.redirect(`${parameters.SITE_URL}/home`);
                                    })
                                    .catch(error => {
                                        req.flash('error', "Something went wrong try again");
                                        res.redirect("back");
                                    });
                            }
                        })
                        .catch(error => {
                            req.flash('error', "Something went wrong try again");
                            res.redirect("back");
                        });
                } else {
                    req.session.userId = user.id;
                    req.session.role = user.role;
                    return res.redirect(`${parameters.SITE_URL}/home`);
                }
            })
            .catch(error => {
                req.flash('error', "Something went wrong try again");
                res.redirect("back");
            });
    });

router.get('/auth/google',
    passport.authenticate('google', {
        scope: ['email', 'profile']
    }));

router.get('/auth/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/'
    }),
    function (req, res) {
        // if email exists and user does not have token
        // return email exists
        // else try to login the user
        Users.findOne({
                where: {
                    [Op.and]: [{
                            email: {
                                [Op.eq]: req.user.emails[0].value
                            }
                        },
                        {
                            oauth_id: {
                                [Op.eq]: req.user.id
                            }
                        }
                    ],
                },
            })
            .then((user) => {
                if (!user) {
                    let name = req.user.displayName;
                    let email = req.user.emails[0].value;
                    let uniqueRef = generateUniqueId({
                        length: 8,
                        useLetters: true
                      });
                    //let phone = req.body.phone;
                    //let password = bcrypt.hashSync(req.body.password, 10);

                    // check the user with that particular reference
                    Users.findOne({
                            where: {
                                reference: {
                                    [Op.eq]: req.session.ref
                                }
                            }
                        })
                        .then(refuser => {
                            // if the reference is valid, add it to the user as its referral
                            if (refuser) {
                                Users.create({
                                        name: name,
                                        email: email,
                                        //phone: phone,
                                        //password: password,
                                        reference: uniqueRef,
                                        referral_id: refuser.id,
                                        oauth_id: req.user.id,
                                        //facebook_token: req.user.accessToken
                                    })
                                    .then((newuser) => {
                                        // add user to the referral section
                                        Referrals.create({
                                                referral_id: refuser.id,
                                                user_id: newuser.id
                                            })
                                            .then(referral => {
                                                req.session.userId = newuser.id;
                                                req.session.role = newuser.role;
                                                return res.redirect(`${parameters.SITE_URL}/home`);
                                            })
                                            .catch(error => {
                                                req.flash('error', "Something went wrong try again");
                                                res.redirect("back");
                                            });
                                    })
                                    .catch(error => {
                                        req.flash('error', "Something went wrong try again");
                                        res.redirect("back");
                                    });
                            } else {
                                // if referral is not valid, just create the user like that
                                Users.create({
                                        name: name,
                                        email: email,
                                        reference: uniqueRef,
                                        oauth_id: req.user.id,
                                    })
                                    .then((newuser2) => {
                                        req.session.userId = newuser2.id;
                                        req.session.role = newuser2.role;
                                        return res.redirect(`${parameters.SITE_URL}/home`);
                                    })
                                    .catch(error => {
                                        req.flash('error', "Something went wrong try again");
                                        res.redirect("back");
                                    });
                            }
                        })
                        .catch(error => {
                            req.flash('error', "Something went wrong try again");
                            res.redirect("back");
                        });
                } else {
                    req.session.userId = user.id;
                    req.session.role = user.role;
                    return res.redirect(`${parameters.SITE_URL}/home`);
                }
            })
            .catch(error => {
                req.flash('error', "Something went wrong try again");
                res.redirect("back");
            });
    });

router.post("/signin", AuthMiddleware.redirectHome, AuthController.login);
router.get("/signup", AuthController.signUpUser);
router.post("/admin", AuthController.loginAdmin);
router.post("/createAdmin", AuthController.createAdmin);
//router.post("/signup", [AuthMiddleware.redirectHome, AuthMiddleware.authVerirfication], AuthController.register);
//router.get("/signup", AuthController.signup);
router.post("/register", AuthController.register);
router.get("/login", AuthController.signInUser);
router.get('/admin', AuthController.adminLogin)
router.get("/about", AuthController.about);
router.get("/faq", AuthController.faq);
router.get("/blog", AuthController.blog);
router.get("/pricing", AuthController.pricing);
router.get("/contact", AuthController.contact);
router.get("/privacy", AuthController.privacy);
router.get("/training", AuthController.training);
router.get("/terms", AuthController.terms);
router.get("/forgot", AuthController.forgotPassword);
router.post("/edit/user", AuthMiddleware.redirectAdminLogin, WalletController.postEditUser);
router.get("/edit/user/:id", AuthMiddleware.redirectAdminLogin, WalletController.editWallet);
router.get("/resendlink", [AuthMiddleware.redirectHome, AuthMiddleware.authVerirfication], AuthController.getResendLink);
router.post("/resendlink", [AuthMiddleware.redirectHome, AuthMiddleware.authVerirfication], AuthController.postResendLink);
router.get("/reset", [AuthMiddleware.redirectHome, AuthMiddleware.authVerirfication], AuthController.getLink);
router.get('/verifyemail', AuthController.emailVerification);
router.post("/reset", [AuthMiddleware.redirectHome, AuthMiddleware.authVerirfication], AuthController.postGetLink);
router.get("/resetpassword", [AuthMiddleware.redirectHome, AuthMiddleware.authVerirfication], AuthController.resetPassword);
router.post("/resetpassword", [AuthMiddleware.redirectHome, AuthMiddleware.authVerirfication], AuthController.postResetPassword);
router.post("/logout", [AuthMiddleware.redirectLogin, AuthMiddleware.authVerirfication], AuthController.logout);
router.get("/twofactor", AuthController.twofaPage);
router.post("/twofactor",  AuthController.verify2FaKey);
router.get("/validateemail",  AuthController.emailFaPage);
router.post("/validateemail",  AuthController.verifyEmail);
router.get("/home", AuthMiddleware.redirectLogin, DashboardController.home);
router.get("/password", [AuthMiddleware.redirectLogin, AuthMiddleware.authVerirfication], DashboardController.password);
router.get("/admin-password", [AuthMiddleware.redirectAdminLogin, AuthMiddleware.authVerirfication], DashboardController.adminPassword);
router.post("/update-password", [AuthMiddleware.redirectLogin, AuthMiddleware.authVerirfication], AuthController.changePassword);
router.post("/admin-update-password", [AuthMiddleware.redirectAdminLogin, AuthMiddleware.authVerirfication], AuthController.changeAdminPassword);
router.get("/dashboard", AuthMiddleware.redirectAdminLogin, DashboardController.AdminHome);
router.get("/agent/home", AuthMiddleware.redirectAdminLogin, DashboardController.agentHome);

router.get("/coin/product", DashboardController.getCoinsWithProduct);
router.get("/cryptos", AuthMiddleware.redirectLogin, DashboardController.cryptoProducts);
router.get("/gift-card", AuthMiddleware.redirectLogin, DashboardController.giftCardProducts);
// coinqvest routes
router.post("/createcheckout", AuthMiddleware.redirectLogin, CoinqvestController.createCheckout);

router.get('/history',AuthMiddleware.redirectLogin, TransactionController.transactionHistory )
// users specific routes
router.get("/buy/internal", AuthMiddleware.redirectLogin, WalletController.walletPage);
router.get("/fund-wallet", AuthMiddleware.redirectLogin, WalletController.fundYourWallet);
router.get("/wallet-balance", AuthMiddleware.redirectLogin, WalletController.walletBalance);
router.post("/fundwallet", AuthMiddleware.redirectLogin, WalletController.fundWallet);
router.get("/wallet-history", AuthMiddleware.redirectLogin, WalletController.walletFundingHistory);
router.get("/buy", AuthMiddleware.redirectLogin, TransactionController.buyCoin);
router.get("/sell", AuthMiddleware.redirectLogin, TransactionController.sellCoin);
router.get("/sell/coin", AuthMiddleware.redirectLogin, TransactionController.sellBitCoin);
router.get("/method/coin", AuthMiddleware.redirectLogin, TransactionController.getMethodForSelling )
router.get("/sell/external", AuthMiddleware.redirectLogin, TransactionController.sellFromExternalWallet)
router.get("/sell/internal", AuthMiddleware.redirectLogin, TransactionController.sellFromInternalWallet)
router.post("/sell-coin", AuthMiddleware.redirectLogin, TransactionController.sellCoinFromInternalWallet);
router.post("/buy-coin/internal", AuthMiddleware.redirectLogin, TransactionController.BuyCoinFromInternalWallet);
router.get("/rates", AuthMiddleware.redirectLogin, TransactionController.getRates);
router.post("/transaction/code", TransactionController.sendConfirmationCode);
router.post("/withdraw/code", TransactionController.sendConfirmationCodeForWithdraw);
router.get("/generate-receipt", AuthMiddleware.redirectAdminLogin, TransactionController.generateReceiptForExternal);
router.get("/giftcard-receipt", AuthMiddleware.redirectAdminLogin, TransactionController.generateReceiptForGiftCard);
router.post("/giftcard/create-receipt", AuthMiddleware.redirectAdminLogin, TransactionController.createReceiptForGiftCard);
router.post("/external/create-receipt", AuthMiddleware.redirectAdminLogin, TransactionController.createReceiptForExternalTransaction);
router.get("/pending-external/transaction", AuthMiddleware.redirectAdminLogin, TransactionController.getPendingExternalTransaction);
router.get("/pending-gift-card/transaction", AuthMiddleware.redirectAdminLogin, TransactionController.getPendingGiftCardTransaction);
router.get("/pending-internal/transaction", AuthMiddleware.redirectAdminLogin, TransactionController.getPendingInternalTransaction);
router.get("/internal-sell/transaction", AuthMiddleware.redirectAdminLogin, TransactionController.getInternalSellTransaction);
router.get("/approved-external/transaction", AuthMiddleware.redirectAdminLogin, TransactionController.getApprovedExternalTransaction);
router.get("/approved-gift-card/transaction", AuthMiddleware.redirectAdminLogin, TransactionController.getApprovedGiftCardTransaction);
router.get("/approved-internal/transaction", AuthMiddleware.redirectAdminLogin, TransactionController.getApprovedInternalTransaction);
router.get("/view/pending-external/:id", AuthMiddleware.redirectAdminLogin, TransactionController.viewPendingExternalTx);
router.get("/view/pending-gift-card/:id", AuthMiddleware.redirectAdminLogin, TransactionController.viewPendingGiftCardTx);
router.get("/view/pending-internal/:id", AuthMiddleware.redirectAdminLogin, TransactionController.viewPendingInternalTx);
router.get("/view/internal-sell/:id", AuthMiddleware.redirectAdminLogin, TransactionController.viewInternalSellTx);
router.get("/get/exchange/:id", TransactionController.getExchange);
router.get("/get/exchange/rate/:id", TransactionController.getExchangeRate);
router.get("/edit/exchange-rate/:id", AuthMiddleware.redirectAdminLogin, TransactionController.editExchangeRate);
router.get("/check-coin/balance/:userId/:coinId", TransactionController.checkBalance);
router.post("/buy/transaction/code", TransactionController.sendConfirmationCodeForBuy);

router.post("/test/quantity", TransactionController.testQuery)

// users
router.get("/settings", AuthMiddleware.redirectLogin, ProfileController.settingsPage);
router.get("/users", AuthMiddleware.redirectAdminLogin, UserController.allUsers);
router.get("/exchange-rate", AuthMiddleware.redirectAdminLogin, PackageController.ExchangeRate);
router.get("/get/exchange-rate", PackageController.getAllExchangeRate);
router.get("/exchange-rate/:id", PackageController.getExchangeRate);
router.post("/exchange-rate", AuthMiddleware.redirectAdminLogin, PackageController.SaveExchangeRate);
router.post("/update-exchange-rate", PackageController.UpdateExchangeRate);
router.post("/delete/exchange-rate", PackageController.deleteExchangeRate);
router.get("/admins", AuthMiddleware.redirectAdminLogin, UserController.allAdmins);
router.get("/packages_ethereum", AuthMiddleware.redirectLogin, PackageController.usersPackagesEthereum);
router.get("/packages", AuthMiddleware.redirectLogin, PackageController.usersPackages);
router.get("/referrals", AuthMiddleware.redirectLogin, DashboardController.userReferral);
router.get("/get-ref",  DashboardController.getRefferal);
router.get("/allreferrals", AuthMiddleware.redirectAdminLogin, DashboardController.allReferral);
router.get('/adminmessages',AuthMiddleware.redirectAdminLogin, ChatController.adminMessage)
router.get("/viewmessage/:id", AuthMiddleware.redirectLogin, ChatController.readMessage);
router.get("/user_chat", AuthMiddleware.redirectLogin, ChatController.userChatPage);
router.post("/sendmessage", AuthMiddleware.redirectAdminLogin, ChatController.postAdminMessage);
router.get("/messages", AuthMiddleware.redirectLogin, ChatController.allAdminMessages);

router.get("/view-my-internal-sell", AuthMiddleware.redirectLogin, TransactionController.getMyInternalSellTransaction);
router.get("/view-my-internal-buy", AuthMiddleware.redirectLogin, TransactionController.getMyInternalBuyTransaction);
router.get("/view/my-internal-sell/:id", AuthMiddleware.redirectLogin, TransactionController.viewMyInternalSold);
router.get("/view/my-internal-buy/:id", AuthMiddleware.redirectLogin, TransactionController.viewMyInternalBuy);

router.get("/user_kyc", AuthMiddleware.redirectLogin, KycController.userKyc);
router.get("/profile", AuthMiddleware.redirectLogin, ProfileController.profilePage);
router.get("/editprofile", AuthMiddleware.redirectLogin, ProfileController.editProfilePage);
router.get("/profilesettings", AuthMiddleware.redirectLogin, ProfileController.editSettingsPage);
router.post("/editprofile", AuthMiddleware.redirectLogin, ProfileController.updateProfile);
router.post("/updatetwoway", AuthMiddleware.redirectLogin, ProfileController.updateTwoWay);
router.post("/emailtwoway", AuthMiddleware.redirectLogin, ProfileController.updateEmailWay);
router.post("/user_kyc", AuthMiddleware.redirectLogin, KycController.uploadKyc);
router.get("/withdraw",  AuthMiddleware.authVerirfication, TransactionController.withdrawWallet);
router.get("/withdraw-coin",  AuthMiddleware.redirectLogin, TransactionController.withdrawCoin);
router.get("/transfer-history",  AuthMiddleware.redirectLogin, TransactionController.transferHistory);
router.get("/view-transfer/:id",  AuthMiddleware.redirectLogin, TransactionController.transferDetail);
router.post("/userwithdraw",  AuthMiddleware.authVerirfication, TransactionController.withdrawFromWallet);
router.post("/userwithdraw-coin",  AuthMiddleware.authVerirfication, TransactionController.withdrawFromCoinWallet);
router.get("/mywithdraws", AuthMiddleware.redirectLogin, TransactionController.aUserWithdrawals);
router.get("/view-withdrawal/:id", AuthMiddleware.redirectLogin, TransactionController.viewUserWithdrawalDetail);
// router.get("/deposits", AuthMiddleware.redirectLogin, TransactionController.userDeposits);
router.get("/bankdeposits", AuthMiddleware.redirectLogin, BankDepositController.usersUploads);
router.get("/btc-unapproved", AuthMiddleware.redirectAdminLogin, BankDepositController.unApprovedDeposit);
router.get("/btc-approved", AuthMiddleware.redirectAdminLogin, BankDepositController.approvedDeposit);
router.post("/approve-deposit", AuthMiddleware.redirectAdminLogin, BankDepositController.approveDeposits);
router.post("/disapprove-deposit", AuthMiddleware.redirectAdminLogin, BankDepositController.unApproveADeposits);
router.post("/uploadproof", AuthMiddleware.redirectLogin, BankDepositController.uploadBankDeposit);
router.post("/investpackage", AuthMiddleware.redirectLogin, PackageController.investPackage);
router.get("/banklist", AuthMiddleware.redirectLogin, PaystackController.getBanks);
router.post("/verifyAccount", AuthMiddleware.redirectLogin, PaystackController.verifyAccount);
router.post("/createwithdrawal", AuthMiddleware.redirectLogin, PaystackController.createTransferRecipient);
router.get("/unapprovedpaystack", AuthMiddleware.redirectAdminLogin, TransactionController.unappWithdrawPaystack);
router.post("/adminpayout", AuthMiddleware.redirectAdminLogin, PaystackController.payWithPaystack);
router.post("/verify-deposit", AuthMiddleware.redirectLogin, PaystackController.verifyTransaction);

router.get("/dollarpage", AuthMiddleware.redirectAdminLogin, CryptBankController.dollarPage);
router.post("/dollarpage", AuthMiddleware.redirectAdminLogin, CryptBankController.postUpdateDollar);
router.get("/bankdetails", AuthMiddleware.redirectAdminLogin, CryptBankController.cryptBank);
router.post("/bankdetails", AuthMiddleware.redirectAdminLogin, CryptBankController.postUpdateBank);
router.get("/unapproved-kycs", AuthMiddleware.redirectAdminLogin, KycController.unApprovedKyc);
router.get("/approved-kycs", AuthMiddleware.redirectAdminLogin, KycController.approvedKyc);
router.post("/approve-akyc", AuthMiddleware.redirectAdminLogin, KycController.approveAKYC);
router.post("/disapprove-akyc", AuthMiddleware.redirectAdminLogin, KycController.disApproveAKYC);
router.get("/unapproved-withdrawal", AuthMiddleware.redirectAdminLogin, TransactionController.unapprovedWithdrawals);
router.get("/disapproved-withdrawal", AuthMiddleware.redirectAdminLogin, TransactionController.disapprovedWithdrawals);
router.get("/unapproved-coin-withdrawal", AuthMiddleware.redirectAdminLogin, TransactionController.unapprovedCoinWithdrawals);
router.get("/approved-coin-withdrawal", AuthMiddleware.redirectAdminLogin, TransactionController.approvedCoinWithdrawals);
router.get("/coin-withdraw/details/:id", AuthMiddleware.redirectAdminLogin, TransactionController.ViewUnapprovedCoinWithdrawals);
router.get("/approved-withdrawal", AuthMiddleware.redirectAdminLogin, TransactionController.approvedWithdrawals);
router.post("/unapprove-withdrawal", AuthMiddleware.redirectAdminLogin, TransactionController.postDisApproveWithdrawal);
router.post("/approve-transfer", AuthMiddleware.redirectAdminLogin, TransactionController.postApproveCoinWithdrawal);
router.post("/approve-withdrawal", upload.single('reciept'), AuthMiddleware.redirectAdminLogin, TransactionController.postApproveWithdrawal);
router.post("/approve/external-transaction", upload.single('image'), AuthMiddleware.redirectAdminLogin, TransactionController.approveExternalTransaction);
router.post("/approve/gift-card-transaction", upload.single('image'), AuthMiddleware.redirectAdminLogin, TransactionController.approveGiftCardTransaction);
router.post("/approve/internal-transaction", upload.single('image'), AuthMiddleware.redirectAdminLogin, TransactionController.approveInternalTransaction);

router.get("/get/withdraw", DashboardController.getWithdrawal)

router.get("/view-kycs/:id", AuthMiddleware.redirectAdminLogin, KycController.viewAKyc);
router.get("/packages/:id", AuthMiddleware.redirectLogin, PackageController.eachPackage);
router.get("/bankdeposit/:id", AuthMiddleware.redirectAdminLogin, BankDepositController.viewADeposit);
router.get("/withdraw/details/:id", AuthMiddleware.redirectAdminLogin, BankDepositController.viewWithdrawalDetails);
router.get("/chats/:id", AuthMiddleware.redirectAdminLogin, ChatController.chatPage);
router.post("/delete/user", AuthMiddleware.redirectAdminLogin, UserController.deleteUser);
router.post("/delete/admin", AuthMiddleware.redirectAdminLogin, UserController.deleteAdmin);
router.get("/deleted/users", AuthMiddleware.redirectAdminLogin, UserController.viewDeletedUsers);
router.get("/deleted/admins", AuthMiddleware.redirectAdminLogin, UserController.viewDeletedAdmins);
router.post("/restore/user", AuthMiddleware.redirectAdminLogin, UserController.restoreUser);
router.post("/restore/Admin", AuthMiddleware.redirectAdminLogin, UserController.restoreAdmin);

// packages & Coins
router.get("/add/package", AuthMiddleware.redirectAdminLogin, PackageController.addPackage);
router.get("/add/coin", AuthMiddleware.redirectAdminLogin, PackageController.addCoinPackage);
router.get("/view/packages", AuthMiddleware.redirectAdminLogin, PackageController.adminAllPackages);
router.get("/view/coins", AuthMiddleware.redirectAdminLogin, PackageController.adminAllCoins);
router.post("/add/package", AuthMiddleware.redirectAdminLogin, PackageController.postAddPackage);
router.post("/add/coin", AuthMiddleware.redirectAdminLogin, PackageController.postAddCoin);
router.post("/update/package", AuthMiddleware.redirectAdminLogin, PackageController.postUpdatePackage);
router.post("/update/coin", AuthMiddleware.redirectAdminLogin, PackageController.postUpdateCoin);
router.post("/delete/package", AuthMiddleware.redirectAdminLogin, PackageController.deletePackage);
// router.post("/delete/coin", AuthMiddleware.redirectAdminLogin, PackageController.deletePackage);

// Wallets
router.get("/add/wallet", AuthMiddleware.redirectAdminLogin, PackageController.addWalletAddress);
router.post("/add/wallet", AuthMiddleware.redirectAdminLogin, PackageController.createWalletAddress);
router.get("/view/wallet", AuthMiddleware.redirectAdminLogin, PackageController.viewAllWallets);
router.get("/agent/wallet", AuthMiddleware.redirectAdminLogin, PackageController.viewAllTradersWallet);
router.get("/delete/wallet/:id", AuthMiddleware.redirectAdminLogin, PackageController.deleteWalletAddress);
router.get("/edit/wallet/:id", AuthMiddleware.redirectAdminLogin, PackageController.editWalletAddress);
router.post("/update/wallet", AuthMiddleware.redirectAdminLogin, PackageController.updateWalletAddress);
router.get("/free/wallet/:coinId", PackageController.getFreeWallet);
router.get("/approve-deposit/:id", AuthMiddleware.redirectAdminLogin, BankDepositController.approvedCoinDesposit);
// router.get("/coin/create", AuthMiddleware.redirectLogin, BankDepositController.populateCoinTable);
router.get("/coin/get",BankDepositController.getCoins);
router.get("/coin-list",BankDepositController.CoinList);

// managers
router.get("/gift-cards", AuthMiddleware.redirectAdminLogin, PackageController.addGiftCard);
router.post("/create/gift-cards", AuthMiddleware.redirectAdminLogin, uploader.single("image"), PackageController.createGiftCard);
router.post("/delete/gift-card", AuthMiddleware.redirectAdminLogin, PackageController.deleteGiftCard);
router.get("/add/manager", AuthMiddleware.redirectAdminLogin, ManagerController.addManager);
router.post("/add/manager", AuthMiddleware.redirectAdminLogin, ManagerController.postAddManagers);
router.get("/view/managers", AuthMiddleware.redirectAdminLogin, ManagerController.allAdmins);
router.post("/update/manager", AuthMiddleware.redirectAdminLogin, ManagerController.postUpdateManagers);
router.post("/delete/managers", AuthMiddleware.redirectAdminLogin, ManagerController.deleteManager);

router.get("/edit/package/:id", AuthMiddleware.redirectAdminLogin, PackageController.editPackage);
router.get("/edit/coin/:id", AuthMiddleware.redirectAdminLogin, PackageController.editCoin);
router.get("/delete/coin/:id", AuthMiddleware.redirectAdminLogin, PackageController.deleteCoin);
router.get("/edit/manager/:id", AuthMiddleware.redirectAdminLogin, ManagerController.editManager);

// Investment Route
router.get("/invest/:id", AuthMiddleware.redirectLogin, TransactionController.makeInvestment);
router.post("/invest-now", AuthMiddleware.redirectLogin, TransactionController.InvestNow);
router.get("/investments", AuthMiddleware.redirectLogin, InvestmentController.userInvestments);

router.get("/my-investment-history", AuthMiddleware.redirectLogin, InvestmentController.myInvestmentHistory);
router.get("/active-investment", AuthMiddleware.redirectAdminLogin, InvestmentController.activeInvestment);
router.get("/inactive-investment", AuthMiddleware.redirectAdminLogin, InvestmentController.inActiveInvestment);
router.get("/view-investment/:id", AuthMiddleware.redirectAdminLogin, InvestmentController.viewUserInvestment);
router.post("/cancel-investment", AuthMiddleware.redirectAdminLogin, InvestmentController.cancelInvestment);
router.post("/now", TransactionController.getDays);
router.get("/view-user-investment/:id", AuthMiddleware.redirectLogin, InvestmentController.viewMyInvestment);


// Post
router.get("/add/post", AuthMiddleware.redirectAdminLogin, PostsController.createPost);
router.get("/view/post", AuthMiddleware.redirectAdminLogin, PostsController.viewPost);
router.get("/view/post/:id", AuthMiddleware.redirectAdminLogin, PostsController.findPost);
router.post("/publish-post", AuthMiddleware.redirectAdminLogin, PostsController.publishPost);
router.post("/delete-post", AuthMiddleware.redirectAdminLogin, PostsController.deletePost);
router.post("/create-post", AuthMiddleware.redirectAdminLogin, uploader.single('image'), PostsController.createNewPost);

// Deposits Admin Routes
router.get("/deposits", AuthMiddleware.redirectAdminLogin, WalletController.depositsTransactions);
// router.post("/approved/deposits", AuthMiddleware.redirectAdminLogin, WalletController.walletFundingHistory);
// router.post("/unapproved/deposits", AuthMiddleware.redirectAdminLogin, WalletController.walletFundingHistory);

// Test Route
router.get("/get-kycs", KycController.unApprovedKyc);

router.get("/new-cust", CoinqvestController.createCustomer)
router.get("/bi-prices", BinanceController.getPrices)
router.get("/co-price", CoinBaseController.currentExchange)
router.get("/coin-user", CoinBaseController.getCurrentUser)
router.get("/coin-address", CoinBaseController.listAddresses)
router.get("/coin-acct", CoinBaseController.accountData)
router.post("/coin-wallet", CoinBaseController.createWallet)

module.exports = router;