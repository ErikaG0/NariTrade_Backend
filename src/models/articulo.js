const e = require("express");
const mongoose = require("mongoose");

function limitImg(val){
    return val.length <=5;
}

const articulosSchema = mongoose.Schema({
    titulo:{type:String, required:true},
    descri:{type:String, required:true},
    categoria:{ type:String, enum:['Muebles', 'Deporte', 'Tecnología','Libros'], required:true},
    estado:{type:String, enum:['Publicado', "Publicación Pausada",'Truequeado', 'Bloqueado'], default:'Publicado'},
    precio:{type:Number, required:true},
    fechaCreation:{type:Date, default:Date.now, required:true},
    img:{
        type:[String],
        validate:[limitImg]
    },
    idPerson:{type:String,required:true},
    rolPerson:{type:String,required:true},
    fechaUpdate:{type:Date, default:Date.now, required:false}
    

});

module.exports = mongoose.model('Articulos', articulosSchema)