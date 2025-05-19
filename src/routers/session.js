//importamos librerias
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const userSchema = require("../models/usuario");
const jwt = require("jsonwebtoken");
const {addToBlacklist} =require("../authentication/blacklist");
const {activeSession} =require("../authentication/verificarToken")


router.post("/login", async (req, res) => {
    try {
        const { correo, clave } = req.body;
        const user = await userSchema.findOne({ correo });
        if (!user) return res.status(401).json({ message: "Correo incorrecto" });

        //comparamos si coincide la clave
        const claveMatch = await bcrypt.compare(clave, user.clave);
        if (!claveMatch) return res.status(401).json({ message: "Clave Incorrecta" });

        //se crea un JWT contiene id y rol
        const token = jwt.sign(
            { userId: user._id, rol: user.rol },
            //firma con nuestro secreto
            process.env.JWT_SECRET,
            //valido por
            { expiresIn: "1h" } 
        );

        //se envia token
        res.status(200).json({
            message: "Inicio de sesión exitoso",
            token,
            usuario: user.correo,
            usuarioRol: user.rol

        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

//El token ingresa balckList hasta que expira.
router.post("/logout", activeSession, async (req, res) => {
    console.log("entraaa")
    //se extrae del token el Bearer
    const token = req.headers.authorization?.split(" ")[1];
    console.log("logout token " +  token)
    if (token) {
         addToBlacklist(token);
     
    }
    res.json({ message: "Sesión cerrada correctamente" });
});


module.exports = router;