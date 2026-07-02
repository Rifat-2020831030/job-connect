import { getDB } from '../../src/db/database.js';
import mailer from '../../src/services/mail-service.js';
import { jobCardBuilder, createEmailTemplate } from './template.js';

const getUsers = async (db, timeSet, testEmail = null) => {
    const filter = {
        verified: true,
        "preferences.alertTiming": timeSet
    };
    if (testEmail) filter.email = testEmail;
    return db.collection('users').find(filter).toArray();
};

const getMatchingJobs = async (db, user) => {
    const lastMailTime = user.lastest_job_delivery
        ? new Date(user.lastest_job_delivery)
        : new Date(Date.now() - 24 * 60 * 60 * 1000);
    const currentDate = new Date();
    const thirtyDaysAgo = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    const filter = {
        $expr: {
            $and: [
                {
                    $gte: [
                        { $convert: { input: "$first_seen", to: "date", onError: new Date(0), onNull: new Date(0) } },
                        lastMailTime
                    ]
                },
                {
                    $or: [
                        {
                            $and: [
                                { $ne: ["$deadline", null] },
                                { $gte: [
                                    { $convert: { input: "$deadline", to: "date", onError: new Date(0), onNull: new Date(0) } },
                                    currentDate
                                ]}
                            ]
                        },
                        {
                            $and: [
                                { $eq: ["$deadline", null] },
                                { $gte: [
                                    { $convert: { input: "$first_seen", to: "date", onError: new Date(0), onNull: new Date(0) } },
                                    thirtyDaysAgo
                                ]}
                            ]
                        }
                    ]
                }
            ]
        },
        category: { $in: user.preferences.categories },
        job_type: { $in: user.preferences.workModel},
        industry: { $regex: '^engineering$', $options: 'i' }
    };

    return db.collection('jobs')
        .find(filter)
        .sort({ first_seen: -1, company: 1 })
        .toArray();
};

export const sendJobAlert = async (timeSet, testEmail = null) => {
    try {
        const db = await getDB();
        const users = await getUsers(db, timeSet, testEmail);

        console.log(`Found ${users.length} users with verified email and alertTiming set to "${timeSet}"`);

        let sentCount = 0;
        let failedCount = 0;

        for (const user of users) {
            try {
                const jobs = await getMatchingJobs(db, user);
                if (jobs.length === 0) {
                    console.log(`No matching jobs found for user: ${user.email}`);
                    continue;
                }

                // Build job card html
                const jobCards = jobs.map(job => jobCardBuilder(job)).join('');
                
                // Get counts for template data
                const companyCount = new Set(jobs.map(job => job.company)).size;
                const data = {
                    jobCount: jobs.length,
                    companyCount: companyCount
                };

                const unsubscribeUrl = `${process.env.FRONTEND_URL || 'https://chakrilagbe.vercel.app'}/unsubscribe?id=${user._id}`;
                const html = createEmailTemplate(jobCards, unsubscribeUrl, data);
                const subject = "New Job Postings Alert - ChakriLagbe";

                console.log(`Sending job alert to user: ${user.email} (${jobs.length} jobs)`);
                const sent = await mailer(user.email, subject, "", html);

                if (sent) {
                    sentCount++;
                    // Update user's lastest_job_delivery time
                    await db.collection('users').updateOne(
                        { _id: user._id },
                        { $set: { lastest_job_delivery: new Date().toISOString() } }
                    );
                } else {
                    console.error(`Failed to send job alert to user: ${user.email}`);
                    failedCount++;
                }
            } catch (userError) {
                console.error(`Error processing job alert for user ${user.email}:`, userError);
                failedCount++;
            }
        }

        return {
            status: 1,
            message: `Job alert process completed. Sent: ${sentCount}, Failed: ${failedCount}`,
            data: { sentCount, failedCount }
        };
    } catch (error) {
        console.error("Error running sendJobAlert service:", error);
        throw error;
    }
};