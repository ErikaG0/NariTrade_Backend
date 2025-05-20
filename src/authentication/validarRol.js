
function isAdmin(req, res, next) {
console.log("valida si el rol admin");

    if ( req.userRol === "admin") {
        console.log(req.userRol)
        return next();
    }
    return res.status(403).json({ message: "Acceso denegado. Se requiere rol de administrador." });
}

module.exports = { isAdmin };
