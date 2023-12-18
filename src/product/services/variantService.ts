import { Request, Response, NextFunction } from "express";
import { VariantController } from "../database/controllers/variantController";


export class VariantService {

    getVariants = (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user._id;

    }

    getWarehoues = async (req: Request, res: Response, next: NextFunction) => {
        const variant = new VariantController();
        const data = await variant.getWareHouses();
        const warehouseName: { [key: string]: string } = {
            "DS": "Delaware",
            "KS": "Kansas",
            "FL": "Florida",
            "GA": "Georgia",
            "NV": "Nevada",
            "OH": "Ohio",
            "NJ": "New Jersey",
            "IL": "Illinois",
            "TX": "Texas"
        };
        console.log(data);
        const warehouses: { [key: string]: string } = {};
        data.warehouses.forEach((item: string) => {
            warehouses[item] = warehouseName[item]
        });

        console.log(warehouses);
        res.status(200).send(warehouses);
    }

}