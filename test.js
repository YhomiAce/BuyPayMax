var Client = require('coinbase').Client;
const moment = require("moment")

var client = new Client({
  'apiKey': 'T82lTTwJALzMltJP',
  'apiSecret': 'Inrv0mD8ajnmbr6AUnYKbNsll9exnNQF',
  'version':''
});

var address = null;

client.getAccount('primary', function(err, account) {
  account.createAddress(function(err, addr) {
    console.log(addr);
    address = addr;
  });
});

// client.getBuyPrice({'currencyPair': 'BTC-USD'}, function(err, obj) {
//     console.log('total amount: ' + obj.data.amount);
//   });