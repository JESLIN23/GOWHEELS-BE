const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('UNCAUGHT EXCEPTION! 💥 shutting down....');
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
    useUnifiedTopology: true,
    autoIndex: true,
  })
  .then(() => {
    console.log('DB connection successful!');
  })
  .catch((err) => {
    console.error('Error connecting to the database:', err.message);
  });

const port = process.env.PORT || 6060;
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

// const startServer = async () => {
//   try {
//     await mongoose.connect(DB, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//       autoIndex: true,
//     });
//     console.log('DB connection successful!');

//     const port = process.env.PORT || 6060;
//     const server = app.listen(port, () => {
//       console.log(`Server listening on port ${port}`);
//     });

//     process.on('unhandledRejection', (err) => {
//       console.log(err.name, err.message);
//       console.log('UNHANDLED REJECTION! 💥 shutting down....');
//       server.close(() => {
//         process.exit(1);
//       });
//     });
//   } catch (err) {
//     console.error('Error connecting to the database:', err.message);
//     process.exit(1);
//   }
// };

// if (process.env.NODE_ENV === 'development') {
//   process.on('uncaughtException', (err) => {
//     console.log(err.name, err.message);
//     console.log('UNCAUGHT EXCEPTION! 💥 shutting down....');
//     process.exit(1);
//   });

//   startServer();
// } else {
//   const connectToDatabase = async () => {
//     try {
//       await mongoose.connect(DB, {
//         useNewUrlParser: true,
//         useUnifiedTopology: true,
//         autoIndex: true,
//       });
//       console.log('DB connection successful!');
//     } catch (err) {
//       console.error('Error connecting to the database:', err.message);
//       throw err;
//     }
//   };

//   exports.handler = async (event, context) => {
//     // Handle unhandled rejections within the Lambda function
//     process.on('unhandledRejection', (err) => {
//       console.log(err.name, err.message);
//       console.log('UNHANDLED REJECTION! 💥');
//     });

//     try {
//       await connectToDatabase();
//       return await app.handler(event, context);
//     } catch (error) {
//       console.error('UNCAUGHT EXCEPTION! 💥', error.name, error.message);
//       return {
//         statusCode: 500,
//         body: JSON.stringify({ message: 'Internal Server Errors' }),
//       };
//     }
//   };
// }
