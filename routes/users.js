const express = require('express');
const router = express.Router();
const Usuario = require('../models/user');

// Crear a un nuevo usuario
router.post('/create-user', async (req, res) => {
    console.log('Datos recibidos:', req.body); // Verifica los datos enviados desde el cliente

    try {
        const { name, lastname, email, password } = req.body;

        if (!name || !lastname || !email || !password) {
            console.log('Error: Campos requeridos faltantes');
            return res.status(400).json({ error: 'Todos los campos son necesarios' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.log('Error: Formato de correo no válido');
            return res.status(400).json({ error: 'Formato de correo no válido' });
        }

        const usuario = new Usuario({ name, lastname, email, password });
        await usuario.save();
        console.log('Usuario creado exitosamente');

        res.status(201).json({
            message: 'Usuario creado exitosamente',
            user: { name, lastname, email },
        });
    } catch (err) {
        console.error('Error al crear usuario:', err.message);

        if (err.code === 11000) {
            return res.status(400).json({ error: 'El correo ya está registrado' });
        }
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Correo y contraseña son necesarios' });
        }

        // Buscar al usuario por correo
        const usuario = await Usuario.findOne({ email });
        if (!usuario) {
            return res.status(400).json({ error: 'Correo o contraseña incorrectos' });
        }

        // Asegúrate de que el _id se incluya correctamente
        const usuarioObj = usuario.toObject();

        // Comprobar si la contraseña es correcta
        if (usuario.password !== password) {
            return res.status(400).json({ error: 'Correo o contraseña incorrectos' });
        }

        res.status(200).json({
            message: 'Login exitoso',
            user: {
                id: usuarioObj._id, // Asegúrate de enviar el _id
                name: usuarioObj.name,
                lastname: usuarioObj.lastname,
                email: usuarioObj.email
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;