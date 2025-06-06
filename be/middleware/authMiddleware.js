// middleware/authMiddleware.js
import jwt from "jsonwebtoken";

/**
 * @desc Middleware untuk memverifikasi JWT dari header Authorization
 * @param {Object} req - Objek request Express
 * @param {Object} res - Objek response Express
 * @param {Function} next - Fungsi callback untuk middleware selanjutnya
 */
export const verifyToken = (req, res, next) => {
  // Mengambil header 'Authorization'
  const authHeader = req.headers.authorization;

  // Cek apakah header authorization ada
  if (!authHeader) {
    return res.status(401).json({ message: "Akses ditolak. Token autentikasi tidak ditemukan." });
  }

  // Memisahkan 'Bearer' dari token
  // Contoh: "Bearer <token_anda>"
  const token = authHeader.split(" ")[1];

  // Cek apakah token ada setelah 'Bearer '
  if (!token) {
    return res.status(401).json({ message: "Akses ditolak. Format token tidak valid." });
  }

  // Verifikasi token menggunakan secret key
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    // Jika ada error saat verifikasi (misal: token kadaluarsa, signature tidak valid)
    if (err) {
      console.error("Token verification error:", err); // Log error untuk debugging
      return res.status(403).json({ message: "Token tidak valid atau kadaluarsa. Silakan login kembali." });
    }

    // Jika token valid, tambahkan ID dan role user ke objek request
    // Ini akan memungkinkan controller mengakses ID dan role user yang sedang login
    req.userId = decoded.id;
    req.userRole = decoded.role; // Menyimpan role user dari token

    // Lanjutkan ke middleware atau route handler berikutnya
    next();
  });
};

/**
 * @desc Middleware untuk memeriksa apakah user memiliki role 'admin'
 * @param {Object} req - Objek request Express (harus sudah melewati verifyToken)
 * @param {Object} res - Objek response Express
 * @param {Function} next - Fungsi callback untuk middleware selanjutnya
 */
export const isAdmin = (req, res, next) => {
  // Pastikan req.userRole sudah tersedia dari middleware verifyToken
  if (!req.userRole) {
    return res.status(403).json({ message: "Akses ditolak. Informasi peran tidak tersedia." });
  }

  // Cek apakah role user adalah 'admin'
  if (req.userRole !== 'admin') {
    return res.status(403).json({ message: "Akses ditolak. Anda tidak memiliki izin administrator." });
  }

  // Jika user adalah admin, lanjutkan
  next();
};