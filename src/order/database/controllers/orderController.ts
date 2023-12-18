import { OrderModel } from "../models/orders"

interface IObject {
    [key: string]: any
}
export class OrderController {

    addOrder = async (merchantId: string, shopifyOrderData: IObject) => {
        const shopifyOrderId = shopifyOrderData.id;
        const order = await OrderModel.findOne({ merchantId, shopifyOrderId });
        let isCreated = false;
        let isUpdated = false;
        if (order) {
            order.shopifyOrderData = shopifyOrderData;
            order.save();
            isUpdated = true;
        } else {
            const insertResult = await OrderModel.create({
                merchantId: merchantId,
                shopifyOrderId: shopifyOrderId,
                isCreated: false,
                shopifyOrderData: shopifyOrderData
            });
            console.log(insertResult);
            isCreated = true;
        }
        return { isCreated, isUpdated };
    }


    updateSupplierData = async (merchantId: string, shopifyOrderId: number, suplierData: IObject[]) => {
        const order = await OrderModel.findOne({ merchantId: merchantId, shopifyOrderId: shopifyOrderId });
        if (order) {
            order.suplierData = suplierData;
            order.suppierOrderNumber = suplierData[0].orderNumber;
            order.isCreated = true;
            order.save();
            return true;
        }
        return false;
    }


    orders = async (merchantId: string, query: { [key: string]: any }, page: number, perPage: number) => {
        const queryObj: IObject = {};
        queryObj.merchantId = merchantId;
        const orders = await OrderModel.find(queryObj).skip((perPage * page) - perPage).limit(perPage);
        return orders;
    }


    updateTrackingInfo = async (merchantId: string, suppierOrderNumber: string, trackingData: { [key: string]: any }[]) => {
        const updateResult = await OrderModel.updateOne({ merchantId: merchantId, suppierOrderNumber: suppierOrderNumber }, { $set: { isTrackingRecieved: true, trackingInfo: trackingData } });
        return updateResult;
    }

    getOrder = async (merchantId: string, orderId: string) => {
        const order = await OrderModel.findOne({ merchantId: merchantId, suppierOrderNumber: orderId });
        return order;
    }


    getOrdersTofullfill = async (merchantId: string) => {
        const orders = await OrderModel.find({ isTrackingRecieved: false, merchantId: merchantId }).select({ suppierOrderNumber: 1, _id: 0 });
        return orders;
    }
}