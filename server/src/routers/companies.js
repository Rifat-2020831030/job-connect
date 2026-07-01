import express from "express";
import { getCompanies } from "../controller/company-controller/get-companies.js";
import { getCompanyById } from "../controller/company-controller/get-company-by-id.js";

const router = express.Router();

// Get all companies
router.get("/", getCompanies);

// Get company by ID
router.get("/:id", getCompanyById);

export default router;
