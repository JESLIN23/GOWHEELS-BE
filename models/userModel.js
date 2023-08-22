const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please tell us your first name!'],
    trim: true,
    minLength: [3, 'First name should contain atleast 3 charactor'],
    maxLength: [30, 'First name should have lessthan 30 charactor'],
  },
  secondName: {
    type: String,
    required: [true, 'Please tell us your second name!'],
    trim: true,
    minLength: [1, 'Second name should contain atleast 1 charactor'],
    maxLength: [30, 'Second name should have lessthan 30 charactor'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    trim: true,
    unique: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
    lowercase: true,
  },
  phone: {
    type: Number,
    required: [true, 'Please provide your phone number'],
    unique: true,
    validate: {
      validator: function (val) {
        return String(val).length === 10;
      },
      message: 'Phone number is not valid',
    },
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minLength: [8, 'Password should contain atleast 8 charactor'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: 'Passwords are not same',
    },
  },
  driving_licence: {
    frond: String,
    back: String,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  active: {
    type: Boolean,
    default: true,
  },
  avatar:String,
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  isEmailVerifiedAt: Date,
  lastPasswordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
},{
  toJSON: { virtuals: true},
  toObject: { virtuals: true}
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.lastPasswordChangedAt = Date.now() - 1000;
  next();
});

// userSchema.post(/^find/, function(next) {
//   this.find({active: { $ne: false}})

//   next()
// })

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.lastPasswordChangedAt) {
    const changedTimestamp = parseInt(
      this.lastPasswordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpire = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model('User', userSchema);


module.exports = User;

