const Sequelize = require('sequelize');

const db = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD,{
  host:'localhost',
  dialect:'mysql',

});

try {
  db.authenticate().then(()=>{
    console.log('database connected')
  }).catch((err)=>console.log(err))
} catch (error) {
  console.log(error);
  process.exit(1)
}

module.exports = db;