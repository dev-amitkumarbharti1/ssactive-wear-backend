import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config";
import { User } from "../../user/database/controllers/user";

interface DecodedToken extends JwtPayload {
    _id: string;
    email: string;
    role?: string;
    iat?: number;
    exp?: number;
}

declare global {
    namespace Express {
        export interface Request {
            user: DecodedToken;
        }
    }
}

const user = new User();

export const isAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.header("authorization")?.split(" ")[1];
        if (!token) return res.status(403).send({ success: false, message: "User is not authorized" });
        const decoded = jwt.verify(token, config.JWT_SECRETE_KEY) as DecodedToken;
        if (decoded._id) {
            const isValidUser = await user.getUserByEmail(decoded.email);
            if (isValidUser) {
                req.user = decoded;
                next();
            } else {
                return res
                    .status(403)
                    .send({ success: false, message: "User is not authorized" });
            }
        }
    } catch (err: any) {
        if (err.response) {
            const errorResponse: any = err;
            res
                .status(errorResponse.response.status)
                .send({ success: false, data: errorResponse.response.data });
        } else {
            res
                .status(403)
                .send({ success: false, message: "Token is expired or invalid token" });
        }
    }
};
