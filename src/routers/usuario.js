const express = require("express");
const router = express.Router();
const userSchema = require("../models/usuario");
const { activeSession } = require("../authentication/verificarToken");
const { isAdmin } = require("../authentication/validarRol");

//Creacion Truequero o Admin
router.post("/new", async (req, res) => {
    try {
        const { correo , numDocumento } = req.body;

        // validar si esiste
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



//listar usuarios
router.get("/all", activeSession ,isAdmin, async (req, res) => {
    userSchema.find()
        .then((data) => res.json(data))
        .catch((error) => res.json({message:error}));
})

//buscar por id trae info
router.get("/search/:id", isAdmin, async (req,res) =>{
    const { id } = req.params;
    userSchema
        .findById(id)
        .then((data) => res.json(data))
        .catch((error) => res.json({message:error}))
})

//info user login
router.get("/search", activeSession, async (req,res) =>{
    const  id = req.user.userId;
    userSchema
        .findById(id)
        .then((data) => res.json(data))
        .catch((error) => res.json({message:error}))
})

//update cualquier usuario
router.put("/update/:id", activeSession, async (req,res) =>{
    const {id } = req.params;
    const {nombre,apellido,tipoDocumento,genero,numDocumento,celular,fechaNacimiento,correo,departamento} = req.body;
    userSchema
        .updateOne(
            {_id:id},
            { $set: {nombre,apellido,tipoDocumento,genero,numDocumento,fechaNacimiento,correo,departamento}}
        )       
        .then((data) => res.json(data))
        .catch((error) => res.json({message:error}))
})


//update user logueado
router.put("/update", activeSession, async (req,res) =>{
    console.log("in");
    const id = req.user.userId;
    console.log(id);
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

//delete
router.delete("/delete/:id" ,isAdmin, async (req,res) => {
    const { id } = req.params;
    userSchema
        .findByIdAndDelete(id)
        .then((data) => {res.json(data)})
        .catch((error) => {res.json({message:error})})
})

//exporta las rutas para que puedan ser utilizadas
module.exports = router;