const e= require("express");
const mongoose = require("mongoose");

const truequeSchema= mongoose.Schema({

    idPersonOferta:{type:String,required:true},
    nombrePersona:{type:String, require:true},
    idProductoQuiere:{ type: Object },
    idProductoOferta: { type: Object },
    fechaSolicitud:{type:Date, default:Date.now, required:false},
    estado:{type:String, enum:['Pendiente','Aceptado', 'Rechazado'],default:'Pendiente'},
    fechaAcepta:{type:Date, require:false}

})

module.exports = mongoose.model('Trueque', truequeSchema )