import express from "express";
import {
  getAllPcBuilds,     // Mengubah dari getAllProducts
  createPcBuild,      // Mengubah dari createProduct
  updatePcBuild,      // Mengubah dari updateProduct
  deletePcBuild,      // Mengubah dari deleteProduct
  getPcBuildById      // Mengubah dari getProductById
} from "../controllers/pcController.js"; // Mengimpor fungsi controller untuk PC Rakitan
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js"; // Mengimpor middleware verifyToken dan isAdmin

const router = express.Router(); // Membuat instance router Express

/**
 * @desc Rute untuk mendapatkan semua PC Rakitan yang tersedia.
 * @route GET /api/pcbuilds
 * @access Public
 */
router.get("/pcbuilds", getAllPcBuilds);

/**
 * @desc Rute untuk membuat PC Rakitan baru.
 * @route POST /api/pcbuilds
 * @access Private (Hanya Admin)
 * Membutuhkan otentikasi token dan verifikasi role admin.
 */
router.post("/pcbuilds", verifyToken, isAdmin, createPcBuild);

/**
 * @desc Rute untuk memperbarui detail PC Rakitan berdasarkan ID.
 * @route PUT /api/pcbuilds/:id
 * @access Private (Hanya Admin)
 * Membutuhkan otentikasi token dan verifikasi role admin.
 */
router.put("/pcbuilds/:id", verifyToken, isAdmin, updatePcBuild);

/**
 * @desc Rute untuk menghapus PC Rakitan berdasarkan ID.
 * @route DELETE /api/pcbuilds/:id
 * @access Private (Hanya Admin)
 * Membutuhkan otentikasi token dan verifikasi role admin.
 */
router.delete("/pcbuilds/:id", verifyToken, isAdmin, deletePcBuild);

/**
 * @desc Rute untuk mendapatkan detail PC Rakitan berdasarkan ID.
 * @route GET /api/pcbuilds/:id
 * @access Public
 */
router.get("/pcbuilds/:id", getPcBuildById);

export default router;