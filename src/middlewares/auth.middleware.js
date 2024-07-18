import jwt from "jsonwebtoken";
import { TOKEN_SECRET } from "../config.js";

// Mantener una lista de tokens activos en memoria (para demostración, usar una base de datos en producción)
const activeTokens = new Set();

export const auth = (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    if (!activeTokens.has(token)) {
      return res.status(401).json({ message: "Token is not valid" });
    }

    jwt.verify(token, TOKEN_SECRET, (error, user) => {
      if (error) {
        return res.status(401).json({ message: "Token is not valid" });
      }
      req.user = user;
      next();
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const addActiveToken = (token) => {
  activeTokens.add(token);
};

export const removeActiveToken = (token) => {
  activeTokens.delete(token);
};
