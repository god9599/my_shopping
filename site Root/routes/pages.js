const express = require('express');
const router = express.Router();

router.get('/',function(req,res){
    res.render('index',{
        title : 'Home'
    });
});

router.get('/test',function(req,res){
    res.send('pages test');
});

//Exports
module.exports = router;