import cron from "node-cron";
import { SyncInventory } from "./product/utils/syncInventory";
import { OrderController } from "./order/database/controllers/orderController";
import { TrackingInfo } from "./order/utils/TrackingInfo";



//mark order fullfill and update tracking details to shopify every 1 hours
cron.schedule("0 */1 * * *", async () => {
    const orders = await new OrderController().getOrdersTofullfill("6543a5c45c5e1d619c5a0ceb");
    console.log("updating tracking details to shopify");
    console.log(orders);
    for (let i = 0; i < orders.length; i++) {
        if (orders[i].suppierOrderNumber) {
            const order_id = orders[i].suppierOrderNumber as string;
            const isUpdated = await TrackingInfo.getAndUpdateTrackingInfo(order_id, '6543a5c45c5e1d619c5a0ceb');
            console.log(isUpdated);
        } else {
            continue;
        }
    }

});


//update the inventory every 3 hours
cron.schedule("0 */3 * * *", async () => {
    console.log("updating inventory to shopify");
    await new SyncInventory().updateInventory("6543a5c45c5e1d619c5a0ceb");
});





export default cron;