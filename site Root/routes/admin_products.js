const express = require('express');
const router = express.Router();
const mkdir = require('mkdirp');
const fs = require('fs-extra');
const resizeImg = require('resize-img');

//get Product model
const Product = require('../models/product');

//get Category model
const Category = require('../models/category');

//get products index
router.get('/',function(req,res){
   let count;
   Product.count(function(err,c){
       count = c;
   }); 
   Product.find(function(err,products){
        res.render('admin/products',{
            products : products,
            count : count
       })
   })
});

//get add product
router.get('/add-product',function(req,res){
    let title = "";
    let desc = "";
    let price = "";
    Category.find(function(err,categories){
        res.render('admin/add_product',{
            title : title,
            desc : desc,
            categories : categories,
            price : price
        });
    });
    
});

//post add page
router.post('/add-product',function(req,res){

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
        res.render('admin/add_product',{
            errors : errors,
            title : title,
            slug : slug,
            content : content
        });
    }else{
        Page.findOne({slug : slug}, function(err,page){
            if(page){
                req.flash('danger','Product slug exists, choose another');
                res.render('admin/add-product',{
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
                    req.flash('success','Product added!');
                    res.redirect('/admin/products');   
                });
            }
        })
    }
});


//post reorder pages
router.post('/reorder-products',function(req,res){
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


//get edit page
router.get('/edit-product/:id',function(req,res){
    Page.findById(req.params.id,function(err, page){
        if(err) return console.log(err);

        res.render('admin/edit_product',{
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
router.post('/edit-product/:id',function(req,res){

    req.checkBody('title','Title must have a value.').notEmpty();
    req.checkBody('content','Content must have a value.').notEmpty();

    let title = req.body.title;
    let slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if(slug == "") {
        slug = title.replace(/\s+/g, '-').toLowerCase();
    }
    let content = req.body.content;
    let id = req.params.id;
    let errors = req.validationErrors();

    if(errors){
        res.render('admin/edit_product',{
            errors : errors,
            title : title,
            slug : slug,
            content : content,
            id : id
        });
    }else{
        Page.findOne({slug : slug, _id:{'$ne':id}}, function(err,page){
            if(page){
                req.flash('danger','Product slug exists, choose another');
                res.render('admin/edit-product',{
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
                        req.flash('success','Product added!');
                        res.redirect('/admin/products/edit-product/'+ id);   
                    });
                })
               
            }
        })
    }
});


//get delete page
router.get('/delete-product/:id',function(req,res){
    Page.findByIdAndRemove(req.params.id,function(err){
        if(err) return console.log(err);
        req.flash('success','Product deleted!');
        res.redirect('/admin/products/');
    })
})




//Exports
module.exports = router;