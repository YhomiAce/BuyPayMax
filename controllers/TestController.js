var Client = require('coinbase').Client;

var client = new Client({
  'apiKey': 'API KEY',
  'apiSecret': 'API SECRET',
  'version':'YYYY-MM-DD'
});

var address = null;

client.getAccount('primary', function(err, account) {
  account.createAddress(function(err, addr) {
    console.log(addr);
    address = addr;
  });
});