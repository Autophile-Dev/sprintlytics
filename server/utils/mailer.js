import nodemailer from "nodemailer";
import EmailLog from "../models/EmailLog";

export async function sendMail({ to, subject, html, text }) {
  let smtpUser = process.env.SMTP_USER;
  let smtpPass = process.env.SMTP_PASS;
  let smtpFrom = process.env.SMTP_FROM;

  try {
    const config = useRuntimeConfig();
    if (config) {
      smtpUser = smtpUser || config.smtpUser;
      smtpPass = smtpPass || config.smtpPass;
      smtpFrom = smtpFrom || config.smtpFrom;
    }
  } catch (e) {
    // Ignore runtime config errors if run outside Nuxt context (like in test scripts)
  }

  // Set default sender if not configured
  smtpFrom = smtpFrom || `"Sprintlytics Auth" <${smtpUser || "no-reply@sprintlytics.local"}>`;

  const isDev = process.env.NODE_ENV === "development" || !process.env.NODE_ENV;

  // If credentials are not set, fallback to console logging in development
  if (!smtpUser || !smtpPass) {
    if (isDev) {
      console.warn("\n==================================================");
      console.warn("[Mailer] SMTP credentials not set. Simulated Email Dispatch:");
      console.warn(`TO:      ${to}`);
      console.warn(`SUBJECT: ${subject}`);
      console.warn(`BODY:\n${text || html}`);
      console.warn("==================================================\n");

      try {
        await EmailLog.create({
          emailType: "individual",
          status: "simulated_dev",
          delivered: true,
          to,
          recipientCount: 1,
          fromEmail: "simulated-dev@sprintlytics.local",
          subject,
          htmlBody: html || text,
          htmlLength: (html || text || "").length,
          sentAt: new Date(),
        });
      } catch (dbErr) {
        console.error("[Mailer] Failed to write simulated email log to database:", dbErr.message);
      }

      return { messageId: "dev-simulated-id", simulated: true };
    } else {
      throw new Error("SMTP credentials (SMTP_USER and SMTP_PASS) must be configured in production.");
    }
  }

  // Configure transporter for Gmail SMTP
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: smtpUser,
      pass: smtpPass, // Requires Gmail App Password
    },
  });

  try {
    const info = await transporter.sendMail({
      from: smtpFrom,
      to,
      subject,
      text,
      html,
    });

    console.log(`[Mailer] Email sent successfully: ${info.messageId}`);

    // Log to EmailLog database
    try {
      await EmailLog.create({
        emailType: "individual",
        status: "sent",
        delivered: true,
        to,
        recipientCount: 1,
        fromEmail: smtpFrom,
        subject,
        htmlBody: html || text,
        htmlLength: (html || text || "").length,
        sentAt: new Date(),
      });
    } catch (dbErr) {
      console.error("[Mailer] Failed to write successful email log to database:", dbErr.message);
    }

    return info;
  } catch (error) {
    console.error("[Mailer] Failed to send email:", error.message);

    // Log failure to EmailLog database
    try {
      await EmailLog.create({
        emailType: "individual",
        status: "failed",
        delivered: false,
        to,
        recipientCount: 1,
        fromEmail: smtpFrom,
        subject,
        htmlBody: html || text,
        htmlLength: (html || text || "").length,
        sentAt: new Date(),
      });
    } catch (dbErr) {
      console.error("[Mailer] Failed to write failed email log to database:", dbErr.message);
    }

    throw error;
  }
}
