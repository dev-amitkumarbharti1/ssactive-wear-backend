import { Request, Response, NextFunction } from "express";
import { OrderController } from "../database/controllers/orderController";
export class OrderService extends OrderController {

    getOrders = async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user._id;
        const queryObj = req.query;
        const page = +(queryObj.page || 1);
        const perPage = +(queryObj.perPage || 50);
        const orders = await this.orders(userId, queryObj, page, perPage);
        res.send({ success: true, message: "Order data fetched", orders });
    }




}