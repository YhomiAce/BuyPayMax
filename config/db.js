const Sequelize = require('sequelize');

const db = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD,{
  host:'localhost',
  dialect:'mysql',

});

db.authenticate().then(()=>{
  console.log('database connected')
}).catch((err)=>console.log(err))

module.exports = db;