
function isAdmin(req, res, next) {
    if (req.user && req.user.rol === "admin") {
        return next();
    }
    return res.status(403).json({ message: "Acceso denegado. Se requiere rol de administrador." });
}

module.exports = { isAdmin };
