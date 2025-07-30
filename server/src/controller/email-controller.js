import crypto from "crypto";

import { getDB } from "../db/database.js";
import mailer from "../services/mail-service.js";

export const subscribeEmail = async (req, res) => {
  try {
    const db = await getDB();
    const {
      email,
      ipAddress = "unknown",
      latlong = "unknown",
      country = "unknown",
    } = req.body;

    if (!email) {
      return res.status(400).json({ status: 0, message: "Email is required" });
    }

    // Check if the email already exists and is verified
    const existingEmail = await db
      .collection("emails")
      .findOne({ email: email, verify: true });
    if (existingEmail) {
      return res
        .status(409)
        .json({ status: 0, message: "Email already subscribed" });
    }

    // verification section

    // unverified email check
    const unverifiedEmail = await db
      .collection("emails")
      .findOne({ email: email, verify: false });
    const code = generateCode(6);
    if (!unverifiedEmail) {
      await db
        .collection("emails")
        .insertOne({ email, ipAddress, latlong, country, code, verify: false });
    } 
    else {
      // If the email exists but is not verified, update the code
      await db.collection("emails").updateOne(
        { email: email },
        {
          $set: {
            code: code
          }
        }
      );
    }

    // send verification code to mail
    const subject = "Email Verification Code";
    const msg = `Your verification code is: ${code}`;
    const response = await mailer(email, subject, msg);
    console.log("Email sent response:", response);
    // if (!response) {
    //   return res
    //     .status(500)
    //     .json({ status: 0, message: "Failed to send verification email" });
    // }

    res.status(200).json({
      status: 1,
      message: "Verification Code Sent to Email",
      data: { email },
    });
  } catch (error) {
    console.error("Error subscribing email:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const unsubscribeEmail = async (req, res) => {
  try {
    const db = await getDB();
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ status: 0, message: "Email is required" });
      return;
    }
    const response = await db.collection("emails").findOneAndDelete({ email });
    if (!response.value) {
      return res.status(404).json({ status: 0, message: "Email not found" });
    }
    res.status(200).json({
      status: 1,
      message: "Email unsubscribed successfully",
      data: { email },
    });
  } catch (error) {
    console.error("Error unsubscribing email:", error);
    res.status(500).json({ error: "Error occured while unsubscribing" });
  }
};

export const getEmailList = async (req, res) => {
  try {
    const db = await getDB();
    const emails = await db.collection("emails").find({}.toArray());
    if (emails.length === 0) {
      res.status(404).json({ status: 0, message: "No emails found" });
      return;
    }
    res.status(200).json({
      status: 1,
      message: "Emails fetched successfully",
      data: emails,
    });
  } catch (error) {
    console.error("Error fetching email list:", error);
    res
      .status(500)
      .json({ error: "Error occured while getting list of emails" });
  }
};

const generateCode = (digit) => {
  const code = crypto.randomInt(1000, 100000);
  return code.toString().padStart(digit, "0");
};

export const verifyCode = async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res
      .status(400)
      .json({ status: 0, message: "Email and code are required" });
  }

  try {
    const db = await getDB();
    const emailRecord = await db
      .collection("emails")
      .findOne({ email: email, code: code });

    if (!emailRecord) {
      return res
        .status(404)
        .json({ status: 0, message: "Invalid email or code" });
    }
    if (emailRecord.verify) {
      return res
        .status(400)
        .json({ status: 0, message: "Email already verified" });
    }


    await db
      .collection("emails")
      .updateOne({ email: email }, { $set: { verify: true } });
    return res
      .status(200)
      .json({ status: 1, message: "Email verified successfully" });
  } catch (error) {
    console.error("Error verifying code:", error);
    return res
      .status(500)
      .json({ status: 0, message: "Internal Server Error" });
  }
};
