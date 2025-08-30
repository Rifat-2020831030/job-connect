import crypto from "crypto";
import { ObjectId } from "mongodb";

import { getDB } from "../db/database.js";
import mailer from "../services/mail-service.js";
import { getLocalTime } from "../utils/local-time.js";

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
    const { id } = req.query;

    if (!id) {
      res.status(400).json({ status: 0, message: "ID is missing" });
      return;
    }
    const response = await db
      .collection("emails")
      .findOneAndUpdate({ _id: new ObjectId(id) }, { $set: { verify: false, unsubscriptionTime: getLocalTime() } });

    if (!response) {
      return res.status(404).json({ status: 0, message: "Email not found" });
    }
    res.status(200).json({
      status: 1,
      message: "Email unsubscribed successfully",
      data: response.email ,
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
    const response = await db
      .collection("emails")
      .updateOne(
      { email: email },
      { $set: { verify: true, code: null, exp: null, subscriptionTime: getLocalTime() } }
      );
    if(response.acknowledged) {
      res.status(200).json({ status: 1, message: "Email verified successfully" });
    }
    else {
      res.status(500).json({ status: 0, message: "Failed to verify email. Please try again later." });
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
    // Get jobs that are updated in the last 24 hours
    const jobList = await db.collection("jobs").find({'isUpdated': true}).toArray();
    const currentDate = new Date(getLocalTime());
    const newJobs = jobList.filter((job) => {
      return new Date(job.deadline) >= currentDate; // deadline not passed
    });

    return newJobs;
  } catch (error) {
    console.error("Error fetching new jobs:", error);
    return [];
  }
};

const jobCardBuilder = (job) => {
  return `
    <!-- Card Container -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation" style="max-width: 300px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin: 0 auto 20px auto;">
        <!-- Image Header -->
        <tr>
            <td align="center" style="padding: 0; text-align: center; background-color: #6BAAE8; border-radius: 8px 8px 0 0;">
                <img src="${job.logo}" alt="${job.company} Logo" width="150" height="auto" style="display: block; max-width: 150px; height: auto; min-height: 50px; padding: 20px 0; border: 0; object-fit: cover;">
            </td>
        </tr>
        
        <!-- Job Title -->
        <tr>
            <td style="padding: 20px 25px 10px 25px;">
                <h2 style="margin: 0; color: #1E293B; font-family: Arial, Helvetica, sans-serif; font-size: 18px; font-weight: 600;">${
                  job.title
                }</h2>
            </td>
        </tr>
        
        <!-- Company & Location -->
        <tr>
            <td style="padding: 0 25px 15px 25px;">
                <!-- Using a table for the tags to ensure they don't break weirdly -->
                <table border="0" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                        <td style="padding-right: 8px; padding-bottom: 5px;">
                            <span style="display: inline-block; background-color: #E0EAFC; border-radius: 4px; padding: 6px 10px; font-size: 13px; color: #1E293B; font-family: Arial, Helvetica, sans-serif; font-weight: 500;">${
                              job.company
                            }</span>
                        </td>
                        <td style="padding-bottom: 5px;">
                             <span style="display: inline-block; background-color: #E0EAFC; border-radius: 4px; padding: 6px 10px; font-size: 13px; color: #1E293B; font-family: Arial, Helvetica, sans-serif; font-weight: 500;">${
                               job.location
                             }</span>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        
        <!-- Divider -->
        <tr>
            <td style="padding: 0 25px;">
                <div style="height: 1px; background-color: #E2E8F0; line-height: 1px; font-size: 1px;">&nbsp;</div>
            </td>
        </tr>
        
        <!-- Job Details -->
        <tr>
            <td style="padding: 15px 25px 25px 25px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation">
                    <tr>
                        <td style="width: 33.33%; padding-right: 10px; vertical-align: top;">
                            <p style="font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #64748B; margin: 0 0 3px 0; font-weight: 500;">SALARY</p>
                            <p style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #1E293B; margin: 0; font-weight: 400;">
                            ${(job.salary_min ? `${job.salary_min} to ${job.salary_max}` : `${job.salary ? job.salary : 'Not specified'}`)}
                            </p>
                        </td>
                        <td style="width: 33.33%; padding-right: 10px; vertical-align: top;">
                            <p style="font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #64748B; margin: 0 0 3px 0; font-weight: 500;">VACANCY</p>
                            <p style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #1E293B; margin: 0; font-weight: 400;">
                            ${job.vacancy != -1 ? job.vacancy : 'Not specified'}</p>
                        </td>
                        <td style="width: 33.33%; vertical-align: top;">
                            <p style="font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #64748B; margin: 0 0 3px 0; font-weight: 500;">DEADLINE</p>
                            <p style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #1E293B; margin: 0; font-weight: 400;">${new Date(
                              job.deadline
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
  `;
};

const createEmailTemplate = (jobList, unsubscribeUrl, data) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>Your Daily Job Summary</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f4f4f4;">
    <!-- Email Container -->
    <table cellspacing="0" cellpadding="0" border="0" width="100%" role="presentation" style="background-color: #f4f4f4;">
      <tr>
        <td align="center">
          <table cellspacing="0" cellpadding="0" border="0" width="100%" role="presentation" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); border: 1px solid #e2e8f0;">
            <!-- Header -->
            <tr>
                <td style="background-color: #3b82f6; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-family: Arial, Helvetica, sans-serif;">Chakri Lagbe</h1>
                </td>
            </tr>
            
            <!-- Greeting -->
            <tr>
                <td style="padding: 30px 30px 10px 30px; font-family: Arial, Helvetica, sans-serif;">
                    <p style="margin: 0; font-size: 16px; line-height: 1.5; color: #2d3748;">There are new jobs posted in the last 24 hours! Here is a summary:</p>
                </td>
            </tr>
            
            <!-- Stats Section -->
            <tr>
                <td style="padding: 10px 30px 20px 30px;">
                    <table cellspacing="0" cellpadding="0" border="0" width="100%" role="presentation" style="background-color: #e6f7ff; border-radius: 8px; border: 1px solid #90cdf4;">
                        <tr>
                            <td style="padding: 20px; text-align: center;">
                                <h2 style="color: #1e3a8a; margin: 0 0 20px 0; font-size: 20px; font-family: Arial, Helvetica, sans-serif;">Last 24 Hours Summary</h2>
                                <table cellspacing="0" cellpadding="0" border="0" width="100%" role="presentation" style="text-align: center;">
                                    <tr>
                                        <td width="50%" style="padding: 0 5px;">
                                            <div style="padding: 10px;">
                                                <p style="font-size: 32px; font-weight: bold; color: #1e40af; margin: 0; font-family: Arial, Helvetica, sans-serif;">${data.jobCount}</p>
                                                <p style="font-size: 14px; color: #2d3748; margin: 5px 0 0 0; font-family: Arial, Helvetica, sans-serif;">New Jobs</p>
                                            </div>
                                        </td>
                                        <td width="50%" style="padding: 0 5px;">
                                            <div style="padding: 10px;">
                                                <p style="font-size: 32px; font-weight: bold; color: #1e40af; margin: 0; font-family: Arial, Helvetica, sans-serif;">${data.companyCount}</p>
                                                <p style="font-size: 14px; color: #2d3748; margin: 5px 0 0 0; font-family: Arial, Helvetica, sans-serif;">Companies</p>
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
            
            <!-- Button -->
            <tr>
                <td style="padding: 10px 30px 30px 30px; text-align: center;">
                    <a href="https://chakrilagbe.vercel.app" style="background-color: #3b82f6; border-radius: 4px; color: #ffffff; display: inline-block; font-size: 16px; font-weight: bold; padding: 14px 30px; text-decoration: none; font-family: Arial, Helvetica, sans-serif; width: 80%; max-width: 400px;">View All Job Postings</a>
                </td>
            </tr>
            
            <!-- Job Cards Section -->
            <tr>
                <td align="center" style="padding: 0 10px;">
                  ${jobList}
                </td>
            </tr> 
            
            <!-- Footer -->
            <tr>
                <td style="background-color: #dbeafe; padding: 20px 30px; text-align: center; color: #2d3748; font-size: 14px; border-radius: 0 0 8px 8px;">
                    <p style="margin: 0 0 10px 0; color: #2d3748; font-family: Arial, Helvetica, sans-serif;">&copy; 2025 Chakri Lagbe. All rights reserved.</p>
                    <p style="margin: 0; color: #2d3748; font-family: Arial, Helvetica, sans-serif; line-height: 1.5;">You are receiving this email because you have subscribed to job alerts. If you prefer not to receive these emails, <a href=${unsubscribeUrl} style="color: #1e40af; text-decoration: underline;">unsubscribe here</a>.</p>
                </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
};

export const sendJobAlert = async () => {
  try {
    const db = await getDB();
    // gather mailing list
    const mailingList = await getEmailList();
    if (mailingList.length === 0) {
      console.log("No Verified Mail subscriber found.");
      return;
    }
    // gather new jobs
    const newJobs = await getNewJobs();
    if (newJobs.length === 0) {
      console.log("No new jobs found to send alert.");
      return;
    }
    // update new jobs status to - sent
    await db.collection("jobs").updateMany(
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
      timestamp: getLocalTime(),
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
