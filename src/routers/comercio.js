const express = require("express");
const router = express.Router();
const userSchema = require("../models/usuario");
const truequeSchema = require("../models/comercio");
const articulosShema = require("../models/articulo");
const { activeSession } = require("../authentication/verificarToken");
const { isAdmin } = require("../authentication/validarRol");
const { default: mongoose } = require("mongoose");



//comercio listar productos
router.get("/items", activeSession, async (req, res) => {
    const idLogueado = req.userId;

    try {

        //filtro solo mostrar los que tengan el estado publicado y que no sean nuestros propios articulos
        const items = await articulosShema.find(
            { estado: "Publicado", idPerson: { $ne: idLogueado } }, //$ne exclusion
            {
                _id: 0, fechaUpdate: 0, rolPerson: 0,
                __v: 0
            }
        );
        //extrae el id propietario item
        const idOwnerObj = items.map(d => d.idPerson);
        //busca el propietario 
        const personasOwer = await userSchema.find({
            _id: { $in: idOwnerObj }
        });

        const mapaUsuarios = {};
        personasOwer.forEach(user => {
            mapaUsuarios[user._id] = {
                nombre: user.nombre,
                apellido: user.apellido
            };
        });

         const resultado = items.map(item => ({
            ...item.toObject(), // Convertir el artículo en objeto plano
            owner: mapaUsuarios[item.idPerson] || { nombre: "Desconocido", apellido: "-" } // Añadir los datos del dueño
        }));

        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

})

//solicitud trueque
router.post("/solicitar/:idProductoQuiere/:idProductoOferta", activeSession, async (req, res) => {
    const id = req.userId;
    const nombreSolicita = req.userNombre;

    const { idProductoQuiere, idProductoOferta } = req.params;


    try {
        console.log(idProductoOferta, idProductoQuiere)

        if (!idProductoQuiere) {
            return res.status(400).json({ message: "No se encontro producto para intercambiar" });
        } if (!idProductoOferta) {
            return res.status(400).json({ message: "No encontro producto para ofertar" });
        }


        //buscar productos
        const produQuiere = await articulosShema.findById(idProductoQuiere);
        const produOferta = await articulosShema.findById(idProductoOferta);

        //valida precio
        const precioQ = produQuiere.precio;
        const precioO = produOferta.precio;

        if ((precioQ - precioO) >= (precioQ * 0.35)) {
            return res.status(400).json({ message: "La diferencia es superior  al 35%" });
        }

        const nuevaSolicitud = new truequeSchema({
            idPersonOferta: id,
            nombrePersona: nombreSolicita,
            idProductoQuiere: produQuiere,
            idProductoOferta: produOferta,
        })
        const save = await nuevaSolicitud.save();
        res.status(200).json(save)


    } catch (error) { res.status(500).json({ message: error.message }) }
})

//ver mis ofrecimiento a trueques


module.exports = router;