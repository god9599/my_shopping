const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const config = require('./config/database');
const expressValidator = require('express-validator');
const bodyParser = require('body-parser');
const expressMessages = require('express-messages');
const connectFlash = require('connect-flash');
const session = require('express-session');
const fileUpload = require('express-fileupload');

//Connect to db
mongoose.connect(config.database);
const db = mongoose.connection;
db.on('error',console.error.bind(console,'connection error:'));
db.once('open',function(){
    console.log('Connected to MongoDB');
})

//Init app
const app = express();

//View engine setup
app.set('views',path.join(__dirname,'views'));

app.set('view engine','ejs');

//Set public folder
app.use(express.static(path.join(__dirname,'public')));

//Express fileupload middleware
app.use(fileUpload());

// Body Parser middleware
// 
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));
// parse application/json
app.use(bodyParser.json());
app.use(expressValidator());

//set global errors variable
app.locals.errors = null;

// Express Session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
//  cookie: { secure: true }
}));



// Express Messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

//Set routes
const pagesRouter = require('./routes/pages');
const adminPagesRouter = require('./routes/admin_pages');
const adminCategoryRouter = require('./routes/admin_categories');
const adminProductRouter = require('./routes/admin_products');

app.get('/',function(req,res){
    res.render('index',{
        title:"Home"
    });
});

app.use('/',pagesRouter);
app.use('/admin/pages',adminPagesRouter);
app.use('/admin/categories',adminCategoryRouter);
app.use('/admin/products',adminProductRouter);

//Start the server
const port = 3000;
app.listen(port,function(){
    console.log('Server started on port ' + port);
})
