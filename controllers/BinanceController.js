const Binance = require('node-binance-api');
const axios = require('axios');
const crypto = require("crypto");

const baseUrl = 'https://api.binance.com'


exports.getWallet = async(req, res) =>{
    try {
        const result = await axios.get(`${baseUrl}/api/v3/trades`)
        return res.send({data: result.data})
    } catch (error) {
        console.error(error);
        return res.send({error})
    }
}


const binance = new Binance().options({
  APIKEY: 'wa2QzUiinoJYnsuH9m861GF1CbCiaCIa0RJD9Kb6Kd82fJUI36Yc3yVL0AthTN8d',
  APISECRET: '7eyGX6gOStY4edPnG6aJOLgtOVYtPfPY10EYkcOYjonckF5Y350nTAktWPfLbbJL'
});



exports.getPrices = async (req, res)=>{
    try {
        // const data = await binance.futuresPrices()
        // const data = await binance.futuresUserTrades( "BTCUSDT" )
        const data = await binance.futuresIncome()
        const add = await binance.futuresBalance()
        const binsd = await binance.depositAddress("BTC", (error, response) => {
            console.info(response);
        });
        await binance.depositHistory((error, response) => {
            console.info(response);
          });
        return res.send({binsd})
    } catch (error) {
        console.error(error);
        return res.send({error})
    }
}