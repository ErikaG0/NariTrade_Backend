
const express = require("express");
const router = express.Router();
const userSchema = require("../models/usuario");
const articulosSchema = require("../models/articulo");
const truequeSchema = require("../models/comercio");
const { activeSession } = require("../authentication/verificarToken");
const { isAdmin } = require("../authentication/validarRol");
const { default: mongoose } = require("mongoose");


//ver solicitudes de trueque por usuario logueado  
router.get("/misSolicitudes/", activeSession, async (req, res) => {
   const idUser = req.userId;
   console.log("userSolicitudes => " + idUser)

   try {
      const data = await truequeSchema.find({ "idProductoQuiere.idPerson": idUser });
      console.log(data)
      // Obtener todos los Ids de las personas que ofertan
      const idPersonaOferta = data.map(d => d.idPersonOferta);

      // Traer toda la info de las personas
      const personasOfertantes = await userSchema.find({
         _id: { $in: idPersonaOferta }
      });

      // Empaquetar respuesta por cada trueque
      const solicitudes = data.map((trueque) => {
         const persona = personasOfertantes.find(p => p._id.toString() === trueque.idPersonOferta);

         return {
            trueque: trueque._id,
            trueque_estado: trueque.estado,
            miproducto: {
               id: trueque.idProductoQuiere._id,
               titulo: trueque.idProductoQuiere.titulo,
               descri: trueque.idProductoQuiere.descri,
               categoria: trueque.idProductoQuiere.categoria,
               estado: trueque.idProductoQuiere.estado,
            },
            productoOfertado: {
               id: trueque.idProductoOferta._id,
               titulo: trueque.idProductoOferta.titulo,
               descri: trueque.idProductoOferta.descri,
               categoria: trueque.idProductoOferta.categoria,
               estado: trueque.idProductoOferta.estado,
               //img: trueque.idProductoOferta.img
               fechaSolicitud: trueque.fechaSolicitud
            },
            personaaQueOferta: {
               nombre: persona?.nombre,
               apellido: persona?.apellido,
               correo: persona?.correo,
               celular: persona?.celular
            }
         };
      });

      res.status(200).json({ solicitudes });

   } catch (error) {
      res.status(500).json({ message: error.message });
   }

})

//aceptar oferta requiere el id del trueque  
router.put("/aceptaTrueque/:id", activeSession, async (req, res) => {

   const { id } = req.params;
   console.log("id de trueque " + id)

   try {
      //busca el trueque
      const idTrueque = await truequeSchema.findById(id);

      //envia mensaje si no existe
      if (!idTrueque) {
         return res.status(400).json({ message: "Trueque no existe" })
      }

      //cambia el estado articulo truequedado
      await articulosSchema.updateOne(
         { _id: idTrueque.idProductoQuiere._id },
         { $set: { estado: "Truequeado" } },
      )

      await articulosSchema.updateOne(
         { _id: idTrueque.idProductoOferta._id },
         { $set: { estado: "Truequeado" } }
      )

      //cambia el estado del trueque  y se agrega el campo fecha
      await truequeSchema.updateOne(
         { _id: id },
         { $set: { estado: "Aceptado", fechaAcepta: Date.now() } }
      )



      const truequesConEseProducto = await truequeSchema.find({
         "idProductoQuiere._id": idTrueque.idProductoQuiere._id,
         _id: { $ne: id }  // excluye el trueque aceptado
      });


      // Actualizar su estado a "Rechazado"
      await truequeSchema.updateMany(
         {
            "idProductoQuiere._id": idTrueque.idProductoQuiere._id,
            _id: { $ne: id }
         },
         {
            $set: { estado: "Rechazado" }
         }
      );

      await truequeSchema.updateOne(
         { _id: id },
         {
            $set: {
               "idProductoQuiere.estado": "Truequeado",
               "idProductoOferta.estado": "Truequeado",
             
            }
         }
      );



      return res.status(200).json({ message: "Trueque aceptado exitosamente" });

   } catch (error) {
      res.status(500).json({ message: error.message })
   }

})

//ver mis ofrecimiento a trueques (donde YO ofrezco algo a otro))  
router.get("/misPropuestas/", activeSession, async (req, res) => {
   const idUser = req.userId;
   console.log("userPropuestas => " + idUser);

   try {
      // Buscar trueques donde el usuario es quien hace la oferta
      const data = await truequeSchema.find({ idPersonOferta: idUser });
      console.log("Trueques encontrados:", data);

      // Obtener IDs de las personas a quienes les están haciendo ofertas
      const idPersonasReceptoras = data.map(d => d.idProductoQuiere.idPerson);

      // Traer info de esas personas
      const personasReceptoras = await userSchema.find({
         _id: { $in: idPersonasReceptoras }
      });

      // Empaquetar respuesta
      const propuestas = data.map((trueque) => {
         const persona = personasReceptoras.find(p => p._id.toString() === trueque.idProductoQuiere.idPerson);

         return {
            trueque_id: trueque._id,
            trueque_estado: trueque.estado,
            productoDeseado: {
               titulo: trueque.idProductoQuiere.titulo,
               descri: trueque.idProductoQuiere.descri,
               categoria: trueque.idProductoQuiere.categoria,
               estado: trueque.idProductoQuiere.estado,
            },
            productoOfrecido: {
               titulo: trueque.idProductoOferta.titulo,
               descri: trueque.idProductoOferta.descri,
               categoria: trueque.idProductoOferta.categoria,
               estado: trueque.idProductoOferta.estado,
               fechaSolicitud: trueque.fechaSolicitud
            },
            personaAlaQueSePropone: {
               nombre: persona?.nombre,
               apellido: persona?.apellido,
               correo: persona?.correo,
               celular: persona?.celular
            }
         };
      });

      res.status(200).json({ propuestas });

   } catch (error) {
      console.error("Error al obtener propuestas:", error);
      res.status(500).json({ message: error.message });
   }
});

module.exports = router;