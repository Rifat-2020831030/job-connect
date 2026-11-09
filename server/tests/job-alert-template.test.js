import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { jobCardBuilder } from "../services/alert-service/template.js";

describe("jobCardBuilder - salary and vacancy handling", () => {
  const baseJob = {
    _id: "67890",
    title: "Software Engineer",
    company: "Acme Corp",
    logo: "https://example.com/logo.png",
    location: "Dhaka, Bangladesh",
    deadline: "2026-12-31T00:00:00.000Z",
  };

  test("renders salary from new schema object text_form and not [object Object]", () => {
    const job = {
      ...baseJob,
      salary: {
        min: 60000,
        max: 90000,
        currency: "BDT",
        period: "month",
        is_negotiable: false,
        text_form: "60,000 - 90,000 BDT/month",
      },
      vacancy: 2,
    };

    const html = jobCardBuilder(job, "https://chakrilagbe.vercel.app");
    assert.doesNotMatch(html, /\[object Object\]/);
    assert.match(html, /60,000 - 90,000 BDT\/month/);
  });

  test("renders legacy string salary", () => {
    const job = {
      ...baseJob,
      salary: "50k-70k",
      vacancy: 1,
    };

    const html = jobCardBuilder(job, "https://chakrilagbe.vercel.app");
    assert.match(html, /50k-70k/);
  });

  test("renders 'Not mentioned' when salary is null or empty", () => {
    const jobWithNull = {
      ...baseJob,
      salary: null,
      vacancy: 1,
    };
    const htmlNull = jobCardBuilder(jobWithNull, "https://chakrilagbe.vercel.app");
    assert.match(htmlNull, /Not mentioned/);

    const jobWithEmpty = {
      ...baseJob,
      salary: "",
      vacancy: 1,
    };
    const htmlEmpty = jobCardBuilder(jobWithEmpty, "https://chakrilagbe.vercel.app");
    assert.match(htmlEmpty, /Not mentioned/);
  });

  test("renders 'Not mentioned' when vacancy is null, undefined, or -1", () => {
    const jobWithNullVacancy = {
      ...baseJob,
      salary: "Negotiable",
      vacancy: null,
    };
    const htmlNull = jobCardBuilder(jobWithNullVacancy, "https://chakrilagbe.vercel.app");
    assert.doesNotMatch(htmlNull, />\s*null\s*</);
    assert.match(htmlNull, /Not mentioned/);

    const jobWithMinusOne = {
      ...baseJob,
      salary: "Negotiable",
      vacancy: -1,
    };
    const htmlMinusOne = jobCardBuilder(jobWithMinusOne, "https://chakrilagbe.vercel.app");
    assert.match(htmlMinusOne, /Not mentioned/);

    const jobWithUndefinedVacancy = {
      ...baseJob,
      salary: "Negotiable",
    };
    const htmlUndefined = jobCardBuilder(jobWithUndefinedVacancy, "https://chakrilagbe.vercel.app");
    assert.match(htmlUndefined, /Not mentioned/);
  });

  test("renders valid numeric vacancy correctly", () => {
    const job = {
      ...baseJob,
      salary: "Negotiable",
      vacancy: 5,
    };
    const html = jobCardBuilder(job, "https://chakrilagbe.vercel.app");
    assert.match(html, />\s*5\s*</);
  });
});
