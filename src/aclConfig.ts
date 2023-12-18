import acl from "express-acl";
import path = require("path");
import { isAuth } from "./core/middleware/auth";

export const aclConfig = (app: any) =>{
    acl.config({
        filename: 'acl.json',
        baseUrl: 'api',
        path: path.join(__dirname, `./core`),
        decodedObjectName: 'user',
        roleSearchPath: 'user.role',
        denyCallback: (res: any) => {
            return res.status(403).json({
                status: 'Access Denied',
                success: false,
                message: 'You are not authorized to access this resource'
            });
        }
    });
    app.use(isAuth);
}

