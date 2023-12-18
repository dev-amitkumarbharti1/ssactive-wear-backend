import express from "express";
import { isAuth } from "../../core/middleware/auth";
import { OrderService } from "../services/orderService";

const Router = express.Router();
const orderService = new OrderService();

Router.get("/api/orders", isAuth, orderService.getOrders);


export default Router;