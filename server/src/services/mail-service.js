import nodemailer from "nodemailer";

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
        if(_info.rejected.length > 0) {
          console.error("Email sending failed:", _info.rejected);
          return false;
        }
        return true;
      }
    );
  } catch (error) {
    console.error("Error in mailer function:", error);
    return false;
  }
};

export default mailer;
