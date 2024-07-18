import Imagen from '../models/imagen.model.js';
import * as fs from 'fs';
import path from 'path';

// Función para obtener imágenes
export const getImagenes = async (req, res) => {
  try {
    const { id } = req.params;
    const rows = id ? await Imagen.findById(id) : await Imagen.find();

    if (!rows) {
      return res.status(404).json({ status: false, errors: ['Imagen no encontrada'] });
    }

    return res.status(200).json({ status: true, data: rows });
  } catch (error) {
    console.error("Error al obtener imágenes:", error);
    return res.status(500).json({ status: false, errors: [error.message] });
  }
};

// Función para guardar imágenes
export const saveImagenes = async (req, res) => {
  try {
    console.log('Archivo recibido:', req.file); // Log para depuración
    const { nombre, texto } = req.body;
    const validacion = validar(nombre, texto, req.file, 'Y');
    if (validacion.length === 0) {
      const nuevaImagen = await Imagen.create({
        nombre,
        texto,
        imagen: req.file ? '/public/uploads/' + req.file.originalname : null // Guarda la ruta de la imagen con el nombre original
      });

      return res.status(200).json({ status: true, message: 'Se ha publicado' });
    } else {
      return res.status(400).json({ status: false, errors: validacion });
    }
  } catch (error) {
    console.error("Error al guardar imagen:", error);
    return res.status(500).json({ status: false, errors: [error.message] });
  }
};

// Función para actualizar imágenes
export const updateImagenes = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, texto } = req.body;
    let valores = { nombre, texto };

    if (req.file != null) {
      valores.imagen = '/public/uploads/' + req.file.originalname; // Usar el nombre original del archivo
    }

    const validacion = validar(nombre, texto, req.file, 'N');
    if (validacion.length === 0) {
      const imagen = await Imagen.findById(id);
      if (imagen && req.file != null) {
        // Elimina la imagen antigua
        try {
          const oldImagePath = path.join(__dirname, '../public/uploads', path.basename(imagen.imagen));
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        } catch (error) {
          console.error("Error eliminando el archivo:", error.message);
        }
      }
      
      await Imagen.findByIdAndUpdate(id, valores);
      return res.status(200).json({ status: true, message: 'Imagen actualizada' });
    } else {
      return res.status(400).json({ status: false, errors: validacion });
    }
  } catch (error) {
    console.error("Error al actualizar imagen:", error);
    return res.status(500).json({ status: false, errors: [error.message] });
  }
};

// Función para eliminar imágenes
export const deleteImagen = async (req, res) => {
  try {
    const { id } = req.params;
    const imagen = await Imagen.findById(id);

    if (imagen) {
      // Elimina la imagen del sistema de archivos
      try {
        const imagePath = path.join(__dirname, '../public/uploads', path.basename(imagen.imagen));
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      } catch (error) {
        console.error("Error eliminando el archivo:", error.message);
      }
    }

    await Imagen.findByIdAndDelete(id);
    return res.status(200).json({ status: true, message: 'Imagen eliminada' });
  } catch (error) {
    console.error("Error al eliminar imagen:", error);
    return res.status(500).json({ status: false, errors: [error.message] });
  }
};

// Función de validación
const validar = (nombre, texto, img, seValida) => {
  let errors = [];
  if (!nombre || nombre.trim() === '') {
    errors.push('El nombre no debe estar vacío');
  }
  if (!texto || texto.trim() === '') {
    errors.push('El texto no debe estar vacío');
  }

  if (seValida === 'Y' && (!img || !(img.mimetype === 'image/jpeg' || img.mimetype === 'image/png' || img.mimetype === 'image/jpg'))) {
    errors.push('Selecciona un archivo en formato jpg o png');
  }
  
  // Elimina el archivo solo si hay errores y el archivo está presente
  if (errors.length > 0 && img) {
    try {
      fs.unlinkSync(path.join(__dirname, '../public/uploads', img.originalname)); // Asegúrate de que la ruta sea correcta
    } catch (error) {
      console.error("Error eliminando el archivo:", error.message);
    }
  }
  return errors;
};
