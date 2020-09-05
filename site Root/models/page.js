const mongoose = require('mongoose');

let PageSchema = mongoose.Schema({
    title : {
        type : String,
        required : true
    },
    slug : {
        type : String,
        required : true
    },
    content : {
        type : String,
        required : true
    },
    sorting : {
        type : Number
    }
});

let page = module.exports = mongoose.model('Page',PageSchema);