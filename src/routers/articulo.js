const express = require("express");
const router = express.Router();
const userSchema = require("../models/usuario");
const articulosShema = require("../models/articulo");
const { activeSession } = require("../authentication/verificarToken");
const { isAdmin } = require("../authentication/validarRol");
const { default: mongoose } = require("mongoose");

//crear articulo
router.post("/new", activeSession, async (req, res) => {

   try {
      const id = req.userId;
      const rol = req.userRol;
      console.log(" endpoint new items ", id,rol);
        
      const newArticulo = new articulosShema({
         ...req.body,//operados ... spread toma los campos dentro de 
         //req body y los desempaqueta para incluirlos
         idPerson: id,
         rolPerson: rol,
       
      })

      const saveArticulo = await  newArticulo.save();
      res.status(200).json(saveArticulo);
   }catch(error){
      res.status(500).json({message:error.message});
   }
    

});

//listar todos los articulos (valido rol Admin)
router.get("/all", activeSession, isAdmin, async (req,res) =>{
   articulosShema.find()
      .then((data) => res.json(data))
      .catch((error) => res.json({message:error}));
})

//listar por articulos del user logueado
router.get("/mis",activeSession, async(req,res) =>{
   const id = req.userId;
   console.log(id+ " lista articulos cliente")
   articulosShema
      .find({idPerson:id})
      .then((data) => res.json(data))
      .catch((error) => res.json({message:error}))
})

//actualizar items
router.put("/update/:id", activeSession, async (req,res) => {
   const { idItem } = req.params;
   const {titulo,descri,categoria,precio,fechaUpdate,estado}  = req.body;
   articulosShema
      .updateOne(
         {_idItem: idItem},
         {$set:{titulo,descri,categoria,precio,fechaUpdate,estado}}
      )
      .then((data) => res.json(data))
      .catch((error) => res.json({mesaage:error}))      
})


//delete  (valido rol Admin)
router.delete("/update/:id", activeSession, isAdmin, async (req,res) => {
    const { id } = req.params;
    articulosShema
        .findByIdAndDelete(id)
        .then((data) => {res.json(data)})
        .catch((error) => {res.json({message:error})})
})

module.exports = router;