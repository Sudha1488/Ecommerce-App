import express from "express";
import {
  loginController,
  registerController,
  testController,
  forgotPasswordController,
  updateProfileController,
  getOrdersController,
  getAllOrdersController,
  orderStatusController,
  
} from "../controllers/authController.js";
import { isAdmin, requireSign } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerController);
router.post("/login", loginController);
router.get("/test", requireSign, isAdmin, testController);

//Forgot Password || POST
router.post("/forgot-password", forgotPasswordController);

//protected User route auth
router.get("/user-auth", requireSign, (req, res) => {
  res.status(200).send({ ok: true });
});

//protected Admin route auth
router.get("/admin-auth", requireSign, isAdmin, (req, res) => {
  res.status(200).send({ ok: true });
});

//update profile
router.put('/profile',requireSign, updateProfileController);

//orders
router.get('/orders',requireSign, getOrdersController);

//all orders
router.get('/all-orders',requireSign, isAdmin,getAllOrdersController);
export default router;

//order status update
router.put("/order-status/:orderId", requireSign, isAdmin, orderStatusController)
