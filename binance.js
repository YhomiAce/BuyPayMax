const Binance = require('node-binance-api');
const binance = new Binance().options({
  APIKEY: '8mep8AqpubDapZILoWx5jnaD4OOTFGQnzSyLbRdGJxBZmrjcrHHAesTcplTS96D2',
  APISECRET: '1knEdritQjlau3l5FSJ8H4HtaNXqsFkbKCXPNvncnI8mgHzfLVFfWCFrDvcJgseu'
});

const getPrices = async ()=>{
    try {
        await binance.futuresPrices()
    } catch (error) {
        console.error(error);
    }
}
console.info( await binance.futuresAccount() );

console.info(getPrices());
