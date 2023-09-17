const express = require('express');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const helmet = require('helmet');
const morgan = require('morgan');
const hpp = require('hpp');
const cors = require('cors');
const path = require('path')

const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');
const userRouter = require('./routes/userRouter');
const carRouter = require('./routes/carRouter');
const authRouter = require('./routes/authRouter');
const orderRouter = require('./routes/orderRouter')

const app = express();

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false
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
app.use('/uploads/images/car', express.static(path.join(__dirname, 'uploads/images/car')));
app.use('/uploads/images/avatar', express.static(path.join(__dirname, 'uploads/images/avatar')));
app.use('/uploads/images/licence', express.static(path.join(__dirname, 'uploads/images/licence')));
app.use('/uploads/files', express.static(path.join(__dirname, 'uploads/files')));

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/car', carRouter);
app.use('/api/v1/order', orderRouter)

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} from this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
