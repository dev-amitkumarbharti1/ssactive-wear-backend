import winston from 'winston';
import fs from 'fs';
import path from 'path';

// Define a log format
const logFormat = winston.format.printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level.toUpperCase()}] - ${message}`;
});

export class Logger {
    private logger: winston.Logger;

    constructor() {
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                logFormat
            ),
            transports: [
                new winston.transports.Console(),
            ],
        });
    }

    private createDirectoryIfNeeded(directory: string): void {
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true });
        }
    }

    static formatDate = () => {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-based
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    public formatDate = () => {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-based
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    log(folderName: string, fileName: string, data: string): void {
        const logDir = path.join(__dirname, '../../../../logs', `${folderName}`);
        const logPath = path.join(logDir, `${fileName}.log`);
        this.createDirectoryIfNeeded(logDir);
        this.logger.add(new winston.transports.File({ filename: logPath }));
        this.logger.info(data);
        this.logger.remove(winston.transports.File);
    }
}


