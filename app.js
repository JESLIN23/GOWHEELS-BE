const express = require('express');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const helmet = require('helmet');
const morgan = require('morgan');
const hpp = require('hpp');
const cors = require('cors');
const path = require('path');

const orderController = require('./controllers/orderController');
const router = require('./routes');
const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');

const app = express();

const corsOptions = {
  origin: [
    'https://admin-gowheel.firebaseapp.com',
    'https://gowheels-rental.firebaseapp.com',
    'http://localhost:3000',
    'http://localhost:3001',
  ],
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors());
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
  })
);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP. Please try again in an hour!',
});
app.use('/api', limiter);

app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  orderController.webhookCheckout
);

app.use(express.json({ limit: '2048kb' }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xss());
app.use(
  hpp({
    whitelist: [
      'firstName',
      'secondName',
      'phone',
      'date_of_birth',
      'email',
      'price',
    ],
  })
);

// app.use('/uploads/images/car', express.static('uploads/images/car'))
// app.use(express.static(path.join(__dirname, 'uploads')));
app.use(
  '/uploads/images/car',
  express.static(path.join(__dirname, 'uploads/images/car'))
);
app.use(
  '/uploads/images/avatar',
  express.static(path.join(__dirname, 'uploads/images/avatar'))
);
app.use(
  '/uploads/images/licence',
  express.static(path.join(__dirname, 'uploads/images/licence'))
);
app.use(
  '/uploads/files',
  express.static(path.join(__dirname, 'uploads/files'))
);

app.use('/api/v1', router);

app.get('/', (req, res) => {
  res.send('Welcome to gowheels');
});

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} from this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
