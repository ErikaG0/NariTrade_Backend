//importar librerias
const cors = require("cors");
const express = require('express'); //crear y configurar el servidor web
const app = express(); //instancia de aplicacion
const port = 3070; //define el puerto
const userRoutes = require("./src/routers/usuario");
const sessionRoutes = require("./src/routers/session");
const articuloRoutes = require("./src/routers/articulo");
const comercioRoutes = require("./src/routers/comercio");
const truequeRoutes = require("./src/routers/trueque");
const estadisticaRouter = require("./src/routers/estadistica")
const mongoose = require("mongoose");
//carga varible de entorno del archivo clave mongo
require('dotenv').config();

//middleware es una funcion que se ejcuta antes de que el servidor le de una respuesta al cliente
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));

// ✅ Permite solicitudes desde Angular
app.use(
    cors({
        origin: "http://localhost:4200",
        credentials: true,
    })
);

//todas las rutas que empiecen por /... seran manejadas por 
app.use("/NariTrade/estadistica/", estadisticaRouter);
app.use("/NariTrade/trueque/", truequeRoutes);
app.use("/NariTrade/comercio/", comercioRoutes);
app.use("/NariTrade/items/", articuloRoutes);
app.use("/NariTrade/User/", userRoutes);
app.use("/NariTrade/", sessionRoutes);


//Conexion BD
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("Conexion BD"))
    .catch((error) => console.log(error));

//Conexion al puerto
app.listen(port, () => {
    console.log("Puerto app" + `${port}`)
})