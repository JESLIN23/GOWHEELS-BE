const express = require('express');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const helmet = require('helmet');
const mongan = require('morgan');
const hpp = require('hpp');

const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');
const userRouter = require('./routes/userRouter');
const carRouter = require('./routes/carRouter');

const app = express();

app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(mongan('dev'));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP. Please try again in an hour!',
});
app.use('/api', limiter);

app.use(express.json({ limit: '1024kb' }));
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

app.use('/api/v1/users', userRouter);
app.use('/api/v1/car', carRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} from this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
