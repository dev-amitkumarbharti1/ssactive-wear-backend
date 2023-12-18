import express from 'express';
import { isAuth } from '../../core/middleware/auth';
import { asyncErrorHandler } from '../../core/middleware/errorHandler';
import { ProductService } from '../services/productService';
import { VariantService } from '../services/variantService';
import { PriceRuleService } from '../services/priceRuleService';

const ROUTER = express.Router();
const productService = new ProductService();
const variantService = new VariantService();
const priceRuleService = new PriceRuleService();

ROUTER.get("/api/products", isAuth, asyncErrorHandler(productService.getProducts));
ROUTER.get("/api/my_catalog_products", isAuth, asyncErrorHandler(productService.getMyCatalogs));
ROUTER.post("/api/products", isAuth, asyncErrorHandler(productService.createProduct));
ROUTER.post("/api/products/:styleID", isAuth, asyncErrorHandler(productService.createOneProduct));
ROUTER.put("/api/products", isAuth, asyncErrorHandler(productService.updateProduct));
ROUTER.get("/api/products/import", isAuth, asyncErrorHandler(productService.importProduct));
ROUTER.get("/api/products/:styleID/variants", isAuth, asyncErrorHandler(variantService.getVariants));
ROUTER.get("/api/variants/import", isAuth, asyncErrorHandler(productService.importVariants));
ROUTER.get("/api/products/filter-options", isAuth, asyncErrorHandler(productService.getFilterOptions));
ROUTER.post("/api/products/queue/add", isAuth, asyncErrorHandler(productService.addInQueue));
ROUTER.post("/api/products/queue/delete", isAuth, asyncErrorHandler(productService.deleteFromQueue));
ROUTER.get("/api/location/warehouse", isAuth, asyncErrorHandler(variantService.getWarehoues));
ROUTER.get("/api/update-inventory", isAuth, asyncErrorHandler(productService.updateInventory));

ROUTER.post("/api/price_rules", isAuth, asyncErrorHandler(priceRuleService.createPriceRule));
ROUTER.get("/api/price_rules", isAuth, asyncErrorHandler(priceRuleService.getPriceRule));
ROUTER.put("/api/price_rules/:id", isAuth, priceRuleService.addPriceRule);
ROUTER.delete("/api/price_rules/:id", isAuth, priceRuleService.deleteRule);

ROUTER.put("/api/products/add-price-rules", isAuth, asyncErrorHandler(productService.addPriceRule));

export default ROUTER;