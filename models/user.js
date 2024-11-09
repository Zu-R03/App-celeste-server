const mongoose = require('mongoose');

// Definir el esquema del usuario
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true // Asegura que el correo sea único
    },
    password: {
        type: String,
        required: true
    }
}, { timestamps: true }); // Esto agrega 'createdAt' y 'updatedAt' automáticamente

// Crear un modelo a partir del esquema
const User = mongoose.model('Usuarios', userSchema);

module.exports = User;