const express = require('express');
const router = express.Router();

//get Category model
const Category = require('../models/category');


//get Category index
router.get('/',function(req,res){ 
    Category.find(function(err,categories){
        if(err) res.json(err);
        res.render('admin/categories',{
            categories : categories
        })
    })
})

//get add category
router.get('/add-category',function(req,res){
    let title = "";

    res.render('admin/add_category',{
        title : title
    });
});

//post add category
router.post('/add-category',function(req,res){

    req.checkBody('title','Title must have a value.').notEmpty();   

    let title = req.body.title;
    let slug = title.replace(/\s+/g, '-').toLowerCase();

    let errors = req.validationErrors();

    if(errors){
        res.render('admin/add_category',{
            errors : errors,
            title : title
        });
    }else{
        Category.findOne({slug : slug}, function(err,category){
            if(category){
                req.flash('danger','Category title exists, choose another');
                res.render('admin/add-category',{
                    title : title
                });

            } else {
                let category = new Category({
                    title : title,
                    slug : slug
                });
                category.save(function(err){
                    if(err) return console.log(err);
                    req.flash('success','Category added!');
                    res.redirect('/admin/categories');   
                });
            }
        })
    }
});




//Exports
module.exports = router;