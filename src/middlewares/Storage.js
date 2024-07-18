import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener __dirname en un módulo ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Verificar y crear el directorio si no existe
const uploadPath = path.join(__dirname, '../../public/uploads');
console.log("Upload Path:", uploadPath);
if (!fs.existsSync(uploadPath)) {
    console.log("Creating directory:", uploadPath);
    fs.mkdirSync(uploadPath, { recursive: true });
}

const guardar = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log("Saving file to:", uploadPath);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        if (file !== null) {
            const ext = file.originalname.split('.').pop();
            const filename = Date.now() + '.' + ext;
            console.log("Generated filename:", filename);
            cb(null, filename);
        }
    }
});

const filtro = (req, file, cb) => {
    if (file && (file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/png')) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const subirImagen = multer({ storage: guardar, fileFilter: filtro });

export default subirImagen;
