const axios = require('axios');
const {Service} = require("../helpers/paystack")

exports.TestCaptch = (req, res) =>{
  res.render("test/captcha")
}

exports.verifyCaptcha = async(req, res) =>{
  try {
    const captcha = req.body['g-recaptcha-response']
    console.log(req.body['g-recaptcha-response']);
    const resp = await Service.GoogleCaptcha.verifyCaptcha(captcha, req.socket.remoteAddress);
    console.log(resp);
    return res.send("succes")
  } catch (error) {
    return res.send("Error")
  }
}