require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const webpush = require('web-push');
const bodyParser = require('body-parser');
const cors = require('cors');  // Agregar el módulo 'cors'

const app = express();
const port = process.env.PORT || 5000;

const usersRouter = require('./routes/users');

// Configuración de Web Push
webpush.setVapidDetails(
  'mailto:anthony.martinez.21s@utzmg.edu.mx',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Middleware para permitir CORS usando el paquete 'cors'
app.use(cors({
  origin: '*',  // Permite todos los orígenes
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],  // Métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization'],  // Encabezados permitidos
  credentials: true  // Si necesitas habilitar credenciales (cookies, auth headers, etc.)
}));

// Middleware
app.use(express.json());
app.use(bodyParser.json());

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conectado a MongoDB Atlas'))
  .catch(err => console.error('Error al conectar a MongoDB Atlas:', err));

// Rutas
app.use('/api/users', usersRouter);

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});