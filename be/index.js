import express from "express";
import dotenv from "dotenv";
import cors from "cors"; // Import cors untuk menangani masalah CORS
import db from "./config/db.js"; // Import koneksi database
import User from "./models/User.js"; // Import model User
import PcBuild from "./models/PcBuild.js"; // Import model PcBuild
import { Order, OrderItem } from "./models/Order.js"; // Import model Order dan OrderItem

// Import rute-rute aplikasi
import authRoutes from "./routes/authRoutes.js";
import pcRoutes from "./routes/pcRoutes.js"; // Pastikan ini mengarah ke pcRoutes.js
import orderRoutes from "./routes/orderRoutes.js";

// Muat variabel lingkungan dari file .env
dotenv.config();

const app = express(); // Inisialisasi aplikasi Express
const PORT = process.env.PORT || 5000; // Port untuk server, ambil dari .env atau default 5000

// Middleware
app.use(cors()); // Aktifkan CORS untuk mengizinkan permintaan dari domain lain (misal: aplikasi Flutter Anda)
app.use(express.json()); // Mengizinkan Express untuk membaca body request dalam format JSON

// --- Fungsi untuk Uji Koneksi Database & Sinkronisasi Model ---
// PENTING: Definisi fungsi ini harus ada SEBELUM pemanggilannya
const connectDBAndSyncModels = async () => {
  try {
    await db.authenticate(); // Coba autentikasi ke database
    console.log("Koneksi database berhasil!");

    // Sinkronkan semua model dengan database
    // HATI-HATI! `alter: true` akan mencoba mengubah tabel yang ada agar sesuai dengan model.
    // Ini bagus untuk pengembangan karena akan menambahkan kolom baru atau mengubah tipe data tanpa menghapus tabel.
    // `force: true` akan MENGHAPUS tabel yang sudah ada lalu membuat ulang.
    // Gunakan `force: true` HANYA di lingkungan pengembangan jika Anda ingin reset database.
    await User.sync({ alter: true });
    await PcBuild.sync({ alter: true });
    await Order.sync({ alter: true });
    await OrderItem.sync({ alter: true });

    console.log("Semua model berhasil disinkronkan dengan database.");
  } catch (error) {
    console.error("Gagal terhubung ke database atau sinkronisasi model:", error);
    process.exit(1); // Keluar dari proses jika ada error fatal
  }
};

// --- Panggil fungsi koneksi dan sinkronisasi database ---
// PENTING: Panggilan fungsi ini harus ada SETELAH definisinya.
connectDBAndSyncModels();

// --- Definisi Rute API ---
// Semua rute akan diawali dengan '/api'
app.use("/api", authRoutes); // Rute untuk autentikasi (register, login)
app.use("/api", pcRoutes); // Rute untuk manajemen PC Rakitan
app.use("/api", orderRoutes); // Rute untuk manajemen pesanan

// Rute dasar untuk menguji server
app.get("/", (req, res) => {
  res.send("Selamat datang di API Toko Rakitan PC!");
});

// Mulai server Express
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
  console.log(`Aplikasi siap diakses di http://localhost:${PORT}`);
});