const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLEINT_SECRET,
  process.env.REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

const sendEmail = async (options) => {
  try {
    const accessToken = await oAuth2Client.getAccessToken();
    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "autobizotp@gmail.com",
        clientId: process.env.CLIENT_ID,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    const mailOptions = {
      from: `${process.env.SMTP_FROM} <${process.env.SMTP_FROM_EMAIL}>`,
      to: options.email, // list of receivers
      subject: options.subject, // Subject line
      html: options.message, // html body
    };

    const result = await transport.sendMail(mailOptions);

    return result;
  } catch (error) {
    return error;
  }
};

//  // async..await is not allowed in global scope, must use a wrapper
// const sendEmail = async (options) => {
//   // create reusable transporter object using the default SMTP transport
//   let transporter = nodemailer.createTransport({
//     host: process.env.SMTP_HOST,
//     port: process.env.SMTP_PORT,
//     secure: true, // true for 465, false for other ports
//     auth: {
//       user: process.env.SMTP_USERNAME, // generated ethereal user
//       pass: process.env.SMTP_PASSWORD, // generated ethereal password
//     },
//   });

//   // send mail with defined transport object
//   let info = await transporter.sendMail({
//     from: `${process.env.SMTP_FROM} <${process.env.SMTP_FROM_EMAIL}>`, // sender address
//     to: options.email, // list of receivers
//     subject: options.subject, // Subject line
//     html: options.message, // html body
//   });

//   console.log("Message sent: %s", info.messageId);
//   console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

//   return info;
// };

module.exports = sendEmail;
