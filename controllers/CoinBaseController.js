const axios = require('axios');
const crypto = require("crypto");


const key = {
  APIKEY: 'pEq4hin3Qb5RT0kG',
  APISECRET: 'cBBS04jAWXvLkI2GHQxec7MTxt51h93w'
}


const generateHashKey = (reqParam, secret) =>{
  var timestamp = Math.floor(Date.now() / 1000);

  // set the parameter for the request message
  
  var message = timestamp + reqParam.method + reqParam.path + reqParam.body;
  // console.log(message);

  //create a hexedecimal encoded SHA256 signature of the message
  var signature = crypto.createHmac("sha256", secret).update(message).digest("hex");
  // console.log(signature);
  return {timestamp, signature}
}

exports.currentExchange = async(req,res) =>{
  try {
    const {starting_after} = req.query
    console.log(starting_after);

    var encHash = {
      baseUrl: 'https://api.coinbase.com',
      method: 'GET',
      path: '/v2/accounts?starting_after='+starting_after,
      body: ''
    };
      const sign = generateHashKey(encHash, key.APISECRET);
      console.log(sign);
      const config = {
        headers: {
          'CB-ACCESS-SIGN': sign.signature,
          'CB-ACCESS-TIMESTAMP': sign.timestamp,
          'CB-ACCESS-KEY': key.APIKEY,
        }
      }
      // const url = `${reqParam.baseUrl}/v2/exchange-rates?currency=NGN`
      var options = await axios.get(`${encHash.baseUrl}/${encHash.path}`, config); 
      return res.send({data: options.data})
  } catch (error) {
      console.error(error);
      return res.send({error})
  }
}

exports.getCurrentUser = async(req,res) =>{
  try {
    var encHash = {
      baseUrl: 'https://api.coinbase.com',
      method: 'GET',
      path: '/v2/user',
      body: ''
    };
      const sign = generateHashKey(encHash, key.APISECRET);
      console.log(sign);
      const config = {
        headers: {
          'CB-ACCESS-SIGN': sign.signature,
          'CB-ACCESS-TIMESTAMP': sign.timestamp,
          'CB-ACCESS-KEY': key.APIKEY,
        }
      }
      // const url = `${reqParam.baseUrl}/v2/exchange-rates?currency=NGN`
      var options = await axios.get(`${encHash.baseUrl}/${encHash.path}`, config); 
      return res.send({data: options.data})
  } catch (error) {
      console.error(error);
      return res.send({error})
  }
}

exports.listAddresses = async(req,res) =>{
  try {
    var encHash = {
      baseUrl: 'https://api.coinbase.com',
      method: 'GET',
      path: '/v2/accounts/2de2684a-064f-5190-a44d-47a3005fa683/addresses',
      body: '',
      scopes: "wallet:addresses:read"
    };
      const sign = generateHashKey(encHash, key.APISECRET);
      console.log(sign);
      const config = {
        headers: {
          'CB-ACCESS-SIGN': sign.signature,
          'CB-ACCESS-TIMESTAMP': sign.timestamp,
          'CB-ACCESS-KEY': key.APIKEY,
        }
      }
      // const url = `${reqParam.baseUrl}/v2/exchange-rates?currency=NGN`
      var options = await axios.get(`${encHash.baseUrl}/${encHash.path}`, config); 
      return res.send({data: options.data})
  } catch (error) {
      console.error(error);
      return res.send({error})
  }
}


exports.accountData = async(req,res) =>{
  try {
    var encHash = {
      baseUrl: 'https://api.coinbase.com',
      method: 'GET',
      path: '/v2/accounts/2de2684a-064f-5190-a44d-47a3005fa683',
      body: ''
    };
      const sign = generateHashKey(encHash, key.APISECRET);
      console.log(sign);
      const config = {
        headers: {
          'CB-ACCESS-SIGN': sign.signature,
          'CB-ACCESS-TIMESTAMP': sign.timestamp,
          'CB-ACCESS-KEY': key.APIKEY,
        }
      }
      // const url = `${reqParam.baseUrl}/v2/exchange-rates?currency=NGN`
      var options = await axios.get(`${encHash.baseUrl}/${encHash.path}`, config); 
      return res.send({data: options.data})
  } catch (error) {
      console.error(error);
      return res.send({error})
  }
}

exports.createWallet = async(req,res) =>{
  try {
    const name = "Test ETH Address"
    var encHash = {
      baseUrl: 'https://api.coinbase.com',
      method: 'POST',
      path: '/v2/accounts/2de2684a-064f-5190-a44d-47a3005fa683/addresses',
      body: '',
      scopes: "wallet:addresses:create"
    };
      const sign = generateHashKey(encHash, key.APISECRET);
      console.log(sign);
      const config = {
        headers: {
          'CB-ACCESS-SIGN': sign.signature,
          'CB-ACCESS-TIMESTAMP': sign.timestamp,
          'CB-ACCESS-KEY': key.APIKEY,
          'CB-VERSION': '2020-07-20'
        }
      }
      const body = {
        name: name
      }
      const url = `${encHash.baseUrl}/${encHash.path}`
      console.log(url);
      var options = await axios.post(url, config); 
      return res.send({data: options.data})
  } catch (error) {
      // console.error(error);
      return res.send({error})
  }
}

exports.getAccount = async (req, res) =>{
  try {
    
      var address = null;

      client.getAccount('primary', function(err, account) {
        account.createAddress(function(err, addr) {
          console.log(addr);
          address = addr;
        });
      });
  } catch (error) {
    
  }
}