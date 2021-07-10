const moment = require("moment");
// package imports
const Sequelize = require("sequelize");

// local imports
const parameters = require("../config/params");
const Users = require("../models").User;
const Chats = require("../models").Chat;
// imports initialization
const Op = Sequelize.Op;

function addChatAndFormatMessage(id, userId, message) {
    let data;
    return new Promise((resolve, reject) => {
        Users.findOne({
            where: {
                id: {
                    [Op.eq]: userId
                }
            }
        })
        .then(async user => {
            if (user) {
                // get the id of the admin
                // add to chat table with the following tables
                Chats.create({
                        sender_id: userId,
                        receiver_id: id,
                        message: message,
                        read_status: 0
                    })
                    .then(async chat => {
                        // return chats that belongs to the user
                        Chats.findAll({
                                where: {
                                    [Op.or]: [
                                        {
                                            sender_id: {
                                                [Op.eq]: userId
                                            }
                                        },
                                        {
                                            receiver_id: {
                                                [Op.eq]: userId
                                            }
                                        }
                                    ],                                    
                                }
                            })
                            .then(chats => {
                                if (chats) {
                                    data = {
                                        username: user.name,
                                        text: message,
                                        senderId: userId,
                                        receiverId: id,
                                        time: moment().format("YYYY-MM-DD HH:mm:ss"),
                                    }
                                } else {
                                    console.log("no users found");
                                }
                                //return data;
                                resolve(data);
                            })
                            .catch(error => {
                                console.log('dont return anything, because users chat were not received');
                            });
                    })
                    .catch(error => {
                        console.log('dont return anything, because chat was not added');
                    });

            } else {
                console.log('dont return anything, because the sender id is invalid');
            }
        })
        .catch(error => {
            console.log('dont return anything, because the sender details was not fetched');
        });
    });
}


function formatMessage(username, text) {
    return {
        username,
        text,
        time: moment().format("YYYY-MM-DD h:mm a")
    }
}

function addChatAndFormatMessage2(id, userId, message) {
    return {
        username: message,
        text: userId,
        id: id,
        time: moment().format("YYYY-MM-DD h:mm a")
    }
}


module.exports = {
    formatMessage,
    addChatAndFormatMessage,
    addChatAndFormatMessage2
}