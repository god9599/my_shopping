const express = require('express');
const router = express.Router();
const fs = require('fs-extra');
const resizeImg = require('resize-img');
const mkdirp = require('mkdirp-promise');

//get Product model
const Product = require('../models/product');

//get Category model
const Category = require('../models/category');


//get products index
router.get('/',function(req,res){
   let count;
   Product.countDocuments(function(err,c){
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

//post add product
router.post('/add-product',function(req,res){

    let imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";


    req.checkBody('title','Title must have a value.').notEmpty();
    req.checkBody('desc','Description must have a value.').notEmpty();
    req.checkBody('price','Price must have a value.').isDecimal();
    req.checkBody('image', 'You must upload an image').isImage(imageFile);

    let title = req.body.title;
    let slug = title.replace(/\s+/g, '-').toLowerCase();
    let desc = req.body.desc;
    let price = req.body.price;
    let category = req.body.category;

    let errors = req.validationErrors();

    if(errors){
        Category.find(function(err,categories){
            res.render('admin/add_product',{
                errors : errors,
                title : title,
                desc : desc,
                categories : categories,
                price : price
            });
    });

    }else{
        Product.findOne({slug : slug}, function(err,product){
            if(product){
                req.flash('danger','Product title exists, choose another');
                Category.find(function(err,categories){
                    res.render('admin/add_product',{
                        title : title,
                        desc : desc,
                        categories : categories,
                        price : price
                    });
                });
            } else {
                let price2 = parseFloat(price).toFixed(2);

                let product = new Product({
                    title : title,
                    slug : slug,
                    desc : desc,
                    price : price2,
                    category : category,
                    image : imageFile
                });
                product.save(function(err){
                    if(err) return console.log(err);
                        
                    mkdirp('public/product_images/'+product._id)
                        .then(()=>{
                            mkdirp('public/product_images/' + product._id +'/gallery')
                            .then(()=>{
                                mkdirp('public/product_images/'+product._id+'/gallery/thumbs')
                                .then(()=>{
                                    if(imageFile != ""){
                                        let productImage = req.files.image;
                                        let path = 'public/product_images/' + product._id + '/' + imageFile;
                
                                        productImage.mv(path, function(err){
                                            return console.log(err);
                                        })
                                    }
                                    req.flash('success','Product added!');
                                    res.redirect('/admin/products'); 
                                })
                            })
                        })   
                })
            }
        })
    }
});


//get edit product
router.get('/edit-product/:id',function(req,res){

    let errors;
    if(req.session.errors) 
        errors = req.session.errors;
    req.session.errors = null;

    Category.find(function(err,categories){

        Product.findById(req.params.id, function(err,p){
            if(err){
                console.log(err);
                res.redirect('/admin/products');
            }else{
                let galleryDir = 'public/product_images/' + p._id + '/gallery';
                let galleryImages = null;

                fs.readdir(galleryDir, function(err,files){
                    if(err){
                        console.log(err);
                    }else{
                        galleryImages = files;

                        res.render('admin/edit_product',{
                            title : p.title,
                            errors : errors,
                            desc : p.desc,
                            categories : categories,
                            category : p.category.replace(/\s + /g, '-').toLowerCase(),
                            price : parseFloat(p.price).toFixed(2),
                            image : p.iamge,
                            galleryImages : galleryImages,
                            id : p._id
                        });
                    }
                })
            }
        })

   });
    
});

//post edit product
router.post('/edit-product/:id',function(req,res){

    let imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";

    req.checkBody('title', 'Title must have a value.').notEmpty();
    req.checkBody('desc', 'Description must have a value.').notEmpty();
    req.checkBody('price', 'Price must have a value.').isDecimal();
    req.checkBody('image', 'You must upload an image').isImage(imageFile);

    let title = req.body.title;
    let slug = title.replace(/\s+/g, '-').toLowerCase();
    let desc = req.body.desc;
    let price = req.body.price;
    let category = req.body.category;
    let pimage = req.body.pimage;
    let id = req.params.id;

    let errors = req.validationErrors();

    if (errors) {
        req.session.errors = errors;
        res.redirect('/admin/products/edit-product/' + id);
    } else {
        Product.findOne({slug: slug, _id: {'$ne': id}}, function (err, p) {
            if (err)
                console.log(err);

            if (p) {
                req.flash('danger', 'Product title exists, choose another.');
                res.redirect('/admin/products/edit-product/' + id);
            } else {
                Product.findById(id, function (err, p) {
                    if (err)
                        console.log(err);

                    p.title = title;
                    p.slug = slug;
                    p.desc = desc;
                    p.price = parseFloat(price).toFixed(2);
                    p.category = category;
                    if (imageFile != "") {
                        p.image = imageFile;
                    }

                    p.save(function (err) {
                        if (err)
                            console.log(err);

                        if (imageFile != "") {
                            if (pimage != "") {
                                fs.remove('public/product_images/' + id + '/' + pimage, function (err) {
                                    if (err)
                                        console.log(err);
                                });
                            }

                            let productImage = req.files.image;
                            let path = 'public/product_images/' + id + '/' + imageFile;

                            productImage.mv(path, function (err) {
                                return console.log(err);
                            });

                        }

                        req.flash('success', 'Product edited!');
                        res.redirect('/admin/products/edit-product/' + id);
                    });

                });
            }
        });
    }

});



//get delete product
router.get('/delete-product/:id',function(req,res){
    Product.findByIdAndRemove(req.params.id,function(err){
        if(err) return console.log(err);
        req.flash('success','Product deleted!');
        res.redirect('/admin/products/');
    })
})




//Exports
module.exports = router;