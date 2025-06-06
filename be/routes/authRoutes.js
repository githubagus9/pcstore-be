import express from "express";
import { register, login } from "../controllers/authController.js"; // Mengimpor fungsi controller untuk autentikasi

const router = express.Router(); // Membuat instance router Express

/**
 * @desc Rute untuk pendaftaran pengguna baru.
 * @route POST /api/register
 * @access Public
 */
router.post("/register", register);

/**
 * @desc Rute untuk login pengguna.
 * @route POST /api/login
 * @access Public
 */
router.post("/login", login);

export default router;