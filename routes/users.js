const express = require('express');
const router = express.Router();
const webpush = require('web-push');
const Usuario = require('../models/user');

// Crear a un nuevo usuario
router.post('/create-user', async (req, res) => {
    try {
        const { name, lastname, email, password } = req.body;
  
        if (!name || !lastname || !email || !password) {
            return res.status(400).json({ error: 'Todos los campos son necesarios' });
        } else {
            const usuario = new Usuario({ name, lastname, email, password });
            await usuario.save();

            // Responder con éxito
            res.status(201).json({
                message: 'Usuario creado exitosamente',
                user: { name, lastname, email }
            });
        }
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;