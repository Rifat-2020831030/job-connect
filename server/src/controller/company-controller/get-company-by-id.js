import { getDB } from "../../db/database.js";
import { ObjectId } from "mongodb";

export const getCompanyById = async (req, res) => {
  try {
    const db = await getDB();
    const { id } = req.params;

    if (!id || id.length !== 24) {
      return res.status(400).json({ status: 0, message: "Invalid company ID format" });
    }

    const company = await db.collection("companies").findOne({ _id: new ObjectId(id) });

    if (!company) {
      return res.status(404).json({ status: 0, message: "Company not found" });
    }

    return res.status(200).json({ status: 1, data: company });
  } catch (error) {
    console.error("getCompanyById error:", error);
    return res.status(500).json({ status: 0, message: "Internal Server Error" });
  }
};
