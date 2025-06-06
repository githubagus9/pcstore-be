import { Order, OrderItem } from "../models/Order.js"; // Mengimpor model Order dan OrderItem
import PcBuild from "../models/PcBuild.js"; // Mengimpor model PcBuild untuk validasi/informasi produk

/**
 * @desc Mendapatkan semua pesanan untuk user yang terautentikasi
 * @route GET /api/orders
 * @access Private
 */
export const getAllOrders = async (req, res) => {
  try {
    // Mencari semua pesanan berdasarkan userId dari token autentikasi
    const orders = await Order.findAll({
      where: { userId: req.userId }, // Filter pesanan berdasarkan ID pengguna yang sedang login
      include: [{
        model: OrderItem,
        as: 'items', // Alias untuk relasi OrderItem
        // Menentukan atribut yang ingin diambil dari OrderItem
        attributes: ['pcBuildId', 'pcBuildName', 'pcBuildImageUrl', 'pricePerUnit', 'quantity', 'subtotal']
      }],
      order: [['orderDate', 'DESC']] // Mengurutkan pesanan dari yang terbaru
    });
    res.json(orders); // Mengirimkan daftar pesanan sebagai respons JSON
  } catch (err) {
    console.error("Error fetching all orders:", err); // Log error untuk debugging
    res.status(500).json({ error: "Gagal mengambil daftar pesanan. " + err.message }); // Mengirim respons error
  }
};

/**
 * @desc Membuat pesanan baru
 * @route POST /api/orders
 * @access Private
 */
export const createOrder = async (req, res) => {
  try {
    // Mendapatkan data pesanan dari body request
    const { recipientName, deliveryAddress, phoneNumber, totalAmount, items } = req.body; // 'items' adalah array dari item PC rakitan yang dipesan

    // Validasi input dasar
    if (!recipientName || !deliveryAddress || !phoneNumber || totalAmount === undefined || !items || items.length === 0) {
      return res.status(400).json({ message: "Data pesanan tidak lengkap. Pastikan semua field terisi." });
    }

    // Pastikan totalAmount yang dikirim dari frontend valid
    let calculatedTotalAmount = 0;
    for (const item of items) {
      // Anda bisa menambahkan validasi di sini untuk memastikan pricePerUnit cocok dengan harga di database
      // Sebagai contoh, mari kita asumsikan harga dari frontend akurat untuk saat ini.
      // Untuk keamanan lebih, ambil harga dari database menggunakan item.pcBuildId
      const pcBuild = await PcBuild.findByPk(item.pcBuildId);
      if (!pcBuild) {
        return res.status(404).json({ message: `PC Rakitan dengan ID ${item.pcBuildId} tidak ditemukan.` });
      }
      if (pcBuild.price !== item.pricePerUnit) {
          // Opsional: Lakukan penyesuaian harga atau kembalikan error
          // Ini sangat penting untuk mencegah manipulasi harga dari client
          console.warn(`Price mismatch for PC Build ID ${item.pcBuildId}. Frontend: ${item.pricePerUnit}, DB: ${pcBuild.price}`);
          // Anda bisa memilih untuk menggunakan harga dari DB atau mengembalikan error
          item.pricePerUnit = pcBuild.price; // Gunakan harga dari DB
      }
      calculatedTotalAmount += item.pricePerUnit * item.quantity;
    }

    // Membandingkan totalAmount dari frontend dengan yang dihitung di backend
    if (Math.abs(calculatedTotalAmount - totalAmount) > 0.01) { // Toleransi kecil untuk floating point
        console.warn(`Total amount mismatch. Frontend: ${totalAmount}, Backend: ${calculatedTotalAmount}`);
        // Anda bisa memilih untuk mengembalikan error atau menggunakan nilai yang dihitung backend
        // Untuk keamanan, disarankan menggunakan yang dihitung backend atau mengembalikan error.
        // return res.status(400).json({ message: "Total jumlah pesanan tidak sesuai. Harap coba lagi." });
    }


    // Buat pesanan utama (header) di tabel 'Orders'
    const newOrder = await Order.create({
      userId: req.userId, // ID pengguna yang memesan (dari token JWT)
      recipientName,
      deliveryAddress,
      phoneNumber, // Menambahkan nomor telepon
      totalAmount: calculatedTotalAmount, // Menggunakan totalAmount yang dihitung di backend
      status: "pending" // Status awal pesanan
    });

    // Buat item-item pesanan (detail) di tabel 'OrderItems'
    const orderItems = items.map(item => ({
      orderId: newOrder.id, // ID pesanan utama yang baru dibuat
      pcBuildId: item.pcBuildId, // ID PC Rakitan dari frontend
      pcBuildName: item.pcBuildName, // Nama PC Rakitan
      pcBuildImageUrl: item.pcBuildImageUrl, // URL gambar PC Rakitan
      pricePerUnit: item.pricePerUnit, // Harga per unit PC Rakitan
      quantity: item.quantity, // Jumlah unit yang dipesan
      subtotal: item.pricePerUnit * item.quantity // Subtotal untuk item ini
    }));

    await OrderItem.bulkCreate(orderItems); // Menyimpan semua item pesanan sekaligus

    // Ambil pesanan lengkap dengan item-itemnya untuk respons
    const orderWithItems = await Order.findByPk(newOrder.id, {
      include: [{
        model: OrderItem,
        as: 'items',
        attributes: ['pcBuildId', 'pcBuildName', 'pcBuildImageUrl', 'pricePerUnit', 'quantity', 'subtotal']
      }]
    });

    res.status(201).json(orderWithItems); // Mengirimkan pesanan yang berhasil dibuat sebagai respons
  } catch (err) {
    console.error("Error creating order:", err); // Log error untuk debugging
    res.status(400).json({ error: "Gagal membuat pesanan. " + err.message }); // Mengirim respons error
  }
};

