import mongoose from 'mongoose';
import { Express } from 'express';
import config from './config';

const MONGO_URI = config.DEV_MONGOURI;
const PORT = config.PORT;

console.log(MONGO_URI);

const connectDB = async (app: Express) => {
    mongoose.connect(MONGO_URI).then(() => {
        app.listen(PORT);
        console.log(`Connected to ${PORT}`);
    }).catch(err => {
        console.log(err);
    })
};

export default connectDB;
