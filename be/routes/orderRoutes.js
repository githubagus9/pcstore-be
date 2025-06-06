import express from "express";
import {
  getAllOrders,
  createOrder,
  updateOrder,
  deleteOrder,
} from "../controllers/orderController.js"; // Mengimpor fungsi controller untuk pesanan
import { verifyToken } from "../middleware/authMiddleware.js"; // Mengimpor middleware verifyToken untuk otentikasi

const router = express.Router(); // Membuat instance router Express

/**
 * @desc Rute untuk mendapatkan semua pesanan pengguna.
 * @route GET /api/orders
 * @access Private (membutuhkan otentikasi token)
 */
router.get("/orders", verifyToken, getAllOrders);

/**
 * @desc Rute untuk membuat pesanan baru.
 * @route POST /api/orders
 * @access Private (membutuhkan otentikasi token)
 */
router.post("/orders", verifyToken, createOrder);

/**
 * @desc Rute untuk memperbarui status pesanan berdasarkan ID.
 * @route PATCH /api/orders/:id
 * @access Private (membutuhkan otentikasi token)
 */
router.patch("/orders/:id", verifyToken, updateOrder);

/**
 * @desc Rute untuk menghapus pesanan berdasarkan ID.
 * @route DELETE /api/orders/:id
 * @access Private (membutuhkan otentikasi token)
 */
router.delete("/orders/:id", verifyToken, deleteOrder);

export default router; // Mengekspor router untuk digunakan di file utama aplikasi
