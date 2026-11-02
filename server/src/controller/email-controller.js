import crypto from "crypto";
import { ObjectId } from "mongodb";

import { getDB } from "../db/database.js";
import mailer from "../services/mail-service.js";
import { getLocalTime } from "../utils/local-time.js";
import { logger } from "../utils/logger.js";


const unsubscribeEmail = async (req, res) => {
  try {
    const db = await getDB();
    const { id } = req.query;

    if (!id) {
      res.status(400).json({ status: 0, message: "ID is missing" });
      return;
    }
    const response = await db
      .collection("users")
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { 
          $set: { 
            "preferences.categories": null,
            "preferences.workModel": null,
            "preferences.alertTiming": null,
            unsubscribe_at: getLocalTime() 
          } 
        },
        { returnDocument: "after" }
      );

    if (!response) {
      return res.status(404).json({ status: 0, message: "User not found" });
    }
    const unsubscribedEmail = response.value ? response.value.email : response.email;
    res.status(200).json({
      status: 1,
      message: "Unsubscribed from job alerts successfully",
      data: unsubscribedEmail,
    });
  } catch (error) {
    logger.error({ error }, "Error unsubscribing email");
    res.status(500).json({ error: "Error occured while unsubscribing" });
  }
};

const submitUnsubscribeReason = async (req, res) => {
  try {
    const db = await getDB();
    let { id, reason, email } = req.body;

    // Sanitize by aggressively escaping HTML entities
    const escapeHTML = (str) => str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
    reason = reason ? escapeHTML(String(reason)).trim() : '';

    if (!id || !reason) {
      return res.status(400).json({ status: 0, message: "ID and reason are required" });
    }

    await db.collection("unsub_reason").insertOne({
      userId: new ObjectId(id),
      email: email || "unknown",
      reason,
      createdAt: getLocalTime()
    });

    res.status(200).json({ status: 1, message: "Reason submitted successfully" });
  } catch (error) {
    logger.error({ error }, "Error submitting unsubscribe reason");
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const generateCode = (digit) => {
  const code = crypto.randomInt(1000, 100000);
  return code.toString().padStart(digit, "0");
};

const welcomeMailTemplate = () => {
  const ctaUrl = process.env.FRONTEND_URL || "https://chakrilagbe.vercel.app";
  return `
  <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        
        <!-- Welcome Headline -->
        <tr>
            <td align="center" style="padding: 30px 30px 10px 30px;">
                <h1 style="font-family: Arial, Helvetica, sans-serif; font-size: 28px; font-weight: bold; color: #1E293B; margin: 0;">
                    Your registration has been successful!
                </h1>
            </td>
        </tr>
        
        <!-- Welcome Message Body -->
        <tr>
            <td  style="padding: 0 30px 30px 30px;">
                <p style="font-family: Arial, Helvetica, sans-serif; font-size: 16px; color: #475569; line-height: 1.6; margin: 0;">
                    Thank you for registering with us. You will now receive updates on the latest job openings! Hopes you find your dream job soon.
                </p>
            </td>
        </tr>
        
        <tr>
            <td align="center" style="padding: 0 30px 40px 30px;">
                <table border="0" cellspacing="0" cellpadding="0" role="presentation">
                    <tr>
                        <td align="center" style="background-color: #1e3a8a; border-radius: 6px;">
                            <a href="${ctaUrl}" target="_blank" style="font-family: Arial, Helvetica, sans-serif; font-size: 16px; font-weight: bold; color: #ffffff; text-decoration: none; padding: 15px 35px; border: 1px solid #3b82f6; border-radius: 6px; display: inline-block;">
                                Explore Current Openings
                            </a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
  `;
};

const verifyCode = async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res
      .status(400)
      .json({ status: 0, message: "Email and code are required" });
  }

  try {
    const db = await getDB();
    const currentTime = new Date().getTime();
    const emailRecord = await db
      .collection("emails")
      .findOne({ email: email, code: code, exp: { $gt: currentTime } });

    if (!emailRecord) {
      return res.status(404).json({
        status: 0,
        message: "Invalid email or code. Or the code has expired!",
      });
    }
    if (emailRecord.verify) {
      return res
        .status(400)
        .json({ status: 0, message: "Email already verified" });
    }
    const response = await db.collection("emails").updateOne(
      { email: email },
      {
        $set: {
          verify: true,
          code: null,
          exp: null,
          subscriptionTime: getLocalTime(),
        },
      }
    );
    if (response.acknowledged) {
      res
        .status(200)
        .json({ status: 1, message: "Email verified successfully" });
    } else {
      res.status(500).json({
        status: 0,
        message: "Failed to verify email. Please try again later.",
      });
    }

    // send welcome mail (async operation after response)
    setImmediate(async () => {
      try {
        const html = welcomeMailTemplate();
        await mailer(email, "Greetings from ChakriLagbe", "", html);
        logger.info({ email }, "Welcome email sent");
      } catch (error) {
        logger.error({ error, email }, "Error sending welcome email");
      }
    });
  } catch (error) {
    logger.error({ error }, "Error verifying code");
    return res.status(500).json({ status: 0, message: "Error verifying code" });
  }
};

export {
  unsubscribeEmail,
  submitUnsubscribeReason,
  verifyCode,
};
