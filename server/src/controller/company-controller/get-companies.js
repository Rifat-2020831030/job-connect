import { getDB } from "../../db/database.js";
import { ObjectId } from "mongodb";

const getCompanies = async (req, res) => {
  try {
    const db = await getDB();
    const limit = parseInt(req.query.limit) || 10;
    const cursorStr = req.query.cursor;
    const search = req.query.search;
    
    let query = {};
    const sort = { current_open_jobs: -1, name: 1, _id: 1 };
    
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { category: { $regex: search, $options: "i" } }
        ]
      };
    }
    
    if (cursorStr) {
      try {
        const decoded = Buffer.from(cursorStr, 'base64').toString('utf8');
        const cursorObj = JSON.parse(decoded);
        const { jobs, name, id } = cursorObj;
        
        const cursorQuery = {
          $or: [
            { current_open_jobs: { $lt: jobs } },
            { current_open_jobs: jobs, name: { $gt: name } },
            { current_open_jobs: jobs, name: name, _id: { $gt: new ObjectId(id) } }
          ]
        };
        
        if (Object.keys(query).length > 0) {
          query = { $and: [query, cursorQuery] };
        } else {
          query = cursorQuery;
        }
      } catch (err) {
        console.error("Invalid cursor format", err);
      }
    }
    
    const companies = await db.collection("companies")
      .find(query)
      .sort(sort)
      .limit(limit)
      .toArray();
    
    let nextCursor = null;
    if (companies.length === limit) {
      const lastCompany = companies[companies.length - 1];
      const cursorObj = {
        jobs: lastCompany.current_open_jobs || 0,
        name: lastCompany.name || "",
        id: lastCompany._id.toString()
      };
      nextCursor = Buffer.from(JSON.stringify(cursorObj)).toString('base64');
    }
    
    const formattedCompanies = companies.map(company => ({
      _id: company._id,
      logo: company.logo || "",
      name: company.name || "",
      category: company.category || "General",
      website: company.website || "",
      tech_stack: company.tech_stack || [],
      active_jobs_count: company.current_open_jobs || 0
    }));

    res.status(200).json({
      status: 1,
      message: "Companies fetched successfully",
      data: formattedCompanies,
      nextCursor: nextCursor
    });
  } catch (error) {
    console.error("Error fetching companies:", error);
    res.status(500).json({ status: 0, message: "Error when fetching company list" });
  }
};

export { getCompanies };
