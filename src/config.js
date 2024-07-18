// config.js
export const PORT = process.env.PORT || 4000;
export const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/monitoreo";
export const TOKEN_SECRET = process.env.TOKEN_SECRET || "secret";

// Asegúrate de que FRONTEND_URL tenga la URL correcta
export const FRONTEND_URL = process.env.FRONTEND_URL || "http://10.0.2.2:4000";
