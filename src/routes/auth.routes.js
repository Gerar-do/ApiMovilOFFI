import { Router } from "express";
import {
  login,
  logout,
  register,
  verifyToken,
  getUser,
  getUsers,
  updateUser,
  deleteUser,
} from "../controllers/auth.controller.js";
import { validateSchema } from "../middlewares/validator.middleware.js";
import { loginSchema, registerSchema } from "../schemas/auth.schema.js";
import { auth } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";
import upload from "../middlewares/upload.middleware.js";
import { getImagenes, saveImagenes, updateImagenes, deleteImagen } from '../controllers/publications.controller.js';
import subirImagen from '../middlewares/Storage.js';

const router = Router();

router.post("/register", (req, res, next) => {
  upload.single('profilePicture')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, validateSchema(registerSchema), register);

router.post("/login", validateSchema(loginSchema), login);
router.get("/verify", verifyToken);
router.post("/logout", logout);

// Protect routes with roles
router.get("/users", auth, authorizeRoles("admin"), getUsers);
router.get("/users/:id", auth, authorizeRoles("admin", "doctor"), getUser);
router.put("/users/:id", auth, authorizeRoles("admin"), updateUser);
router.delete("/users/:id", auth, authorizeRoles("admin"), deleteUser);

// Rutas de publicaciones
router.get('/imagenes/all', getImagenes);
router.get('/imagenes/:id', getImagenes);
router.post('/imagenes', auth, authorizeRoles("doctor"), subirImagen.single('imagen'), saveImagenes);
router.put('/imagenes/:id', auth, authorizeRoles("admin"), subirImagen.single('imagen'), updateImagenes);
router.delete('/imagenes/:id', auth, authorizeRoles("admin"), deleteImagen);

export default router;
