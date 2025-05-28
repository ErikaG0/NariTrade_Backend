const express = require("express");
const router = express.Router();
const userSchema = require("../models/usuario");
const articulosSchema = require("../models/articulo");
const truequeSchema = require("../models/comercio");
const { activeSession } = require("../authentication/verificarToken");
const { isAdmin } = require("../authentication/validarRol");
const { default: mongoose } = require("mongoose");

//total de usuario , articulos  y trueques
router.get('/dashboard', activeSession, isAdmin, async(req, res) => {
    console.log("entra a estadisticas")
    try {
        const totalUsuarios = await userSchema.countDocuments();
        const totalArticulos = await articulosSchema.countDocuments();
        const totalTrueques = await truequeSchema.countDocuments();

        //cantidad de articulo en cada categoria
        const articulosPorCategoria = await articulosSchema.aggregate([
            { $group: { _id: "$categoria", total: { $sum: 1 } } }
        ]);
        //usario por rol
        const usuariosPorRol = await userSchema.aggregate([
            { $group: { _id: "$rol", total: { $sum: 1 } } }
        ]);
        //trueque por estado
        const truequesPorEstado = await truequeSchema.aggregate([
            { $group: { _id: "$estado", total: { $sum: 1 } } }
        ]);



        res.json({
            totalUsuarios,
            totalArticulos,
            totalTrueques,
            articulosPorCategoria,
            usuariosPorRol,
            truequesPorEstado
        })
    } catch (error) {
        res.status(400).json({ mesaje: "Error al Obtener estadisticas", error })
    }
})

module.exports = router;