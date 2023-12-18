import amqplib from "amqplib"

export class Rmq {

    constructor() {

    }

    createConnection = async () => {
        try {
            const conn = await amqplib.connect('amqp://localhost');
            return conn;
        } catch (e) {

        }

    }

    sendMessage = async (queueName: string, message: any) => {
        const conn = await this.createConnection();
        if (conn) {
            const channel = await conn.createChannel();
            await channel.assertQueue(queueName, { durable: false });
            channel.sendToQueue(queueName, Buffer.from(message));
            await channel.close();
        }

    }

    createConsumer = async (queueName: string) => {
        const conn = await this.createConnection();
        if (conn) {
            const channel = await conn.createChannel();
            await channel.assertQueue(queueName, { durable: false });
            return channel;
        }
    }

}