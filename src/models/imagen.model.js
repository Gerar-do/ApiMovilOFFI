import mongoose from 'mongoose';

const { Schema } = mongoose;

const imagenSchema = new Schema({
  nombre: {
    type: String,
    required: true
  },
  imagen: {
    type: String,
    required: false
  },
  texto: {
    type: String,
    required: true
  }
}, {
  timestamps: true,
  collection: 'imagenes'
});

const Imagen = mongoose.model('Imagen', imagenSchema);

export default Imagen;
