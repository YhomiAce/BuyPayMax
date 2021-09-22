const moment = require("moment");
// package imports
const Sequelize = require("sequelize");

// local imports
const parameters = require("../config/params");
const Users = require("../models").User;
const Chats = require("../models").Chat;
// imports initialization
const Op = Sequelize.Op;

const numFormatter = (num) => {
    if(num > 999 && num < 1000000){
        return (num/1000).toFixed(1) + 'K'; // convert to K for number from > 1000 < 1 million 
    }else if(num >= 1000000){
        return (num/1000000).toFixed(1) + 'M'; // convert to M for number from > 1 million 
    }else if(num < 900){
        return num; // if value < 1000, nothing to do
    }
}

const  stripHtml = (str)=> {
    if ((str===null) || (str===''))
        return false;
    else
        str = str.toString();
          
    // Regular expression to identify HTML tags in 
    // the input string. Replacing the identified 
    // HTML tag with a null string.
    return str.replace( /(<([^>]+)>)/ig, '');
}

function addChatAndFormatMessage(id, userId, message) {
    let data;
    return new Promise((resolve, reject) => {
        Users.findAll({
            where:{
                deletedAt: {
                    [Op.eq]: null
                }
            },
        })
        .then(async users => {
            console.log(users)
            if (users) {
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
    addChatAndFormatMessage2,
    numFormatter,
    stripHtml
}