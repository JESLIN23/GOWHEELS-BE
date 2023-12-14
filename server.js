const mongoose = require('mongoose');
const dotenv = require('dotenv');

if (process.env.NODE_ENV === 'development') {
  process.on('uncaughtException', (err) => {
    console.log(err.name, err, err.message);
    console.log('UNCOUGHT EXCEPTION! 💥 shutting down....');
    process.exit(1);
  });
}


dotenv.config({ path: './config.env' });

const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);


if (process.env.NODE_ENV === 'development') {
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

} else {

  const connectToDatabase = async () => {
    try {
      await mongoose.connect(DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        autoIndex: true,
      });
      console.log('DB connection successful!');
    } catch (err) {
      console.error('Error connecting to the database:', err.message);
      throw err;
    }
  };

  exports.handler = async (event, context) => {
    // Handle unhandled rejections within the Lambda function
    process.on('unhandledRejection', (err) => {
      console.log(err.name, err.message);
      console.log('UNHANDLED REJECTION! 💥');
    });

    try {
      await connectToDatabase();
      return await app.handler(event, context);
    } catch (error) {
      console.error('UNCAUGHT EXCEPTION! 💥', error.name, error.message);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Internal Server Error' }),
      };
    }
  };
}
