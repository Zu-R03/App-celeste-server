const express = require('express');
const router = express.Router();
const webpush = require('web-push');
const Suscripcion = require('../models/user');

// Crear a un nuevo usuario
router.post('/create-user', (req, res) => {
    const { name, lastname, email, password } = req.body;
  
    if (!name || !lastname || !email || !password) {
        return res.status(400).json({ error: 'Todos los campos son necesarios' });
    }

    // Insertar datos en la base de datos (simulado por un log)
    console.log(`Usuario recibido: ${name} ${lastname} - ${email}`);

    // Responder con éxito
    res.status(201).json({
        message: 'Usuario creado exitosamente',
        user: { name, lastname, email }
    });
});

module.exports = router;