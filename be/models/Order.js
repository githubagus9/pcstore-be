import { Sequelize } from "sequelize";
import db from "../config/db.js"; // Pastikan path ke db.js sudah benar
import User from "./User.js";
import PcBuild from "./PcBuild.js"; // Mengimpor model PcBuild, bukan Product

const { DataTypes } = Sequelize;

// Model Utama untuk Pesanan (Header Pesanan)
const Order = db.define("orders", { // Nama tabel: 'orders'
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User, // Mengacu ke model User
      key: 'id'
    }
  },
  recipientName: { // Nama penerima pesanan
    type: DataTypes.STRING,
    allowNull: false
  },
  deliveryAddress: { // Alamat lengkap pengiriman
    type: DataTypes.TEXT,
    allowNull: false
  },
  phoneNumber: { // Menambahkan nomor telepon
    type: DataTypes.STRING,
    allowNull: false
  },
  totalAmount: { // Total pembayaran akhir untuk seluruh pesanan
    type: DataTypes.DOUBLE, // Gunakan DOUBLE untuk mendukung nilai desimal
    allowNull: false
  },
  status: { // Status pesanan (misal: pending, confirmed, shipped, completed, cancelled)
    type: DataTypes.STRING,
    defaultValue: "pending" // Status default saat pesanan dibuat
  },
  orderDate: { // Tanggal dan waktu pesanan dibuat
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW // Otomatis terisi waktu saat ini
  }
}, {
  freezeTableName: true // Menjaga nama tabel tetap 'orders' (tidak diubah Sequelize menjadi 'order')
});

// Model untuk Item-item di dalam Pesanan (Detail Pesanan)
const OrderItem = db.define("order_items", { // Nama tabel: 'order_items'
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Order, // Mengacu ke model Order (pesanan utama)
      key: 'id'
    }
  },
  pcBuildId: { // Mengubah dari productId menjadi pcBuildId
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: PcBuild, // Mengacu ke model PcBuild (rakitan PC)
      key: 'id'
    }
  },
  pcBuildName: { // Simpan nama PC Rakitan saat pesanan dibuat (untuk histori, jika nama di PcBuild berubah)
    type: DataTypes.STRING,
    allowNull: false
  },
  pcBuildImageUrl: { // Simpan URL gambar PC Rakitan (untuk histori)
    type: DataTypes.STRING,
    allowNull: true // Bisa null jika tidak ada gambar
  },
  pricePerUnit: { // Harga PC Rakitan per unit saat pesanan dibuat (penting untuk histori transaksi!)
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  quantity: { // Jumlah unit PC Rakitan yang dipesan
    type: DataTypes.INTEGER,
    allowNull: false
  },
  subtotal: { // Subtotal untuk baris item ini (pricePerUnit * quantity)
    type: DataTypes.DOUBLE,
    allowNull: false
  }
}, {
  freezeTableName: true // Menjaga nama tabel tetap 'order_items'
});

// --- Definisi Relasi Antar Model ---

// Satu User dapat memiliki banyak Order
User.hasMany(Order, { foreignKey: "userId" });
// Satu Order dimiliki oleh satu User
Order.belongsTo(User, { foreignKey: "userId" });

// Satu Order dapat memiliki banyak OrderItem
// 'as: items' penting untuk eager loading (include: [{ model: OrderItem, as: 'items' }])
Order.hasMany(OrderItem, { foreignKey: "orderId", as: 'items', onDelete: 'CASCADE' });
// Satu OrderItem dimiliki oleh satu Order
OrderItem.belongsTo(Order, { foreignKey: "orderId" });

// Satu PcBuild dapat ada di banyak OrderItem (opsional, untuk melacak penjualan PcBuild)
PcBuild.hasMany(OrderItem, { foreignKey: "pcBuildId" });
// Satu OrderItem berasal dari satu PcBuild
OrderItem.belongsTo(PcBuild, { foreignKey: "pcBuildId" });

// Sinkronkan model dengan database (biasanya dilakukan di index.js atau app.js)
// await db.sync();

// Export kedua model agar bisa digunakan di bagian lain aplikasi (controller, dll.)
export { Order, OrderItem };