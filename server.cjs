const app = require('./app.cjs')
const sequelize = require('./config/db.config.cjs')
const dotenv = require('dotenv')
dotenv.config()

let port = process.env.PORT || 3000;

(async ()=>{

    try {
        await sequelize.sync({force:false})
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
    
})()

app.listen(port, ()=>{
    console.log(`server is up on ${port}`);
})

