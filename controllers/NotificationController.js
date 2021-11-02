// package imports
const Sequelize = require("sequelize");

// local imports
const parameters = require("../config/params");

const notification = require("../helpers/notification");
// imports initialization
const Op = Sequelize.Op;

exports.deleteNotification = async(req, res) =>{
    try {
        const {id} = req.body
        await notification.updateNotification(id);
        res.redirect("back");
    } catch (error) {
        req.flash("error", "Server Error");
        res.redirect("back");
    }
}