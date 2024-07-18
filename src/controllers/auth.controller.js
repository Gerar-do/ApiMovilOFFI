import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { TOKEN_SECRET } from "../config.js";
import { createAccessToken } from "../libs/jwt.js";
import { addActiveToken, removeActiveToken } from "../middlewares/auth.middleware.js";

export const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const profilePicture = req.file ? req.file.path : null;

    const userFound = await User.findOne({ email });

    if (userFound)
      return res.status(400).json({
        message: ["The email is already in use"],
      });

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: passwordHash,
      role: role || "user",
      profilePicture,
    });

    const userSaved = await newUser.save();

    const token = await createAccessToken({
      id: userSaved._id,
      role: userSaved.role,
    });

    addActiveToken(token);

    res.cookie("token", token, {
      httpOnly: process.env.NODE_ENV !== "development",
      secure: true,
      sameSite: "none",
    });

    res.json({
      id: userSaved._id,
      username: userSaved.username,
      email: userSaved.email,
      role: userSaved.role,
      profilePicture: userSaved.profilePicture,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userFound = await User.findOne({ email });

    if (!userFound)
      return res.status(400).json({
        message: ["The email does not exist"],
      });

    const isMatch = await bcrypt.compare(password, userFound.password);
    if (!isMatch) {
      return res.status(400).json({
        message: ["The password is incorrect"],
      });
    }

    const token = await createAccessToken({
      id: userFound._id,
      username: userFound.username,
      role: userFound.role,
    });

    addActiveToken(token);

    res.cookie("token", token, {
      httpOnly: process.env.NODE_ENV !== "development",
      secure: true,
      sameSite: "none",
    });

    res.json({
      id: userFound._id,
      username: userFound.username,
      email: userFound.email,
      role: userFound.role,
      profilePicture: userFound.profilePicture,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const verifyToken = async (req, res) => {
  const { token } = req.cookies;
  if (!token) return res.send(false);

  jwt.verify(token, TOKEN_SECRET, async (error, user) => {
    if (error) return res.sendStatus(401);

    const userFound = await User.findById(user.id);
    if (!userFound) return res.sendStatus(401);

    return res.json({
      id: userFound._id,
      username: userFound.username,
      email: userFound.email,
      role: userFound.role,
      profilePicture: userFound.profilePicture,
    });
  });
};

export const logout = async (req, res) => {
  try {
    const { token } = req.cookies;
    if (token) {
      removeActiveToken(token);
    }
    res.cookie("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      expires: new Date(0),
    });
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Obtener la lista de usuarios
export const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la lista de usuarios' });
  }
};

// Actualizar la información de un usuario
export const updateUser = async (req, res) => {
  const userId = req.params.id;
  const updatedUserData = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(userId, updatedUserData, { new: true });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el usuario' });
  }
};

// Eliminar un usuario
export const deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    await User.findByIdAndRemove(userId);
    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el usuario' });
  }
};

// Obtener información de un usuario específico
export const getUser = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la información del usuario' });
  }
};
