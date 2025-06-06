import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

// Inisialisasi koneksi database MySQL menggunakan Sequelize
// Menggunakan variabel lingkungan untuk kredensial database agar lebih aman dan fleksibel
const db = new Sequelize(
  process.env.DB_NAME,       // Nama database (misal: 'pc_rakitan_db')
  process.env.DB_USER,       // Username database (misal: 'root' atau 'pc_user')
  process.env.DB_PASSWORD,   // Password database
  {
    host: process.env.DB_HOST, // Host database (misal: 'localhost' atau IP address)
    dialect: "mysql",          // Dialek database yang digunakan
    // Tambahan konfigurasi jika diperlukan, contoh:
    // logging: false, // Matikan logging SQL ke konsol
    // pool: {
    //   max: 5,
    //   min: 0,
    //   acquire: 30000,
    //   idle: 10000
    // }
  }
);

// Export objek koneksi database agar bisa digunakan di bagian lain aplikasi
export default db;