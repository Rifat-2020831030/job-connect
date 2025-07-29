import { getDB } from "../db/database.js";

export const subscribeEmail = async (req, res) => {
  try {
    const db = getDB();
    const { email, ipAddress = 'unknown', latlong = 'unknown', country = 'unknown'} = req.body;

    if (!email) {
      return res.status(400).json({ status: 0, message: "Email is required" });
    }

    // Check if the email already exists
    const existingEmail = await db.collection("emails").findOne({ email });
    if (existingEmail) {
      return res
        .status(409)
        .json({ status: 0, message: "Email already subscribed" });
    }

    // Insert the new email into the database
    await db.collection("emails").insertOne({ email, ipAddress, latlong, country });

    res.status(200).json({
      status: 1,
      message: "Email subscribed successfully",
      data: { email },
    });
  } catch (error) {
    console.error("Error subscribing email:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const unsubscribeEmail = async (req, res) => {
  try {
    const db = getDB();
    const { email } = req.body;

    if(!email) {
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
    const db = get();
    const emails = await db.collection("emails").find({}.toArray());
    if(emails.length === 0 ){
      res.status(404).json({status: 0, message: "No emails found"});
      return;
    }
    res.status(200).json({
      status: 1,
      message: "Emails fetched successfully",
      data: emails,
    });
  } catch (error) {
    console.error("Error fetching email list:", error);
    res.status(500).json({ error: "Error occured while getting list of emails" });
    
  }
}
