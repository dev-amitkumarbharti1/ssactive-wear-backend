import { PriceRule } from "../database/controllers/priceRuleController";
import { Request, Response, NextFunction } from "express";
export class PriceRuleService extends PriceRule {

    constructor() {
        super();
    }

    createPriceRule = async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user._id;
        console.log(userId);
        console.log(req.body);
        const response = await this.addPriceRule(userId, req.body);
        console.log(response);
        res.send({ success: true, message: "Price Rules created" });
    }

    getPriceRule = async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user._id;
        const rules = await this.getRules(userId);
        res.send({ success: true, message: "Price Rules", rules });
    }

    updatePriceRule = async (req: Request, res: Response, next: NextFunction) => {
        const id = req.params.id;
        const userId = req.user._id;
        const updateResult = await this.updateRule(userId, id, req.body);
        if (updateResult) {
            return res.send({ success: true, message: "Price Rule updated" });
        }
        return res.send({ success: false, message: "Not Price Rule found" });

    }

    deleteRule = async (req: Request, res: Response, next: NextFunction) => {
        const id = req.params.id;
        const userId = req.user._id;
        const result = await this.deleteRules(userId, id);
        if (result) {
            return res.send({ success: true, message: "Price Rule deleted" });
        }
        return res.send({ success: false, message: "Not Price Rule found" });

    }

}