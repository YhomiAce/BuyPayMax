var Client = require('coinbase').Client;
const moment = require("moment")

var client = new Client({
  'apiKey': 'XGIcPDqpedaXCIyp',
  'apiSecret': 'MRiSq8hPK4k25TxmFgL145dlyuNyF4H7'
});

var address = null;

// client.getAccount('primary', function(err, account) {
//   account.createAddress(function(err, addr) {
//     console.log(addr);
//     address = addr;
//   });
// });

// client.getBuyPrice({'currencyPair': 'BTC-USD'}, function(err, obj) {
//     console.log('total amount: ' + obj.data.amount);
//   });

function ucfirst(str) {
  var firstLetter = str.slice(0,1);
  return firstLetter.toUpperCase() + str.substring(1);
}
console.log(ucfirst("hello"));