const express = require('express');
const router = express.Router();

//get page model
const Page = require('../models/page');

//get pages index
router.get('/',function(req,res){
    res.send('admin area');
})

//get add page
router.get('/add-page',function(req,res){
    let title = "";
    let slug = "";
    let content = "";

    res.render('admin/add_page',{
        title : title,
        slug : slug,
        content : content
    });
});

//post add page
router.post('/add-page',function(req,res){

    req.checkBody('title','Title must have a value.').notEmpty();
    req.checkBody('content','Content must have a value.').notEmpty();

    let title = req.body.title;
    let slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if(slug == "") {
        slug = title.replace(/\s+/g, '-').toLowerCase();
    }
    let content = req.body.content;

    let errors = req.validationErrors();

    if(errors){
        res.render('admin/add_page',{
            errors : errors,
            title : title,
            slug : slug,
            content : content
        });
    }else{
        Page.findOne({slug : slug}, function(err,page){
            if(page){
                req.flash('danger','Page slug exists, choose another');
                res.render('admin/add-page',{
                    title : title,
                    slug : slug,
                    content : content
                });

            } else {
                let page = new Page({
                    title : title,
                    slug : slug,
                    content : content,
                    sorting : 0
                });
                page.save(function(err){
                    if(err) return console.log(err);
                    req.flash('success','Page added!');
                    res.redirect('/admin/pages');   
                });
            }
        })
    }
});

//Exports
module.exports = router;