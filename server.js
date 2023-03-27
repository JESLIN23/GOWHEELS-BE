const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('UNCOUGHT EXCEPTION! 💥 shutting down....');
  process.exit(1);
});

dotenv.config({ path: './config.env' });

const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
  })
  .then(() => console.log('DB connection successful'));

// mongoose.connection.on("error", err => {
//     console.log("err", err)
//   })
//   mongoose.connection.on("connected", (err, res) => {
//     console.log('DB connection successful')
//   })

const port = process.env.PORT || 6000;
const server = app.listen(port, () => {
  console.log(`listening ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNCOUGHT REJECTION! 💥 shutting down....');
  server.close(() => {
    process.exit(1);
  });
});
