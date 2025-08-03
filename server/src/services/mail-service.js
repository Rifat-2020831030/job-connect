const nodemailer = require("nodemailer");

const mailer = async (receiver, sub, msg = "", html = "") => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: true,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    return new Promise((resolve) => {
      transporter.sendMail(
        {
          from: {
            name: "ChakriLagbe",
            address: process.env.MAIL_USER,
          },
          to: receiver,
          subject: sub,
          text: msg,
          html: html,
        },
        (error, _info) => {
          if (error) {
            console.error("Email sending error:", error);
            resolve(false);
            return;
          }
          if (_info && _info.rejected && _info.rejected.length > 0) {
            console.error("Email sending failed:", _info.rejected);
            resolve(false);
            return;
          }
          console.log("Email sent successfully to:", receiver);
          resolve(true);
        }
      );
    });
  } catch (error) {
    console.error("Error in mailer function:", error);
    return false;
  }
};

module.exports = mailer;
