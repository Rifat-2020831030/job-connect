import nodemailer from "nodemailer";
import { logger } from "../utils/logger.js";

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
            logger.error({ error, receiver }, "Email sending error");
            resolve(false);
            return;
          }
          if (_info && _info.rejected && _info.rejected.length > 0) {
            logger.error({ rejected: _info.rejected, receiver }, "Email sending failed");
            resolve(false);
            return;
          }
          logger.info({ receiver }, "Email sent successfully");
          resolve(true);
        }
      );
    });
  } catch (error) {
    logger.error({ error, receiver }, "Error in mailer function");
    return false;
  }
};

export default mailer;
