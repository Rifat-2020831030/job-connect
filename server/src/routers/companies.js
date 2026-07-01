import express from "express";
import { getCompanies } from "../controller/company-controller/get-companies.js";

const router = express.Router();

// Get all companies
router.get("/", getCompanies);

export default router;
