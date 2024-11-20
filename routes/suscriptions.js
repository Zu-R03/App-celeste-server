const express = require('express');
const router = express.Router();
const webpush = require('web-push');
const User = require('../models/user'); // Importar el modelo actualizado

// Guardar o actualizar una suscripción para un usuario
router.post('/subscribe', async (req, res) => {
  try {
    const { userId, endpoint, expirationTime, keys } = req.body;

    // Validar los campos obligatorios
    if (!userId || !endpoint || !keys || !keys.p256dh || !keys.auth) {
      return res.status(400).json({ error: 'Faltan campos necesarios en la suscripción' });
    }

    // Buscar al usuario por su ID
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    // Actualizar la suscripción del usuario
    user.suscripcion = { endpoint, expirationTime: expirationTime || null, keys };
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
  const { userId, payload } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user || !user.suscripcion) {
      return res.status(404).json({ error: 'Usuario o suscripción no encontrada' });
    }

    const pushSubscription = {
      endpoint: user.suscripcion.endpoint,
      keys: user.suscripcion.keys
    };

    await webpush.sendNotification(pushSubscription, JSON.stringify(payload));
    res.json({ message: 'Notificación enviada' });
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