//importar librerias
const express = require('express');//crear y configurar el servidor web
const app = express();//instancia de aplicacion
const port = 3000;//define el puerto
const userRoutes = require("./src/routers/usuario");
const sessionRoutes = require("./src/routers/session");
const articuloRoutes = require("./src/routers/articulo");
const mongoose = require("mongoose");
//carga varible de entorno del archivo clave mongo
require('dotenv').config();

//middleware es una funcion que se ejcuta antes de que el servidor le de una respuesta al cliente
app.use(express.urlencoded({ extended: false })); //leer datos enviados por formularios
app.use(express.json()); //leer datos enviado JSON



//todas las rutas que empiecen por /api seran manejadas por 

app.use("/api/items", articuloRoutes);
app.use("/api/user", userRoutes);
app.use("/api", sessionRoutes);


//Conexion BD
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("Conexion BD"))
    .catch((error) => console.log(error));

//Conexion al puerto
app.listen(port,() => {
    console.log("pueto app" + `${port}`)
})