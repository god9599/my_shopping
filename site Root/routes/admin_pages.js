const express = require('express');
const router = express.Router();

//get page model
const Page = require('../models/page');


//get pages index
router.get('/',function(req,res){
    Page.find({}).sort({sorting:1}).exec(function(err,pages){
        res.render('admin/pages',{
            pages : pages
        })
    })
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
                    sorting : 100
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


//post reorder pages
router.post('/reorder-pages',function(req,res){
    let ids = req.body['id[]'];
    let count = 0;
    for(var i=0;i<ids.length;i++){
        var id = ids[i];
        count ++;
        (function(count){
            Page.findById(id, function(err, page){
                page.sorting = count;
                page.save(function(err){
                    if(err) return console.log(err);
                });
            });
    }) (count);
    }
});


//get add page
router.get('/edit-page/:slug',function(req,res){
    Page.findOne({slug:req.params.slug},function(err, page){
        if(err) return console.log(err);

        res.render('admin/edit_page',{
            title : page.title,
            slug : page.slug,
            content : page.content,
            id: page._id
        });
    }).catch((e)=>{
        res.status(400).send(e);
    })
    
});

//post edit page
router.post('/edit-page/:slug',function(req,res){

    req.checkBody('title','Title must have a value.').notEmpty();
    req.checkBody('content','Content must have a value.').notEmpty();

    let title = req.body.title;
    let slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if(slug == "") {
        slug = title.replace(/\s+/g, '-').toLowerCase();
    }
    let content = req.body.content;
    let id = req.body.id;
    let errors = req.validationErrors();

    if(errors){
        res.render('admin/edit_page',{
            errors : errors,
            title : title,
            slug : slug,
            content : content,
            id : id
        });
    }else{
        Page.findOne({slug : slug, _id:{'$ne':id}}, function(err,page){
            if(page){
                req.flash('danger','Page slug exists, choose another');
                res.render('admin/edit-page',{
                    title : title,
                    slug : slug,
                    content : content,
                    id : id
                });

            } else {
                Page.findById(id, function(err, page){
                    if(err) return console.log(err);
                    page.title = title;
                    page.slug = slug;
                    page.content = content;
                    page.save(function(err){
                        if(err) return console.log(err);
                        req.flash('success','Page added!');
                        res.redirect('/admin/pages/edit-page/'+page.slug);   
                    });
                })
               
            }
        })
    }
});


//get delete page
router.get('/delete-page/:id',function(req,res){
    Page.findByIdAndRemove(req.params.id,function(err){
        if(err) return console.log(err);
        req.flash('success','Page deleted!');
        res.redirect('/admin/pages/');
    })
})




//Exports
module.exports = router;