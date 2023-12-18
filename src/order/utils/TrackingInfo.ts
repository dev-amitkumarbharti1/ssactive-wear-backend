import { OrderApi } from "../../core/ssactiveware-sdk/orderApi";
import { OrderController } from "../database/controllers/orderController";
import { ShopifyApi } from "../../core/shopify/shopify";

export class TrackingInfo {

    static getAndUpdateTrackingInfo = async (orderId: string, merchantId: string) => {
        try {
            const orderController = new OrderController();
            const trackingInfo: any = await new OrderApi().getTracking(orderId);
            if (trackingInfo.data[0].errors) {
                console.log(trackingInfo.data[0].errors);
                return true;
            }
            const order = await orderController.getOrder(merchantId, orderId);
            if (order) {
                const carrierName = trackingInfo.data[0].carrierName;
                const trackingNumber = trackingInfo.data[0].trackingNumber;
                const shopify = new ShopifyApi(`${process.env.SHOPIFY_STORE_URL}`, `${process.env.SHOPIFY_ACCESS_TOKEN}`).getShopifyObj();
                const fullfillmentData = await shopify.order.fulfillmentOrders(order.shopifyOrderId);
                const fullfillment = {
                    line_items_by_fulfillment_order: [
                        {
                            fulfillment_order_id: fullfillmentData[0].id,
                            fulfillment_order_line_items: fullfillmentData[0].line_items.map((item) => {
                                return { id: item.id, quantity: item.quantity }
                            })
                        }
                    ],
                    tracking_info: {
                        number: trackingNumber,
                        company: carrierName
                    }
                };

                const trackingResponse = await shopify.fulfillment.createV2(fullfillment);
                console.log(trackingResponse);
                const updateResult = await orderController.updateTrackingInfo(merchantId, orderId, trackingInfo);
                console.log(updateResult);
                return true;
            }
        } catch (e: any) {
            console.log(e);
            return false;

        }
    }

}