// package imports
require('dotenv').config()
const Sequelize = require("sequelize");
const moment = require("moment");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const express = require("express");
const bodyParser = require("body-parser");
const cron = require("node-cron");
const morgan = require('morgan')

// local imports
const Users = require("./models").User;
const Investments = require("./models").Investment;
const Rate = require("./models").Rate;
const Product = require("./models").Product;
const History = require('./models').History;
const parameters = require("./config/params");
const auth = require("./config/auth");
const webParameters = require("./config/web_params.json");
const socketHelpers = require("./helpers/socket_helpers");
const {Service} = require("./helpers/paystack");
const db = require('./config/db');

// imports initialization
const Op = Sequelize.Op;

// routes includes
const webRoute = require("./routes/web");
const apiRoute = require("./routes/api");
const { image } = require('./helpers/cloudinary');

// imports initalization
const app = express();
const server = http.createServer(app);
const io = socketio(server);
let users = []; 
// const db = new Sequelize('dephifoodsnetwor_bitmint_db', 'dephifoodsnetwor_bitmint_user', 'dejideji123!',{
//     host:'localhost',
//     dialect:'mysql',

// });

// db.authenticate().then(()=>{
//     console.log('database connected')
// }).catch((err)=>console.log(err))

app.locals = webParameters;

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));


app.use(morgan('dev'))
// set up public folder
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname + 'uploads')));
// Static Files
// dashboard 
app.use('/css', express.static(__dirname + 'public/css'));
app.use('/js', express.static(__dirname + 'public/js'));
app.use('/images', express.static(__dirname + 'public/images'));


// routes

app.use("/", webRoute);
app.use("/api", apiRoute);

// 404 not found
app.use(function (req, res) {
    res.status(404).render('base/404');
});

// how the socket will work
// send the users id and message to server, server processes it, then return the users name
// after add the users message and id to the chat model
// that is chat has id, sender, receiver, message, read_status


// sockets connections runs when users connect to socket
io.on("connection", socket => {


    // socket.emit() for only the connected user
    // socket.broadcast.emit() for every other user except the connected user
    // io.emit(broadcasts to every body);
    console.log(`A user is connected to the socket with socket id of ${socket.id}`);
    socket.emit("message", socketHelpers.formatMessage("admin", "Welcome to bitmint option"));

    // once a user is connected, save their id,
    socket.on("joined", (id) => {
        console.log(`the user id is ${id}`);
        users[id] = socket.id;
        console.log(users);
    });
   
    // broadcasts when a user connects
    //socket.broadcast.emit("message", socketHelpers.formatMessage("admin", "A user is active"));

    // runs when users disconnects from socket
    socket.on('disconnect', () => {
        console.log(`A user has disconnected from the socket with id of ${socket.id}`);
        //io.emit("message", socketHelpers.formatMessage("admin", "User has left the site"));
    });

    socket.on("chatMessage", (content) => {

        console.log("chat message");
        console.log(content);
        //io.emit("message", socketHelpers.formatMessage("user", content));
        //io.emit("message", socketHelpers.addChatAndFormatMessage(content.id, content.userId, content.msg));
        socketHelpers.addChatAndFormatMessage(content.receiverId, content.senderId, content.msg).then(data => {
            //console.log(`the return value is ${data}`);
            let senderSocketId = users[content.senderId];
            let receiverSocketId = users[content.receiverId];

            // send back the messages to myself
            io.to(senderSocketId).emit("my_message", data);


            //broadcast to everyone
            io.sockets.emit('broadcast',{ description: 'Bitcoin prices have gone up'});

            // send the message to the receiver
            console.log(`i am sending from ${senderSocketId} to ${receiverSocketId}`);
            io.to(receiverSocketId).emit("incoming_message", data);
        });
    });
});

// scheduler task and all
cron.schedule("* 6 * * *", () => {
   
    // if(shell.exec("node cronjob.js").code !== 0) {
    //     console.log("something went wrong");
    Investments.findAll({
            where: {
                [Op.and]: [
                    {
                        expiredAt: {
                            [Op.gte]: moment().format('YYYY-MM-DD HH:mm:ss')
                        }
                    },
                    {
                        status: "active"
                    }
                ]
            }
        })
        .then(inactiveInvestments => {
            console.log(inactiveInvestments);
            const records = inactiveInvestments.map(function (expiredInvestment) {
                Users.findOne({
                        where: {
                            id: {
                                [Op.eq]: expiredInvestment.user_id
                            }
                        }
                    })
                    .then(user => {
                        let userRevenue = Math.abs(Number(user.revenue));
                        console.log(userRevenue);
                        let interest = Math.abs(Number(expiredInvestment.earning));
                        let current = Math.abs(Number(expiredInvestment.weeklyEarning));
                        let balance = current + interest
                        let currentRevenue = userRevenue + interest;
                        Users.update({
                                revenue: currentRevenue
                            }, {
                                where: {
                                    id: {
                                        [Op.eq]: expiredInvestment.user_id
                                    }
                                }
                            })
                            .then(updatedWallet => {
                                let type = 'Weekly Earnings'
                                let desc = 'Weekly earning added'
                                let value = interest
                                History.create({
                                    type,
                                    desc,
                                    value,
                                    user_id: expiredInvestment.user_id
                                }).then(hist =>{
                                    Investments.update({weeklyEarning: balance}, {where:{id:expiredInvestment.id}})
                                    .then(result =>{
                                        console.log('Investment Updated');
                                    })
                                })
                               
                            })
                            .catch(error => {
                                return null;
                            });
                    })
                    .catch(error => {
                        return null;
                    });
            });
        })
        .catch(error => {
            return null;
        });
    // }
});

cron.schedule("*/10 * * * *", async() => {
   const products = await Product.findAll();
   const rate = await Rate.findOne({where:{name: "Dollar"}})
    await Promise.all(products.map(async product =>{
        console.log(product.name.toLowerCase(), rate.naira);
        const data = await Service.Coingecko.getCoinDetails(product.name.toLowerCase());
        const {image, current_price} = data[0];
        const nairaRate = Number(rate.naira) * Number(current_price)

        await Product.update({rate: nairaRate, dollarRate:current_price, image}, {where:{id:product.id}})
        console.log("Rates updated");
        
    }))
    
});

// server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`server started on port ${PORT}`);
});