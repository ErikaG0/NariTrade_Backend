const express = require("express");
const router = express.Router();
const userSchema = require("../models/usuario");

const { activeSession } = require("../authentication/verificarToken");
const { isAdmin } = require("../authentication/validarRol");

//Creacion Truequero 
router.post("/SignUp", async (req, res) => {
    console.log("entro creaccion truequero");
    try {
        const { correo , numDocumento } = req.body;
         // validar si existe correo documento
        const userCorreo = await userSchema.findOne({ correo});
        const userDocument = await userSchema.findOne({numDocumento});
        if (userCorreo || userDocument) {
            return res.status(400).json({ message: "Usuario ya existe" });
        }
        // Crearlo sino
        const newUser = new userSchema(req.body);
        newUser.clave = await newUser.encryptClave(newUser.clave);
        const savedUser = await newUser.save();
        res.json(savedUser);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


//listar todos los usuarios (solo sirve si el que lo consulta es ADMIN)
router.get("/all", activeSession ,isAdmin, async (req, res) => {
    userSchema.find()
        .then((data) => res.json(data))
        .catch((error) => res.json({message:error}));
})

//buscar por id a un usuario (solo sirve si el que lo consulta es ADMIN)
router.get("/search/:id", activeSession, isAdmin, async (req,res) =>{
    const { id } = req.params;
    userSchema
        .findById(id)
        .then((data) => res.json(data))
        .catch((error) => res.json({message:error}))
})

//trae la info del propio user logueado
router.get("/search", activeSession, async (req,res) =>{
    const  id = req.userId;
    userSchema
        .findById(id)
        .then((data) => res.json(data))
        .catch((error) => res.json({message:error}))
})

//update cualquier usuario (solo sirve si el que lo consulta es ADMIN)
router.put("/update/:id", activeSession,isAdmin, async (req,res) =>{router.get("/all", activeSession, isAdmin, async (req,res) =>{
   articulosShema.find()
      .then((data) => res.json(data))
      .catch((error) => res.json({message:error}));
})
    const { id } = req.params;
    const {nombre,apellido,tipoDocumento,genero,numDocumento
        ,celular,fechaNacimiento,correo,departamento} = req.body;
    userSchema
        .updateOne(
            {_id:id},
            { $set: {nombre,apellido,tipoDocumento,genero,
                numDocumento,fechaNacimiento,correo,departamento}}
        )       
        .then((data) => res.json(data))
        .catch((error) => res.json({message:error}))
})


//update para el propio user Logueado (modifica su informacion basica)
router.put("/update", activeSession, async (req,res) =>{
    console.log("ingreso logueo");
    const id = req.userId;
    
    const {correo,celular,departamento,clave} = req.body;
    
    try{
        const user = await userSchema.findById(id);
        const updateData = {correo,celular,departamento,clave};

        if(clave){
            updateData.clave = await user.encryptClave(clave);
        }

        const result = await userSchema.updateOne({_id:id}, {$set: updateData});
        res.json(result);

    }catch(error){
        res.status(500).json({message: error.message});
    }

})


//delete user (solo sirve si el que lo consulta es ADMIN)
router.delete("/delete/:id",activeSession,isAdmin, async (req,res) => {
    const { id } = req.params;
    userSchema
        .findByIdAndDelete(id)
        .then((data) => {res.json(data)})
        .catch((error) => {res.json({message:error})})
})


//exporta las rutas para que puedan ser utilizadas
module.exports = router;