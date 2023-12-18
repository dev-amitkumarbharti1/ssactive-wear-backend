// import { Server, Socket } from 'socket.io';

// let io: Server;

// export const initializeSocketIO = (httpServer: any) => {
//     io = new Server(httpServer);
//     io.on('connection', (socket: Socket) => {
//         console.log('A user connected');

//         socket.on('disconnect', () => {
//             console.log('A user disconnected');
//         });
//     });
// };

// export const getIO = () => {
//     if (!io) {
//         throw new Error('Socket.IO has not been initialized');
//     }
//     return io;
// };
