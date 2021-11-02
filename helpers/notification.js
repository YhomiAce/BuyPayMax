const Sequelize = require("sequelize");

// local imports
const Users = require("../models").User;
const Notification = require("../models").Notification;

exports.createNotification = async ({userId, type, message}) =>{
    try {
        const request = {
            userId,
            type,
            message
        };
        await Notification.create(request);
        console.log("Notification sent");
        return true
    } catch (error) {
       return res.send({message: "Error: "+error}) 
    }
}

exports.fetchUserNotification = async ({userId, type}) =>{
    try {
        const notifications = await Notification.findAll({where:{userId, type, status: false}});
        return notifications;
    } catch (error) {
       return res.send({message: "Error: "+error}) 
    }
}

exports.fetchAdminNotification = async ({ type}) =>{
    try {
        const notifications = await Notification.findAll({where:{type, status: false}});
        return notifications;
    } catch (error) {
       return res.send({message: "Error: "+error}) 
    }
}

exports.updateNotification = async (id) =>{
    try {
        await Notification.update({status: true}, {where:{id}})
        return true;
    } catch (error) {
       return res.send({message: "Error: "+error}) 
    }
}

exports.deleteNotifications = async (id) =>{
    try {
        await Notification.destroy({where:{id}})
        return true;
    } catch (error) {
       return res.send({message: "Error: "+error}) 
    }
}