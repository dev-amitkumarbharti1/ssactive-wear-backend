import axios from "axios";

export const post = axios.post;
export const get = axios.get;
export const put = axios.put;
export const del = axios.delete;































// import https, { RequestOptions } from 'https';

// Http Get Request
// export const Get = <T>(options: RequestOptions): Promise<T> => {
//     return new Promise((resolve, reject) => {
//         const request = https.request(options, (response) => {
//             let body = '';
//             response.on('data', (chunk) => {
//                 body += chunk;
//             });
//             response.on('end', () => {
//                 resolve(JSON.parse(body) as T);
//             });
//         });

//         request.on('error', (error) => {
//             reject(error);
//         });
//         request.end();
//     });
// };



// Http Post Request
// export const Request = <T>(options: RequestOptions, data: string): Promise<T> => {
//     return new Promise((resolve, reject) => {
//         const request = https.request(options, (response) => {
//             let body = '';
//             response.on('data', (chunk) => {
//                 body += chunk;
//             });
//             response.on('end', () => {
//                 resolve(JSON.parse(body) as T);
//             });
//         });

//         request.on('error', (error) => {
//             reject(error);
//         });

//         request.write(data);
//         request.end();
//     });
// };