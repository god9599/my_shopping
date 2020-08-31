const express = require('express');
const router = express.Router();

router.get('/',function(req,res){
    res.send('admin area');
});

router.get('/test',function(req,res){
    res.send('admin test');
})

//Exports
module.exports = router;