/**
 * @desc Mengupdate status pesanan
 * @route PUT /api/orders/:id
 * @access Private (Admin atau user yang memiliki pesanan)
 */
export const updateOrder = async (req, res) => {
  try {
    const { status } = req.body; // Hanya izinkan update status dari frontend
    const orderId = req.params.id;

    // Temukan pesanan yang ingin diupdate
    const order = await Order.findByPk(orderId);

    if (!order) {
      return res.status(404).json({ message: "Pesanan tidak ditemukan." });
    }

    // Verifikasi apakah user yang melakukan update adalah pemilik pesanan atau admin
    // Untuk saat ini, kita asumsikan hanya pemilik yang bisa update status (misal: 'cancelled')
    // Jika ada peran admin, Anda perlu menambahkan logika otorisasi di sini.
    if (order.userId !== req.userId) {
        return res.status(403).json({ message: "Anda tidak memiliki izin untuk mengupdate pesanan ini." });
    }

    await order.update({ status }); // Update status pesanan
    res.json({ message: "Status pesanan berhasil diupdate" });
  } catch (err) {
    console.error("Error updating order:", err);
    res.status(400).json({ error: "Gagal mengupdate pesanan. " + err.message });
  }
};

/**
 * @desc Menghapus pesanan
 * @route DELETE /api/orders/:id
 * @access Private (Hanya pemilik pesanan atau Admin)
 */
export const deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.id;

    // Temukan pesanan yang ingin dihapus
    const order = await Order.findByPk(orderId);

    if (!order) {
      return res.status(404).json({ message: "Pesanan tidak ditemukan." });
    }

    // Verifikasi apakah user yang melakukan delete adalah pemilik pesanan atau admin
    if (order.userId !== req.userId) {
        return res.status(403).json({ message: "Anda tidak memiliki izin untuk menghapus pesanan ini." });
    }

    // Saat menghapus Order, pastikan OrderItem juga terhapus.
    // Jika Anda telah mengatur `onDelete: 'CASCADE'` di definisi model Sequelize (Order.js),
    // maka OrderItem akan otomatis terhapus. Jika tidak, Anda perlu menghapusnya secara manual
    // sebelum menghapus Order:
    // await OrderItem.destroy({ where: { orderId: orderId } });
    await order.destroy(); // Menghapus pesanan

    res.json({ message: "Pesanan berhasil dihapus" });
  } catch (err) {
    console.error("Error deleting order:", err);
    res.status(400).json({ error: "Gagal menghapus pesanan. " + err.message });
  }
};