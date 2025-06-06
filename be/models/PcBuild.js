// models/PcBuild.js
import { Sequelize } from "sequelize";
import db from "../config/db.js"; // Pastikan path ke db.js sudah benar
import User from "./User.js"; // Import model User untuk relasi

const { DataTypes } = Sequelize;

// Definisi Model PcBuild
const PcBuild = db.define("pc_builds", { // Nama tabel: 'pc_builds' (plural)
  name: { // Nama rakitan PC (misal: "PC Gaming Entry Level")
    type: DataTypes.STRING,
    allowNull: false
  },
  description: { // Deskripsi singkat rakitan PC
    type: DataTypes.TEXT,
    allowNull: true // Bisa null jika deskripsi opsional
  },
  price: { // Harga rakitan PC
    type: DataTypes.DOUBLE, // Menggunakan DOUBLE untuk harga desimal
    allowNull: false
  },
  imageUrl: { // URL gambar rakitan PC
    type: DataTypes.STRING,
    allowNull: true // Bisa null jika tidak ada gambar
  },
  specs: { // Spesifikasi detail rakitan PC (misal: CPU, GPU, RAM, Storage)
    type: DataTypes.TEXT, // Disarankan TEXT atau JSON jika MySQL versi >= 5.7.8 mendukung JSON
    allowNull: true,
    // Jika Anda ingin menyimpan sebagai JSON Object di MySQL 5.7.8+, bisa gunakan:
    // type: DataTypes.JSON,
    // get() {
    //   // Parsing JSON saat mengambil data
    //   const rawValue = this.getDataValue('specs');
    //   return rawValue ? JSON.parse(rawValue) : null;
    // },
    // set(value) {
    //   // Stringify JSON saat menyimpan data
    //   this.setDataValue('specs', JSON.stringify(value));
    // }
  },
  type: { // Tipe rakitan PC (misal: "gaming", "kantor", "desain")
    type: DataTypes.STRING,
    allowNull: true
  },
  // Tambahkan kolom untuk mengaitkan PC Build dengan User yang membuatnya (misal: admin toko)
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true, // Bisa null jika PC Build tidak terikat ke user tertentu atau dibuat oleh sistem
    references: {
      model: User,
      key: 'id'
    }
  }
}, {
  freezeTableName: true // Menjaga nama tabel tetap 'pc_builds'
});

// Definisi Relasi (Opsional, tapi direkomendasikan jika ingin melacak siapa yang membuat PC build)
// Satu User (Admin/Toko) dapat membuat banyak PcBuild
User.hasMany(PcBuild, { foreignKey: "userId" });
// Satu PcBuild dibuat oleh satu User
PcBuild.belongsTo(User, { foreignKey: "userId" });

// Sinkronkan model dengan database (biasanya dilakukan di index.js atau app.js)
// await db.sync();

export default PcBuild; // Export model PcBuild