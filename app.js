var createError = require('http-errors');
var express = require('express');
var session = require('express-session')
var FileStore = require('session-file-store')(session)
var fileupload = require('express-fileupload');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const passport = require('passport');
var config = require('./config');

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var productsRouter = require('./routes/products');
var cartRouter = require('./routes/cart');
var CheckoutRouter = require('./routes/checkout');
var LoginRouter = require('./routes/login');
var RegisterRouter = require('./routes/register');
var WebhooksRouter = require('./routes/webhooks.js');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: config.secretKey, 
  resave: false,
  saveUninitialized: false,
  store: new FileStore()
}))

app.use(fileupload({
  preserveExtension: true,
  safeFileNames: true
}))

app.use(passport.initialize());
app.use(passport.session());

const User = require('./models/user');
passport.use(User.createStrategy())
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/shop', productsRouter);
app.use('/cart', cartRouter);
app.use('/checkout', CheckoutRouter);
app.use('/webhooks', WebhooksRouter);
app.use('/login', LoginRouter);
app.use('/register', RegisterRouter);

var connect = mongoose.connect(config.mongoUrI, 
                                { useNewUrlParser: true,
                                  useUnifiedTopology: true,
                                  useFindAndModify: false
                                });

connect.then((db) => {
  console.log('Connected to database');
},(err) => {
  console.log(err);
})


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
