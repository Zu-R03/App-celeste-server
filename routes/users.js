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

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validar que el correo y la contraseña no estén vacíos
        if (!email || !password) {
            return res.status(400).json({ error: 'Correo y contraseña son necesarios' });
        }

        // Buscar el usuario por correo
        const usuario = await Usuario.findOne({ email });
        if (!usuario) {
            return res.status(400).json({ error: 'Correo o contraseña incorrectos' });
        }

        // Comprobar si la contraseña es correcta (sin encriptación)
        if (usuario.password !== password) {
            return res.status(400).json({ error: 'Correo o contraseña incorrectos' });
        }

        // Responder con éxito
        res.status(200).json({
            message: 'Login exitoso',
            user: {
                id: usuario._id,
                name: usuario.name,
                lastname: usuario.lastname,
                email: usuario.email
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;