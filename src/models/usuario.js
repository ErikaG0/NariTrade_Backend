const e = require("express");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");


const userSchema = mongoose.Schema({
    nombre:{ type:String, required:true},
    apellido:{ type:String, required:true},
    tipoDocumento:{ type:String, enum:['CC','CE','PASAPORTE'],required:true},
    genero:{ type:String, enum:['Mujer','Hombre','Sin Especificar'],required:true},
    celular:{ type:String, required:true},
    numDocumento:{type:String, required:true},
    fechaNacimiento:{type:Date, required:true}, //YYYY-MM-DD
    correo:{ type:String, required:true},
    clave:{ type:String, required:true},
    rol:{type:String, enum:['truequero','admin'], default:'truequero'},
    pais:{type:String, enum:['Colombia'], default:'Colombia'},
    departamento:{type:String, enum:['Distrito Capital','Cundinamarca','Boyaca','Antioquia','Barranquilla','Cartagena','Santa Marta','Valle del Cauca'],required:true},
    fechaRegistroUser:{type:Date,default:Date.now},
    estado:{type:String, enum:['Activo','Bloqueado'],default:'Activo'}

});

userSchema.methods.encryptClave = async function(clave) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(clave, salt);
}

module.exports = mongoose.model('User', userSchema);