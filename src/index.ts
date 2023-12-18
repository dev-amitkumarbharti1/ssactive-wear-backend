// import cluster from "cluster";
// import os from "os";
import express, { Request, Response, NextFunction, RequestHandler } from "express";
import connectDB from "./core/dbConnect";
import userApi from "./user/api/user";
import productApi from "./product/api/products";
import { getOrder } from "./order/queueHandlers/sqsOrderReceiver";
import orderApi from "./order/api/orderApi";
import cors from "cors";
import { AxiosError } from 'axios';
import { SqsOrderProcessor } from "./order/queueHandlers/sqsOrderProcessor";
import cronJob from "./cronJob";
// const numCPUs = os.cpus().length;

const app = express();
app.use(express.json());
app.use(cors());
app.get("/", (req: Request, res: Response) => { res.send({ message: "Supplier Api" }); });
app.use(userApi);
app.use(productApi);
app.use(orderApi);
app.use("/test", (req: Request, res: Response) => {
    new SqsOrderProcessor({}).createOrder();
})
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(req);
    res.status(404).send("Invalid api or request");
});

// getOrder();

cronJob;

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.log(err);
    let statusCode = (err as AxiosError).response?.status || 500;
    if (statusCode === 429) {
        return res.status(statusCode).json({ success: false, error: "Rate limit exceeded" });
    } else if (statusCode === 404) {
        return res.status(statusCode).json({ success: false, error: "Resource not found" });
    }

    if ((err as AxiosError).isAxiosError) {
        return res.status(statusCode).json({ success: false, error: "Third-party API error" });
    }

    if (req.path == "/api/user/shop-details") {
        statusCode = 401;
        if (err.message == 'Response code 401 (Unauthorized)') {
            return res.status(401).json({ success: false, message: 'Invalid Access token' });
        }
        if (err.message == "Response code 404 (Not Found)") {
            return res.status(404).json({ success: false, message: 'Invalid Shop Name' });
        }
    }
    const message = err.message;
    res.status(statusCode).json({ success: false, message: message });
});
connectDB(app);

