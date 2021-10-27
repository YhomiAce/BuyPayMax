require("dotenv").config();
const axios = require('axios');
const parameters = require("../config/params");
const auth = require("../config/auth");

const Service = {
    
    Paystack: {
      url: parameters.PAYSTACK_BASEURL,
      async createTransferReceipt(accountName, accountNumber, bankCode) {
            try {
                const createUserUrl = `${this.url}/transferrecipient`;
                const result = await axios({
                    method: 'post',
                    url: createUserUrl,
                    data: {
                        "type": "nuban",
                        "name": accountName,
                        "account_number": accountNumber,
                        "bank_code": bankCode,
                        "currency": "NGN"
                    },
                    headers: auth.header,
                });
                // console.log(result.data);
                const resp = result.data;
                return resp;
            } catch (error) {
                console.log(error);
            }
        },

      async finalizeTransfer(transfer_code, token) {
            try {
                const createUserUrl = `${this.url}/transfer/finalize_transfer`;
                const result = await axios({
                    method: 'post',
                    url: createUserUrl,
                    data: {
                        "transfer_code": transfer_code,
                        "otp": token
                    },
                    headers: auth.header,
                });
                // console.log(result.data);
                const resp = result.data;
                return resp;
            } catch (error) {
                console.log(error);
            }
        },

      async verifyPayment(reference) {
            try {
                const createUserUrl = `${this.url}/transaction/verify/${reference}`;
                const result = await axios({
                    method: 'get',
                    url: createUserUrl,
                    headers: auth.header,
                });
                // console.log(result.data);
                const resp = result.data;
                return resp;
            } catch (error) {
                console.log(error);
                const err = error.response.data
                return err;
            }
        },
      
    },

    Coingecko: {
        // url: "https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=true&market_data=true&developer_data=true&sparkline=false",
        async getCoinDetails(name) {
              try {
                  const createUserUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${name}&order=market_cap_desc&per_page=100&page=1&sparkline=false`;
                  const result = await axios({
                      method: 'get',
                      url: createUserUrl
                  });
                //   console.log(result.data);
                  const resp = result.data;
                  return resp;
              } catch (error) {
                  console.log(error);
              }
        },
    },
    Paylot: {
        url: "https://api.paylot.co/transactions",
        async initializePayment(payload) {
            try {
                const createUserUrl = `${this.url}/initialize`;
                const result = await axios({
                    method: 'post',
                    url: createUserUrl,
                    data: payload
                });
                // console.log(result.data);
                const resp = result.data;
                return resp;
            } catch (error) {
                console.log(error);
                const err = error.response.data
                return err;
            }
        },
        async verifyPayment(reference) {
            try {
                const createUserUrl = `${this.url}/verify/${reference}`;
                const result = await axios({
                    method: 'get',
                    url: createUserUrl,
                    headers: auth.paylot,
                });
                // console.log(result.data);
                const resp = result.data;
                return resp;
            } catch (error) {
                console.log(error);
                const err = error.response.data
                return err;
            }
        },
    },

    GoogleCaptcha: {
        
        async verifyCaptcha(captcha, conn) {
            try {
                console.log(process.env.GOOGLE_CAPTCHA_SECRET);
                const createUserUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.GOOGLE_CAPTCHA_SECRET}&response=${captcha}&remoteip=${conn}`;
                const result = await axios({
                    method: 'post',
                    url: createUserUrl
                });
                // console.log(result.data);
                const resp = result.data;
                return resp;
            } catch (error) {
                console.log(error);
                const err = error.response.data
                return err;
            }
        },
        
    },
    
  };

  module.exports = { Service };