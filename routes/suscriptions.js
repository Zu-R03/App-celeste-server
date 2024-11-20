const express = require('express');
const router = express.Router();
const webpush = require('web-push');
const User = require('../models/user'); // Importar el modelo actualizado

// Guardar o actualizar una suscripción para un usuario
router.post('/subscribe', async (req, res) => {
  try {
    const { userId, subscription } = req.body;

    // Validar que se recibió el objeto de suscripción correctamente
    if (!subscription || !subscription.endpoint || !subscription.keys || !subscription.keys.p256dh || !subscription.keys.auth) {
      return res.status(400).json({ error: 'Faltan campos necesarios en la suscripción' });
    }

    // Buscar al usuario por su ID
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    // Actualizar la suscripción del usuario
    user.suscripcion = subscription; // Guardar el objeto completo de la suscripción
    await user.save();

    // Payload para la notificación
    const payload = {
      title: 'Notificaciones activadas',
      body: 'Gracias por suscribirte',
    };

    // Enviar la notificación a la suscripción recién guardada
    const pushSubscription = {
      endpoint: user.suscripcion.endpoint,
      keys: user.suscripcion.keys
    };

    await webpush.sendNotification(pushSubscription, JSON.stringify(payload));

    res.status(201).json({ message: 'Suscripción guardada y notificación enviada exitosamente' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Enviar notificación a una suscripción específica (basada en el usuario)
router.post('/send', async (req, res) => {
  const { userIds, payload } = req.body; // Cambiar 'userId' por 'userIds'

  try {
    // Validar si se recibieron los 'userIds'
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'Se deben proporcionar uno o más userIds' });
    }

    // Buscar todos los usuarios con los IDs proporcionados
    const users = await User.find({ '_id': { $in: userIds } });

    // Verificar si existen usuarios con las suscripciones
    if (users.length === 0) {
      return res.status(404).json({ error: 'Ningún usuario encontrado con las suscripciones' });
    }

    // Enviar la notificación a cada usuario
    const notificaciones = users.map(user => {
      if (user.suscripcion) {
        const pushSubscription = {
          endpoint: user.suscripcion.endpoint,
          keys: user.suscripcion.keys
        };

        // Enviar la notificación
        return webpush.sendNotification(pushSubscription, JSON.stringify(payload)).catch(err => {
          console.error('Error enviando notificación a:', user._id, err);
        });
      } else {
        console.log('Usuario sin suscripción:', user._id);
      }
    });

    // Esperar a que todas las notificaciones se envíen
    await Promise.all(notificaciones);

    // Responder cuando todas las notificaciones han sido enviadas
    res.json({ message: 'Notificaciones enviadas a los usuarios seleccionados' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Enviar notificaciones a todas las suscripciones
router.post('/sendAll', async (req, res) => {
  const payload = JSON.stringify(req.body.payload);

  try {
    // Obtener todos los usuarios con suscripciones activas
    const users = await User.find({ 'suscripcion.endpoint': { $exists: true } });

    const notificaciones = users.map(user => {
      const pushSubscription = {
        endpoint: user.suscripcion.endpoint,
        keys: user.suscripcion.keys
      };
      return webpush.sendNotification(pushSubscription, payload).catch(err => {
        console.error('Error enviando notificación:', err);
      });
    });

    await Promise.all(notificaciones);
    res.json({ message: 'Notificaciones enviadas a todas las suscripciones activas' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;