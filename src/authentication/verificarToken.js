const jwt = require("jsonwebtoken");
const { tokenBlacklist } = require("./blacklist"); // Importa la blacklist
require("dotenv").config();

function activeSession(req, res, next) {
    
    console.log("lista de token" + Array.from(tokenBlacklist));
    console.log(req.headers['authorization']);
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(403).json({ message: "Token no proporcionado" });
    }

    if (tokenBlacklist.has(token)) {
        console.log("lista de token" + Array.from(tokenBlacklist));
        return res.status(401).json({ message: "Token inválido. Ha cerrado sesión." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        console.log(decoded);
        next();
    } catch (err) {
        return res.status(401).json({ message: "Token inválido o expirado" });
    }
}

module.exports = { activeSession };
