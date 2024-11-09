const express = require('express');
const router = express.Router();
const webpush = require('web-push');
const Suscripcion = require('../models/suscription');

// Guardar una suscripción
router.post('/subscribe', async (req, res) => {
  try {
    const { endpoint, expirationTime, keys } = req.body;

    const suscripcion = new Suscripcion({ endpoint, expirationTime, keys });
    await suscripcion.save();

    // Payload para la notificación
    const payload = {
      title: 'Notificaciones activadas',
      body: 'Gracias por suscribirte',
      //icon: '/path/to/icon.png', // (Opcional) Puedes agregar un icono
    };

    // Enviar la notificación a la suscripción recién guardada
    const pushSubscription = {
      endpoint: suscripcion.endpoint,
      keys: suscripcion.keys
    };

    await webpush.sendNotification(pushSubscription, JSON.stringify(payload));

    res.status(201).json({ message: 'Suscripción guardada y notificación enviada exitosamente' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// Enviar notificación a una suscripción específica
router.post('/send', async (req, res) => {
  const { endpoint, payload } = req.body;

  try {
    const suscripcion = await Suscripcion.findOne({ endpoint });
    if (!suscripcion) return res.status(404).json({ error: 'Suscripción no encontrada' });

    const pushSubscription = {
      endpoint: suscripcion.endpoint,
      keys: suscripcion.keys
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
    const suscripciones = await Suscripcion.find();

    const notificaciones = suscripciones.map(suscripcion => {
      const pushSubscription = {
        endpoint: suscripcion.endpoint,
        keys: suscripcion.keys
      };
      return webpush.sendNotification(pushSubscription, payload).catch(err => {
        console.error('Error enviando notificación:', err);
      });
    });

    await Promise.all(notificaciones);
    res.json({ message: 'Notificaciones enviadas a todas las suscripciones' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;