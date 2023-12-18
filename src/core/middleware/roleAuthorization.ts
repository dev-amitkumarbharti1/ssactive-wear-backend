import { Request, Response, NextFunction } from "express";

type Role = "merchant" | "supplier";

interface RoleACL {
    [key: string]: string[];
}

const roleACL: RoleACL = {
    merchant: ["/api/user/install", "/install/callback", "/api/products/import", "/api/user/merchant/setting", "/api/products", "/api/user/settings/price", "/api/user/settings/currency", "/api/user/settings/upload-original-price", "/api/user/settings", "/api/my_catalog_products", "/api/product/add_in_queue", "/api/products/:stockId"],
    supplier: ["/api/user/supplier/setting", "/api/catalog/import"],
};

export const roleAuthorization = (req: Request, res: Response, next: NextFunction) => {
    console.log(req.user)
    const userRole = req.user?.role;
    if (userRole === 'supplier' && !req.user.is_verified_by_admin) {
        return res.status(403).json({ error: "Unauthorized Approval Pending from Admin." });
    }
    if (userRole === 'merchant' && !req.user.is_verified_by_admin) {
        return res.status(403).json({ error: "Unauthorized Approval Pending from Admin." });
    }
    if (userRole === 'merchant' && !req.user.is_verified_by_supplier) {
        return res.status(403).json({ error: "Unauthorized Approval Pending from Supplier." });
    }
    console.log(req.path);
    return next();
    // if (userRole && roleACL[userRole]?.includes(req.path)) {
    //     return next();
    // }

    return res.status(403).json({ error: "Access forbidden." });
};
