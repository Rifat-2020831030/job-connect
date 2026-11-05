import test from "node:test";
import assert from "node:assert/strict";
import {
  escapeCSVCell,
  formatCSVDate,
  formatTrackerStatus,
  buildTrackedJobsCSV,
} from "../src/lib/csvExport.ts";

test("escapeCSVCell - standard string and edge cases", () => {
  assert.equal(escapeCSVCell("Software Engineer"), "Software Engineer");
  assert.equal(escapeCSVCell(""), "");
  assert.equal(escapeCSVCell(null), "");
  assert.equal(escapeCSVCell(undefined), "");
  assert.equal(escapeCSVCell(123), "123");
});

test("escapeCSVCell - RFC 4180 quotes, commas, and newlines escaping", () => {
  assert.equal(escapeCSVCell("Google, Inc."), '"Google, Inc."');
  assert.equal(escapeCSVCell('Senior "Go" Dev'), '"Senior ""Go"" Dev"');
  assert.equal(escapeCSVCell("Line 1\nLine 2"), '"Line 1\nLine 2"');
  assert.equal(escapeCSVCell("Line 1\r\nLine 2"), '"Line 1\r\nLine 2"');
  assert.equal(
    escapeCSVCell('Complex, "quoted", with \n newline'),
    '"Complex, ""quoted"", with \n newline"'
  );
});

test("escapeCSVCell - Spreadsheet formula injection (CWE-1236) mitigation", () => {
  assert.equal(escapeCSVCell("=SUM(A1:A10)"), "'=SUM(A1:A10)");
  assert.equal(escapeCSVCell("=SUM(A1, B1)"), `"'=SUM(A1, B1)"`);
  assert.equal(escapeCSVCell("+12345"), "'+12345");
  assert.equal(escapeCSVCell("-12345"), "'-12345");
  assert.equal(escapeCSVCell("@cmd"), "'@cmd");
});

test("formatCSVDate - formats dates to YYYY-MM-DD", () => {
  const d = new Date(2026, 10, 5); // Nov 5, 2026 local
  const iso = d.toISOString();
  assert.equal(formatCSVDate(iso), "2026-11-05");

  assert.equal(formatCSVDate(null), "");
  assert.equal(formatCSVDate(undefined), "");
  assert.equal(formatCSVDate("Not specified"), "");
  assert.equal(formatCSVDate("Unknown"), "");
  assert.equal(formatCSVDate("invalid-date-string"), "");
});

test("formatTrackerStatus - human friendly status labels", () => {
  assert.equal(
    formatTrackerStatus("PENDING_CONFIRMATION"),
    "Pending Confirmation"
  );
  assert.equal(formatTrackerStatus("APPLIED"), "Applied");
  assert.equal(formatTrackerStatus("INTERVIEWING"), "Interviewing");
  assert.equal(formatTrackerStatus("OFFER"), "Offer");
  assert.equal(formatTrackerStatus("REJECTED"), "Rejected");
  assert.equal(formatTrackerStatus("EXPIRED"), "Expired");
  assert.equal(formatTrackerStatus("CUSTOM_STATUS"), "CUSTOM_STATUS");
});

test("buildTrackedJobsCSV - builds valid CSV with headers and data", () => {
  const jobs = [
    {
      _id: "track1",
      userId: "user1",
      jobId: "job1",
      type: "INTERNAL",
      status: "APPLIED",
      notes: "First round HR call done.\nFollow up next week.",
      history: [],
      createdAt: new Date(2026, 10, 1).toISOString(),
      updatedAt: new Date(2026, 10, 3).toISOString(),
      jobDetails: {
        _id: "job1",
        title: "Frontend Engineer (React, Next.js)",
        company: 'Acme "Tech", Inc.',
        location: "Dhaka, Bangladesh",
        url: "https://example.com/jobs/1",
        deadline: new Date(2026, 11, 1).toISOString(),
      },
    },
    {
      _id: "track2",
      userId: "user1",
      jobId: "ext1",
      type: "EXTERNAL",
      status: "INTERVIEWING",
      notes: "",
      history: [],
      createdAt: new Date(2026, 10, 2).toISOString(),
      updatedAt: new Date(2026, 10, 4).toISOString(),
      jobDetails: {
        _id: "ext1",
        title: "Backend Engineer",
        company: "Google",
        location: "Mountain View, CA",
        platform: "LinkedIn",
        url: "https://linkedin.com/jobs/view/999",
        deadline: null,
      },
    },
  ];

  const csv = buildTrackedJobsCSV(jobs);
  const lines = csv.split("\r\n");

  // Headers check
  assert.equal(
    lines[0],
    "Job Title,Company,Location,Status,Type,Platform,Applied Date,Deadline,Job URL,Notes,Last Updated"
  );

  // Job 1 check (Internal, Chakrilagbe platform fallback, quoted company & title & multiline notes)
  assert.ok(csv.includes('"Frontend Engineer (React, Next.js)"'));
  assert.ok(csv.includes('"Acme ""Tech"", Inc."'));
  assert.ok(csv.includes('"Dhaka, Bangladesh"'));
  assert.ok(csv.includes("Chakrilagbe"));
  assert.ok(csv.includes('"First round HR call done.\nFollow up next week."'));

  // Job 2 check (External, LinkedIn platform, empty notes)
  assert.ok(csv.includes("Backend Engineer"));
  assert.ok(csv.includes("Google"));
  assert.ok(csv.includes("LinkedIn"));
  assert.ok(csv.includes("Interviewing"));
  assert.ok(csv.includes("External"));
});
