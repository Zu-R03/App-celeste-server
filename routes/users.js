const express = require('express');
const router = express.Router();
const Usuario = require('../models/user');

// Crear a un nuevo usuario
router.post('/create-user', async (req, res) => {
    try {
        const { name, lastname, email, password, suscripcion } = req.body;

        // Validar campos requeridos
        if (!name || !lastname || !email || !password) {
            return res.status(400).json({ error: 'Todos los campos son necesarios' });
        }

        // Validar el formato del correo (opcional pero recomendado)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Formato de correo no válido' });
        }

        // Crear un nuevo usuario
        const usuario = new Usuario({
            name,
            lastname,
            email,
            password,
            suscripcion // Puede ser null o un objeto válido
        });

        await usuario.save();

        // Responder con éxito (excluir la contraseña de la respuesta)
        res.status(201).json({
            message: 'Usuario creado exitosamente',
            user: { name, lastname, email }
        });
    } catch (err) {
        // Manejar errores, por ejemplo, correo duplicado
        if (err.code === 11000) {
            return res.status(400).json({ error: 'El correo ya está registrado' });
        }
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;