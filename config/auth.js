const parameters = require("./params");

module.exports = {
    header: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${parameters.PAYSTACK_SECRET}`
    },
    paylot: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${parameters.PAYLOT_SECRET}`
    },
}