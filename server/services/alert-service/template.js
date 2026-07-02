export const jobCardBuilder = (job, frontendUrl) => {
  const jobUrl = `${frontendUrl}/jobs?jobId=${job._id}`;
  return `
    <!-- Card Container -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation" style="max-width: 300px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin: 0 auto 20px auto;">
        <!-- Image Header -->
        <tr>
            <td align="center" style="padding: 0; text-align: center; background-color: #6BAAE8; border-radius: 8px 8px 0 0;">
                <img src="${job.logo}" alt="${
    job.company
  } Logo" width="150" height="auto" style="display: block; max-width: 150px; height: auto; min-height: 50px; padding: 20px 0; border: 0; margin: 0 auto; object-fit: contain;">
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
            <td style="padding: 15px 25px 15px 25px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation">
                    <tr>
                        <td style="width: 33.33%; padding-right: 10px; vertical-align: top;">
                            <p style="font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #64748B; margin: 0 0 3px 0; font-weight: 500;">SALARY</p>
                            <p style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #1E293B; margin: 0; font-weight: 400;">
                            ${
                                job.salary && job.salary !== ""
                                    ? job.salary
                                    : "Not mentioned"
                            }
                            </p>
                        </td>
                        <td style="width: 33.33%; padding-right: 10px; vertical-align: top;">
                            <p style="font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #64748B; margin: 0 0 3px 0; font-weight: 500;">VACANCY</p>
                            <p style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #1E293B; margin: 0; font-weight: 400;">
                            ${
                              job.vacancy != -1 ? job.vacancy : "Not mentioned"
                            }</p>
                        </td>
                        <td style="width: 33.33%; vertical-align: top;">
                            <p style="font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #64748B; margin: 0 0 3px 0; font-weight: 500;">DEADLINE</p>
                            <p style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #1E293B; margin: 0; font-weight: 400;">${
                              job.deadline
                                ? new Date(job.deadline).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    }
                                  )
                                : "Not mentioned"
                            }</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>

        <!-- View Details Button -->
        <tr>
            <td align="center" style="padding: 0 25px 25px 25px;">
                <a href="${jobUrl}" target="_blank" style="display: block; width: 100%; box-sizing: border-box; background-color: #3b82f6; border-radius: 4px; color: #ffffff; font-size: 14px; font-weight: bold; padding: 12px 0; text-align: center; text-decoration: none; font-family: Arial, Helvetica, sans-serif;">View Details</a>
            </td>
        </tr>
    </table>
  `;
};

export const createEmailTemplate = (jobList, unsubscribeUrl, data) => {
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
                    <a href="https://chakrilagbe.vercel.app/jobs" style="background-color: #3b82f6; border-radius: 4px; color: #ffffff; display: inline-block; font-size: 16px; font-weight: bold; padding: 14px 30px; text-decoration: none; font-family: Arial, Helvetica, sans-serif; width: 80%; max-width: 400px;">View All Job Postings</a>
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