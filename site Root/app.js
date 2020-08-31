const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const config = require('./config/database');

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

//Set routes
const pagesRouter = require('./routes/pages');
const adminPagesRouter = require('./routes/admin_pages');

app.use('/',pagesRouter);
app.use('/admin/pages',adminPagesRouter);


//Start the server
const port = 3000;
app.listen(port,function(){
    console.log('Server started on port ' + port);
})