import crypto from "crypto";
import { ObjectId } from "mongodb";

import { getDB } from "../db/database.js";
import mailer from "../services/mail-service.js";
import { getLocalTime } from "../utils/local-time.js";

const subscribeEmail = async (req, res) => {
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
    const exp = new Date().getTime() + 24 * 60 * 60 * 1000; // 1day expiration time
    if (!unverifiedEmail) {
      await db.collection("emails").insertOne({
        email,
        ipAddress,
        latlong,
        country,
        code,
        exp,
        verify: false,
      });
    } else {
      // If the email exists but is not verified, update the code
      await db.collection("emails").updateOne(
        { email: email },
        {
          $set: {
            code: code,
            exp: exp,
          },
        }
      );
    }

    // send verification code to mail
    const subject = "Email Verification Code";
    const html = `<p>Your verification code is: <strong>${code}</strong> and will expire in <strong>24 hours</strong>.</br> If you did not request this, please ignore this email.</p>`;
    const response = await mailer(email, subject, "", html);
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

const unsubscribeEmail = async (req, res) => {
  try {
    const db = await getDB();
    const { id } = req.query;

    if (!id) {
      res.status(400).json({ status: 0, message: "ID is missing" });
      return;
    }
    const response = await db
      .collection("emails")
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { verify: false, unsubscriptionTime: getLocalTime() } }
      );

    if (!response) {
      return res.status(404).json({ status: 0, message: "Email not found" });
    }
    res.status(200).json({
      status: 1,
      message: "Email unsubscribed successfully",
      data: response.email,
    });
  } catch (error) {
    console.error("Error unsubscribing email:", error);
    res.status(500).json({ error: "Error occured while unsubscribing" });
  }
};

const getEmailList = async () => {
  try {
    const db = await getDB();
    const emails = await db
      .collection("emails")
      .find({ verify: true })
      .toArray();
    return emails;
  } catch (error) {
    console.error("Error fetching email list:", error);
    throw error;
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
        console.log(`Welcome email sent to ${email}`);
      } catch (error) {
        console.error(`Error sending welcome email to ${email}:`, error);
      }
    });
    console.log(`Welcome email sent to ${email}`);
  } catch (error) {
    console.error("Error verifying code:", error);
    return res.status(500).json({ status: 0, message: "Error verifying code" });
  }
};

const getNewJobs = async () => {
  try {
    const db = await getDB();
    const currentDate = new Date();
    const twentyFourHoursAgo = new Date(
      currentDate.getTime() - 24 * 60 * 60 * 1000
    );

    // Filter at DB level:
    // 1. Jobs with a future deadline
    // 2. Jobs with null deadline, but first_seen within last 24 hours
    const jobList = await db
      .collection("jobs")
      .find({
        isUpdated: true,
        $or: [
          { deadline: { $ne: null, $gte: currentDate.toISOString() } },
          {
            deadline: null,
            first_seen: { $gte: twentyFourHoursAgo.toISOString() },
          },
        ],
      })
      .toArray();

    // Sort jobs by company name
    jobList.sort((a, b) => {
      const compA = a.company || "";
      const compB = b.company || "";
      return compA.localeCompare(compB);
    });

    return jobList;
  } catch (error) {
    console.error("Error fetching new jobs:", error);
    throw error;
  }
};


const sendJobAlert = async () => {
  try {
    const db = await getDB();
    // gather mailing list
    const mailingList = await getEmailList();
    if (mailingList.length === 0) {
      console.log("No Verified Mail subscriber found.");
      return {
        failedEmails: [],
        receiverEmails: [],
        totalJobs: 0,
        totalSubscribers: 0,
      };
    }
    // gather new jobs
    const newJobs = await getNewJobs();
    if (newJobs.length === 0) {
      console.log("No new jobs found to send alert.");
      return {
        failedEmails: [],
        receiverEmails: [],
        totalJobs: 0,
        totalSubscribers: mailingList.length,
      };
    }
    // update new jobs status to - sent
    await db
      .collection("jobs")
      .updateMany(
        { _id: { $in: newJobs.map((job) => job._id) } },
        { $set: { isUpdated: false } }
      );

    // Get the count of new jobs and companies
    const jobCount = newJobs.length;
    const companies = [...new Set(newJobs.map((job) => job.company))];
    const companyCount = companies.length;
    const data = {
      jobCount: jobCount,
      companyCount: companyCount,
    };
    // build job card html
    const jobCards = newJobs.map((job) => jobCardBuilder(job)).join("");
    const subject = "Job Alerts From ChakriLagbe";

    // Info for alert logging
    let failedEmails = [];
    let jobsID = newJobs.map((job) => job._id);
    let recieverEmails = [];

    // send email to all mailing list
    for (const subscriber of mailingList) {
      // Building html with unsubscribe Link addition
      let html = createEmailTemplate(
        jobCards,
        `${process.env.FRONTEND_URL}/unsubscribe?id=${subscriber._id}`,
        data
      );
      // sending mail
      try {
        const sent = await mailer(subscriber.email, subject, "", html);
        if (sent) {
          recieverEmails.push(subscriber.email);
        } else {
          failedEmails.push(subscriber.email);
        }
      } catch (error) {
        console.error(`Error sending job alert to ${subscriber.email}:`, error);
        failedEmails.push(subscriber.email);
        continue; // skip to next subscriber
      }
    }

    // log the report
    await db.collection("job-alerts-report").insertOne({
      timestamp: getLocalTime(),
      totalSubscribers: mailingList.length,
      totalJobs: newJobs.length,
      failedEmails: failedEmails,
      recieverEmails: recieverEmails,
      jobsID: jobsID,
    });

    return {
      failedEmails,
      receiverEmails: recieverEmails,
      totalJobs: newJobs.length,
      totalSubscribers: mailingList.length,
    };
  } catch (error) {
    console.error("Error sending job alert:", error);
    throw error;
  }
};

export {
  getEmailList,
  sendJobAlert,
  subscribeEmail,
  unsubscribeEmail,
  verifyCode,
};
