const express = require('express'); 
const router = express.Router(); 
const webpush = require('web-push'); 
const User = require('../models/user'); 
 
router.post('/subscribe', async (req, res) => { 
  try { 
    const { userId, subscription } = req.body; 
    if (!subscription || !subscription.endpoint || !subscription.keys || !subscription.keys.p256dh || !subscription.keys.auth) { 
      return res.status(400).json({ error: 'Faltan campos necesarios en la suscripción' }); 
    } 
 
    const user = await User.findById(userId); 
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' }); 
    user.suscripcion = subscription; 
    await user.save(); 
 
    const payload = { 
      title: 'Notificaciones activadas', 
      body: 'Gracias por suscribirte', 
    }; 
 
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
 
router.post('/send', async (req, res) => { 
  const { userIds, payload } = req.body; 
 
  try { 
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) { 
      return res.status(400).json({ error: 'Hace falta el id del usuario' }); 
    } 
 
    const users = await User.find({ '_id': { $in: userIds } }); 
 
    if (users.length === 0) { 
      return res.status(404).json({ error: 'Ningún usuario encontrado con las suscripciones' }); 
    } 
 
    const notificaciones = users.map(user => { 
      if (user.suscripcion) { 
        const pushSubscription = { 
          endpoint: user.suscripcion.endpoint, 
          keys: user.suscripcion.keys 
        }; 
 
        return webpush.sendNotification(pushSubscription, JSON.stringify(payload)).catch(err => { 
          console.error('Error enviando notificación a:', user._id, err); 
        }); 
      } else { 
        console.log('Usuario sin suscripción:', user._id); 
      } 
    }); 
 
    await Promise.all(notificaciones); 
 
    res.json({ message: 'Se ha enviado las notificaciones' }); 
 
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  } 
}); 
 
router.post('/sendAll', async (req, res) => { 
  const payload = JSON.stringify(req.body.payload); 
 
  try { 
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
    res.json({ message: 'Notificaciones enviadas' }); 
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  } 
}); 
 
module.exports = router; 