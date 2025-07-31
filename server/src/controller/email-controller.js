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
    const { id } = req.query.id;

    if (!id) {
      res.status(400).json({ status: 0, message: "Email is required" });
      return;
    }
    const response = await db
      .collection("emails")
      .findAndUpdateOne({ _id: id }, { $set: { verify: false } });

    if (!response) {
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

export const getEmailList = async () => {
  try {
    const db = await getDB();
    const emails = await db
      .collection("emails")
      .find({ verify: true })
      .toArray();
    return emails;
  } catch (error) {
    console.error("Error fetching email list:", error);
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

    await db
      .collection("emails")
      .updateOne(
        { email: email },
        { $set: { verify: true, code: null, exp: null } }
      );
    return res
      .status(200)
      .json({ status: 1, message: "Email verified successfully" });
  } catch (error) {
    console.error("Error verifying code:", error);
    return res.status(500).json({ status: 0, message: "Error verifying code" });
  }
};

const getNewJobs = async () => {
  try {
    const db = await getDB();
    const jobList = await db.collection("jobs").find({}).toArray();

    const newJobs = jobList.filter((job) => {
      const jobDate = new Date(job.timestamp);
      const currentDate = new Date();
      return currentDate - jobDate <= 24 * 60 * 60 * 1000; // last 24 hours
    });

    return newJobs;
  } catch (error) {
    console.error("Error fetching new jobs:", error);
    return [];
  }
};

const jobCardBuilder = (job) => {
  return `
    <td align="center">
      <table width="320" cellpadding="0" cellspacing="0" border="0" style="background-color: #c9d9f0; border-radius: 12px; padding: 20px; border: 1px solid #ccc; box-shadow: 0 4px 6px rgba(0,0,0,0.1); font-family: Arial, sans-serif;">
        <!-- Company Logo -->
        <tr>
          <td align="center" style="padding-bottom: 15px;">
            <img src="${
              job.logo
            }" alt="Company logo" width="100%" height="100" style="border-radius: 8px; background-color: #74b2e2; display: block;" />
          </td>
        </tr>

        <!-- Job Title -->
        <tr>
          <td style="font-size: 20px; font-weight: bold; color: #2d3748; padding-bottom: 10px; text-align: center;">
            ${job.title}
          </td>
        </tr>

        <!-- Company & Location Tags -->
        <tr>
          <td align="center" style="padding-bottom: 10px;">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding-right: 5px;">
                  <span style="display: inline-block; padding: 6px 12px; background-color: #93c5fd; color: #1e3a8a; font-weight: bold; border-radius: 6px; font-size: 12px;">${
                    job.company
                  }</span>
                </td>
                <td>
                  <span style="display: inline-block; padding: 6px 12px; background-color: #93c5fd; color: #1e3a8a; font-weight: bold; border-radius: 6px; font-size: 12px;">${
                    job.location
                  }</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Job Details -->
        <tr>
          <td style="font-size: 14px; color: #333; text-align: left; padding-bottom: 15px;">
            <ul style="padding-left: 20px; margin: 0;">
              <li>Salary: ${job.salary}</li>
              <li>Vacancy: ${job.vacancy}</li>
              <li>Deadline: ${new Date(job.deadline).toLocaleDateString(
                "en-US",
                {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }
              )}</li>
            </ul>
          </td>
        </tr>

        <tr>
          <td align="center">
            <a href="${
              job.url
            }" target="_blank" style="display: inline-block; width: 100%; padding: 12px 0; background-color: #1d1160; color: #ffffff; text-decoration: none; font-weight: bold; border-radius: 6px; font-size: 14px;">
              Apply Now
            </a>
          </td>
        </tr>
        
      </table>
    </td>
  `;
};

export const sendJobAlert = async () => {
  try {
    const db = await getDB();
    const mailingList = await getEmailList();
    if (mailingList.length === 0) {
      console.log("No Verified Mail subscriber found.");
      return;
    }

    const newJobs = await getNewJobs();
    if (newJobs.length === 0) {
      console.log("No new jobs found to send alert.");
      return;
    }

    // build job card html
    const jobCards = newJobs.map((job) => jobCardBuilder(job)).join("");
    let emailContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h1 style="color: #333;">New Job Alerts</h1>
        <p>Here are the latest job openings in last 24 hours:</p>
        <hr style="border-top: 1px solid #ccc; margin: 20px 0;" width="100%></hr>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f4; padding: 20px;">
          <tr style="display: flex; flex-direction: column; justify-content: center; align-items: center; row-gap: 10px; padding-bottom: 10px;">
            ${jobCards}
          </tr>
        </table>
      </div>
      <hr style="border-top: 1px solid #ccc; margin: 20px 0;" width="100%></hr>
    `;
    const subject = "Job Alerts From ChakriLagbe";

    // Info for alert logging
    let failedEmails = [];
    let jobsID = newJobs.map((job) => job._id);
    let recieverEmails = [];

    // send email to all mailing list
    for (const subscriber of mailingList) {
      // Unsubscribe Link addition
      let html =
        emailContent +
        `
      <footer style="font-size: 12px; color: #666; text-align: center; margin-top: 20px;">
        You are receiving this email because you have subscribed to ${process.env.FRONTEND_URL}. If you wish to unsubscribe, please click <a href="${process.env.FRONTEND_URL}/unsubscribe?id=${subscriber._id}" style="color: #1d1160;">here</a>.
      </footer>
      `;
      // sending mail
      try {
        await mailer(subscriber.email, subject, "", html);
        recieverEmails.push(subscriber.email);
      } catch (error) {
        console.error(`Error sending job alert to ${subscriber.email}:`, error);
        failedEmails.push(subscriber.email);
        continue; // skip to next subscriber
      }
    }

    // log the report
    await db.collection("job-alerts-report").insertOne({
      timestamp: new Date().toISOString(),
      totalSubscribers: mailingList.length,
      totalJobs: newJobs.length,
      failedEmails: failedEmails,
      recieverEmails: recieverEmails,
      jobsID: jobsID,
    });
  } catch (error) {
    console.error("Error sending job alert:", error);
  }
};
