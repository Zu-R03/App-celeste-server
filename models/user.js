const mongoose = require('mongoose'); 
 
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
    unique: true 
  }, 
  password: { 
    type: String, 
    required: true, 
    minilength : 2 
  }, 
  suscripcion: { 
    endpoint: { type: String, unique: true }, 
    expirationTime: { type: Date }, 
    keys: { 
      p256dh: { type: String }, 
      auth: { type: String } 
    } 
  } 
}, { timestamps: true }); 
 
module.exports = mongoose.model('Usuarios', userSchema); 