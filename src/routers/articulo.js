const express = require("express");
const router = express.Router();
const userSchema = require("../models/usuario");
const articulosSchema = require("../models/articulo");
const truequeSchema = require("../models/comercio");
const { activeSession } = require("../authentication/verificarToken");
const { isAdmin } = require("../authentication/validarRol");
const { default: mongoose } = require("mongoose");


//crear articulo
router.post("/new", activeSession, async(req, res) => {

    try {
        const id = req.userId;
        const rol = req.userRol;
        console.log(" endpoint new items para la persona ", id, rol);
        const { titulo } = req.body;

        //valida que un usuario no cree multiples veces el mismo articulo
        const tituloArti = await articulosSchema.findOne({ titulo: titulo, idPerson: id });
        if (tituloArti) {
            return res.status(400).json({ message: "Producto ya existe" });
        }

        const newArticulo = new articulosSchema({
            ...req.body, //operador ... spread toma los campos dentro de 
            //req body y los desempaqueta para incluirlos
            idPerson: id,
            rolPerson: rol,

        });

        const saveArticulo = await newArticulo.save();
        res.status(200).json(saveArticulo);
    } catch (error) {
        res.status(501).json({ message: error.message });
    }
});

//listar todos los articulos (valido rol Admin)
router.get("/all", activeSession, isAdmin, async(req, res) => {
    articulosSchema.find()
        .then((data) => res.json(data))
        .catch((error) => res.json({ message: error }));
})

//listar por articulos del user logueado
router.get("/mis", activeSession, async(req, res) => {
    const id = req.userId;
    console.log(id + " lista articulos cliente")
    articulosSchema
        .find({ idPerson: id })
        .then((data) => {
            if (!data || data.length == 0) {
                return res.json({ message: "No tienes artículos publicados." });
            }
            res.json(data);
        })
        .catch((error) => res.json({ message: error }))
})

//actualizar items
router.put("/update/:id", activeSession, async(req, res) => {
    const { id } = req.params;
    const { titulo, descri, categoria, precio } = req.body;
    articulosSchema
        .updateOne({ _id: id }, { $set: { titulo, descri, categoria, precio } })
        .then((data) => res.json(data))
        .catch((error) => res.json({ message: error }))
})

//eliminar  (valido rol Admin)
router.delete("/delete/:id", activeSession, async(req, res) => {
    const { id } = req.params;
    articulosSchema
        .findByIdAndDelete(id)
        .then((data) => { res.json(data) })
        .catch((error) => { res.json({ message: error }) })
})


//bloquear items admin
router.put("/updateBloqueado/:id", activeSession, isAdmin, async(req, res) => {
    const { id } = req.params;

    try {
        const result = await articulosSchema.updateOne({ _id: id }, { $set: { estado: "Bloqueado" } });

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Artículo no encontrado" });
        }

        res.status(200).json({ message: "Artículo bloqueado exitosamente" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
//desbloque lo deja en publicado nuevamente admin
router.put("/updateDesbloqueado/:id", activeSession, isAdmin, async(req, res) => {
    const { id } = req.params;

    try {
        const result = await articulosSchema.updateOne({ _id: id }, { $set: { estado: "Publicado" } });

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Artículo no encontrado" });
        }

        res.status(200).json({ message: "Artículo Desbloqueado exitosamente" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


module.exports = router;