// controllers/authController.js
import User from "../models/User.js"; // Mengimpor model User
import bcrypt from "bcrypt"; // Untuk hashing password
import jwt from "jsonwebtoken"; // Untuk membuat JSON Web Token

/**
 * @desc Mendaftarkan pengguna baru
 * @route POST /api/register
 * @access Public
 */
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Cek apakah email sudah terdaftar
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "Email sudah terdaftar. Silakan gunakan email lain." });
    }

    // Hash password sebelum menyimpan ke database
    const salt = await bcrypt.genSalt(10); // Menghasilkan salt
    const hashedPassword = await bcrypt.hash(password, salt); // Hashing password dengan salt

    // Membuat user baru di database
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword
      // 'role' akan otomatis diisi 'user' oleh defaultValue di model User.js
    });

    // Mengirim respons sukses dengan data user yang baru dibuat
    res.status(201).json({
      message: "Registrasi berhasil! Selamat datang di Toko Rakitan PC.",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (err) {
    console.error("Error during user registration:", err); // Log error untuk debugging
    res.status(400).json({ error: "Registrasi gagal. " + err.message }); // Mengirim respons error
  }
};

/**
 * @desc Melakukan login pengguna
 * @route POST /api/login
 * @access Public
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Mencari user berdasarkan email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "Email atau password salah." }); // Hindari memberi tahu user mana yang salah untuk keamanan
    }

    // Membandingkan password yang dimasukkan dengan password yang di-hash di database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Email atau password salah." }); // Hindari memberi tahu user mana yang salah untuk keamanan
    }

    // Membuat JSON Web Token (JWT)
    // Payload JWT berisi id user dan role-nya
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.ACCESS_TOKEN_SECRET, // Secret key dari variabel lingkungan
      { expiresIn: "1d" } // Token akan kadaluarsa dalam 1 hari
    );

    // Mengirim respons sukses dengan token dan data user
    res.json({
      message: "Login berhasil!",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role // Pastikan role juga dikirim di respons login
      }
    });
  } catch (err) {
    console.error("Error during user login:", err); // Log error untuk debugging
    res.status(500).json({ error: "Login gagal. " + err.message }); // Mengirim respons error
  }
};