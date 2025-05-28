const jwt = require("jsonwebtoken");
const { tokenBlacklist } = require("./blacklist"); // Importa la blacklist
require("dotenv").config();

function activeSession(req, res, next) {
    console.log("Lista de tokens en blacklist:", Array.from(tokenBlacklist));

    // Leer el token desde el header Authorization
    let rawToken = req.headers.authorization || '';
    const token = rawToken.startsWith("Bearer ") ?
        rawToken.split(" ")[1] :
        rawToken;

    if (!token) {
        return res.status(403).json({ message: "Token no proporcionado" });
    }

    // Verificar si el token está en la blacklist (cerró sesión)
    if (tokenBlacklist.has(token)) {
        console.log("Token en blacklist:", token);
        return res.status(401).json({ message: "Token inválido. Ha cerrado sesión." });
    }

    try {
        // Verificar y decodificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Adjuntar los datos del usuario al request
        req.userId = decoded.userId;
        req.userRol = decoded.rol;
        req.userNombre = decoded.nombre;

        console.log("ID del usuario:", decoded.userId);
        console.log("Rol del usuario:", decoded.rol);

        next(); // Continuar con la siguiente función en la ruta
    } catch (err) {
        return res.status(401).json({ message: "Token inválido o expirado" });
    }
}

module.exports = { activeSession };