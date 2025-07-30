import nodemailer from "nodemailer";

import { getDB } from "../db/database.js";

export const sendMail = async (req, res) => {
    const transport = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        secure: true,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    })

    transport.sendMail({
        from: `ChakriLagbe <${process.env.MAIL_USER}>`,
        to: ["hasan1096@protonmail.com"],
        bcc: ["hasan151872@gmail.com"],
        subject: "Test Mail",
        text: "This is a test mail from chakriLagbe",
        html: "<h1>This is a test mail from chakriLagbe</h1>"
    }, (err, info) => {
        if (err) {
            console.error("Error sending email:", err);
            return res.status(500).json({ error: "Failed to send email" });
        }
        return res.status(200).json({ message: "Email sent successfully", info });
    });
};
