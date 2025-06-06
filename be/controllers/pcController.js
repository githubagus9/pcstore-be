// controllers/pcController.js
import PcBuild from "../models/PcBuild.js"; // Mengimpor model PcBuild

/**
 * @desc Mendapatkan semua PC Rakitan yang tersedia
 * @route GET /api/pcbuilds
 * @access Public
 */
export const getAllPcBuilds = async (req, res) => {
  try {
    const pcBuilds = await PcBuild.findAll();
    res.json(pcBuilds); // Mengirimkan daftar PC Rakitan sebagai respons JSON
  } catch (err) {
    console.error("Error fetching all PC builds:", err);
    res.status(500).json({ error: "Gagal mengambil daftar PC Rakitan. " + err.message });
  }
};

/**
 * @desc Membuat PC Rakitan baru
 * @route POST /api/pcbuilds
 * @access Private (Hanya untuk Admin/Toko)
 */
export const createPcBuild = async (req, res) => {
  try {
    // Data untuk PC Rakitan baru dari body request
    const { name, description, price, imageUrl, specs } = req.body; // Menambahkan 'imageUrl' dan 'specs'

    // Validasi input dasar
    if (!name || !description || !price || !imageUrl || !specs) {
      return res.status(400).json({ message: "Data PC Rakitan tidak lengkap. Pastikan semua field terisi." });
    }

    // Membuat entri PC Rakitan baru di database
    const newPcBuild = await PcBuild.create({
      name,
      description,
      price,
      imageUrl, // Menyimpan URL gambar
      specs, // Menyimpan spesifikasi (misal: sebagai JSON string atau TEXT)
      userId: req.userId // Mengaitkan dengan user yang membuat (asumsi user ini adalah Admin/Toko)
    });

    res.status(201).json({
      message: "PC Rakitan berhasil ditambahkan!",
      pcBuild: newPcBuild
    });
  } catch (err) {
    console.error("Error creating PC build:", err);
    res.status(400).json({ error: "Gagal membuat PC Rakitan baru. " + err.message });
  }
};

/**
 * @desc Mengupdate detail PC Rakitan
 * @route PUT /api/pcbuilds/:id
 * @access Private (Hanya untuk Admin/Toko)
 */
export const updatePcBuild = async (req, res) => {
  try {
    const { name, description, price, imageUrl, specs } = req.body;
    const pcBuildId = req.params.id;

    // Data yang akan diupdate
    const updateData = { name, description, price, imageUrl, specs };

    // Update PC Rakitan berdasarkan ID dan userId (untuk memastikan hanya pembuat yang bisa update atau Admin)
    // Jika hanya admin yang bisa update, 'userId: req.userId' bisa dihapus dan diganti dengan verifikasi role admin.
    const [updatedRows] = await PcBuild.update(updateData, {
      where: { id: pcBuildId, userId: req.userId } // Asumsi hanya user yang membuat (admin) yang bisa update
    });

    if (updatedRows === 0) {
      // Jika tidak ada baris yang terupdate, berarti PC Rakitan tidak ditemukan atau user tidak punya izin
      return res.status(404).json({ message: "PC Rakitan tidak ditemukan atau Anda tidak memiliki izin untuk mengupdate." });
    }

    res.json({ message: "Detail PC Rakitan berhasil diupdate" });
  } catch (err) {
    console.error("Error updating PC build:", err);
    res.status(400).json({ error: "Gagal mengupdate PC Rakitan. " + err.message });
  }
};

/**
 * @desc Menghapus PC Rakitan
 * @route DELETE /api/pcbuilds/:id
 * @access Private (Hanya untuk Admin/Toko)
 */
export const deletePcBuild = async (req, res) => {
  try {
    const pcBuildId = req.params.id;

    // Hapus PC Rakitan berdasarkan ID dan userId (untuk memastikan hanya pembuat yang bisa hapus atau Admin)
    const deletedRows = await PcBuild.destroy({
      where: { id: pcBuildId, userId: req.userId } // Asumsi hanya user yang membuat (admin) yang bisa menghapus
    });

    if (deletedRows === 0) {
      // Jika tidak ada baris yang terhapus, berarti PC Rakitan tidak ditemukan atau user tidak punya izin
      return res.status(404).json({ message: "PC Rakitan tidak ditemukan atau Anda tidak memiliki izin untuk menghapus." });
    }

    res.json({ message: "PC Rakitan berhasil dihapus" });
  } catch (err) {
    console.error("Error deleting PC build:", err);
    res.status(400).json({ error: "Gagal menghapus PC Rakitan. " + err.message });
  }
};

/**
 * @desc Mendapatkan detail PC Rakitan berdasarkan ID
 * @route GET /api/pcbuilds/:id
 * @access Public
 */
export const getPcBuildById = async (req, res) => {
  try {
    const pcBuild = await PcBuild.findByPk(req.params.id); // Mencari PC Rakitan berdasarkan Primary Key (ID)
    if (!pcBuild) {
      return res.status(404).json({ message: "PC Rakitan tidak ditemukan." });
    }
    res.json(pcBuild); // Mengirimkan detail PC Rakitan sebagai respons JSON
  } catch (err) {
    console.error("Error fetching PC build by ID:", err);
    res.status(500).json({ error: "Gagal mengambil detail PC Rakitan. " + err.message });
  }
};