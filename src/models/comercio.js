const e= require("express");
const mongoose = require("mongoose");

const truequeSchema= mongoose.Schema({

    idPersonOferta:{type:String,required:true},
    nombrePersona:{type:String, require:true},
    idProductoQuiere:{type:String,required:true},
    idProductoOferta:{type:String,required:true},
    fechaSolicitud:{type:Date, default:Date.now, required:false},
    

})

module.exports = mongoose.model('Trueque', truequeSchema )