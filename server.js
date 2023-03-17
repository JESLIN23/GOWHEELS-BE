const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config({path: './config.env'})
const app = require('./app')

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)

mongoose.connect(DB, {
    useNewUrlParser: true
}).then(() => console.log('DB connection successful'))

// mongoose.connection.on("error", err => {
//     console.log("err", err)
//   })
//   mongoose.connection.on("connected", (err, res) => {
//     console.log('DB connection successful')
//   })


const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
    console.log(`listening ${port}`);
})