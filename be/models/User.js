// models/User.js
import { Sequelize } from "sequelize";
import db from "../config/db.js"; // Pastikan path ke db.js sudah benar

const { DataTypes } = Sequelize;

// Definisi Model User
const User = db.define("users", { // Nama tabel: 'users' (plural)
  name: { // Nama pengguna (misal: "Budi Santoso")
    type: DataTypes.STRING,
    allowNull: false // Tidak boleh kosong
  },
  email: { // Alamat email pengguna (digunakan untuk login)
    type: DataTypes.STRING,
    unique: true, // Email harus unik
    allowNull: false, // Tidak boleh kosong
    validate: {
      isEmail: true // Memastikan format adalah email yang valid
    }
  },
  password: { // Password pengguna (akan disimpan dalam bentuk hash)
    type: DataTypes.STRING,
    allowNull: false // Tidak boleh kosong
  },
  role: { // Peran pengguna (misal: "user" atau "admin")
    type: DataTypes.STRING,
    defaultValue: "user" // Peran default adalah "user"
  },
  createdAt: { // Otomatis ditambahkan oleh Sequelize
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: { // Otomatis ditambahkan oleh Sequelize
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  freezeTableName: true // Menjaga nama tabel tetap 'users'
});

// Sinkronkan model dengan database.
// Ini sebaiknya dilakukan di file utama (misal: index.js atau app.js)
// agar sinkronisasi terjadi hanya sekali saat aplikasi dimulai.
// Menjalankannya di setiap model file bisa menyebabkan masalah.
/*
(async () => {
  await db.sync();
  console.log("Tabel 'users' berhasil disinkronkan.");
})();
*/

export default User; // Export model User