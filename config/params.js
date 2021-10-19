require("dotenv").config()
module.exports = {
    // LOCAL_PORT: 3000,
    NODE_ENV: "development",
    SESSION_NAME: "epay2021",
    SESSION_SECRET: "bitmintDFFKFKFKFKsGHHolutions2020ddffgggkg",
    PAYSTACK_BASEURL: "https://api.paystack.co",
    PAYSTACK_SECRET: process.env.PAYSTACK_SECRET,
    //PAYSTACK_SECRET: "sk_live_cd2de91a6b91bb0d0735034e35cae3db42f0ee8f",
    CLIENT_ID_FB: "803481943564861",
    CLIENT_SECRET_FB: "1021bfb85276588bf79271cb2712f9cc",
    APP_NAME: process.env.APP_NAME,
    SITE_URL: process.env.SITE_URL,
    REF_LINK: process.env.REF_LINK,
    CLIENT_ID_GOOGLE: "666290590783-djcj0jd6q5g7e00ovciko1elct84qrij.apps.googleusercontent.com",
    CLIENT_SECRET_GOOGLE: "X-aoQVXrMZ-tA3EdRPsCwpBh",
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
    EMAIL_USERNAME: process.env.EMAIL_USERNAME,
    EMAIL_HOST: process.env.EMAIL_HOST,
    EMAIL_PORT: process.env.EMAIL_PORT,
    
};