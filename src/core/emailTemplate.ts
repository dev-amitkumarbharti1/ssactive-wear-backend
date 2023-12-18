export class EmailTemplate {

  frontendurl: string;
  logourl: string;
  constructor() {
    this.frontendurl = "https://elixir.sellernext.com";
    this.logourl = "https://experts.cedcommerce.com/wp-content/uploads/2023/05/logo-300x30.png"
  }

  resetPassword(token: string): string {

    return (
      `<html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>OTP Verification</title>
        </head>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
            <div style="max-width: 600px; margin: auto; padding: 20px; background-color: #ffffff; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); border-radius: 5px; text-align: center;">
                <img src="${this.logourl}" alt="Your Logo" style="margin-bottom: 20px;">
                <h2>OTP Verification</h2>
                <p>Your OTP code is:</p>
                <div style="font-size: 24px; font-weight: bold; color: #007bff;">123456</div>
                <p>This code will expire in 10 minutes.</p>
                <a href="${this.frontendurl}/auth/reset-password/${token}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px; transition: background-color 0.3s;">Verify Now</a>
            </div>
        </body>
        </html>`
    );

  }


  otpSend = (username: string, otp: number) => {
    return (
      `<html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>OTP Verification</title>
      </head>
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: auto; padding: 20px; background-color: #ffffff; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); border-radius: 5px; text-align: center;">
              <img src="${this.logourl}" alt="Your Logo" style="margin-bottom: 20px;">
              <h2>OTP Verification</h2>
              <p>Hi, ${username} Your OTP code is:</p>
              <div style="font-size: 24px; font-weight: bold; color: #007bff;">${otp}</div>
              <p>This code will expire in 10 minutes.</p>
              <a href="#" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px; transition: background-color 0.3s;">Verify Now</a>
          </div>
      </body>
      </html>`
    );
  }
  _header = () => {

  }

}