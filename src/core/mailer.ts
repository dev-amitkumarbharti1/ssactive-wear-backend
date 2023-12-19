import nodemailer, { Transporter } from 'nodemailer';

export const sendMail = async (email: string, subject: string, message: string) => {
    const transporter: Transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'amitkumarbharti@cedcommerce.com',
            pass: 'test',
        },
    });

    try {
        const mailerResult = await transporter.sendMail({
            from: 'amitkumarbharti@cedcommerce.com',
            cc: 'azharahmadkhan@cedcommerce.com',
            to: email,
            subject: subject ? subject : 'No subject',
            html: message,
        });
        return true;
    } catch (error) {
        return false;
    }
};
