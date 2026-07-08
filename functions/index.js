/**
 * Career Bridge — Cloud Functions (email notifications)
 *
 * Sends transactional emails when an admin changes the status of a
 * candidate application (accepted / rejected) or a consultation
 * (confirmed / cancelled).
 *
 * IMPORTANT — database binding:
 * The frontend uses a NAMED Firestore database called "default"
 * (see src/lib/firebase.ts: getFirestore(app, "default")), which is NOT
 * the "(default)" database. Every trigger below is therefore explicitly
 * bound to database: "default". Do not remove that option.
 *
 * Configuration (no secrets are committed to the repo):
 *   firebase functions:secrets:set SMTP_USER   # e.g. your Gmail address
 *   firebase functions:secrets:set SMTP_PASS   # e.g. a Gmail App Password
 * Optional params (have sensible defaults, can be set at deploy time):
 *   SMTP_HOST (default: smtp.gmail.com)
 *   SMTP_PORT (default: 465)
 *   MAIL_FROM (default: "Career Bridge <no-reply@careerbridge.com>")
 */

const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { setGlobalOptions } = require("firebase-functions/v2");
const { defineSecret, defineString } = require("firebase-functions/params");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

setGlobalOptions({ maxInstances: 10 });

const SMTP_HOST = defineString("SMTP_HOST", { default: "smtp.gmail.com" });
const SMTP_PORT = defineString("SMTP_PORT", { default: "465" });
const MAIL_FROM = defineString("MAIL_FROM", { default: "Career Bridge <no-reply@careerbridge.com>" });
const SMTP_USER = defineSecret("SMTP_USER");
const SMTP_PASS = defineSecret("SMTP_PASS");

function createTransport() {
  const port = Number(SMTP_PORT.value()) || 465;
  return nodemailer.createTransport({
    host: SMTP_HOST.value(),
    port,
    secure: port === 465,
    auth: {
      user: SMTP_USER.value(),
      pass: SMTP_PASS.value(),
    },
  });
}

const BRAND_BLUE = "#0F4C81";
const BRAND_AMBER = "#F59E0B";

function emailLayout(title, bodyHtml) {
  return `
  <div style="font-family: Arial, Helvetica, sans-serif; background: #F8FAFC; padding: 32px 16px;">
    <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #E2E8F0;">
      <div style="background: ${BRAND_BLUE}; padding: 24px; text-align: center;">
        <span style="color: #ffffff; font-size: 20px; font-weight: bold;">Career<span style="color: ${BRAND_AMBER};">Bridge</span></span>
      </div>
      <div style="padding: 32px 28px;">
        <h1 style="font-size: 20px; color: #111827; margin: 0 0 16px;">${title}</h1>
        ${bodyHtml}
        <p style="font-size: 13px; color: #9CA3AF; margin-top: 32px;">
          You are receiving this email because you used the Career Bridge platform.
        </p>
      </div>
    </div>
  </div>`;
}

async function sendMail({ to, subject, title, bodyHtml, text }) {
  const transport = createTransport();
  await transport.sendMail({
    from: MAIL_FROM.value(),
    to,
    subject,
    text,
    html: emailLayout(title, bodyHtml),
  });
  logger.info(`Email sent to ${to}: ${subject}`);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Emails the candidate when an admin accepts or rejects their application.
 * Fires only on a REAL status transition (idempotent for unrelated updates,
 * e.g. feedback-only edits or repeated writes with the same status).
 */
exports.sendCandidateStatusEmail = onDocumentUpdated(
  {
    document: "candidates/{candidateId}",
    database: "default",
    secrets: [SMTP_USER, SMTP_PASS],
  },
  async (event) => {
    const before = event.data && event.data.before ? event.data.before.data() : null;
    const after = event.data && event.data.after ? event.data.after.data() : null;
    if (!before || !after) return;

    if (before.status === after.status) return;
    if (!["accepted", "rejected"].includes(after.status)) return;

    if (!after.email) {
      logger.warn(`Candidate ${event.params.candidateId} has no email; skipping notification.`);
      return;
    }

    const name = escapeHtml(after.name || "there");
    const jobTitle = after.jobTitle ? escapeHtml(after.jobTitle) : "your application";
    const feedback = after.feedback ? escapeHtml(after.feedback) : "";

    try {
      if (after.status === "accepted") {
        await sendMail({
          to: after.email,
          subject: `Great news — your application has been accepted!`,
          title: `Congratulations, ${name}!`,
          bodyHtml: `
            <p style="font-size: 15px; color: #374151; line-height: 1.6;">
              Your application for <strong>${jobTitle}</strong> has been <strong style="color: #10B981;">accepted</strong> by our team.
            </p>
            ${feedback ? `<div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 12px; padding: 16px; margin: 16px 0;"><p style=\"font-size: 14px; color: #166534; margin: 0;\"><strong>Message from our team:</strong><br/>${feedback}</p></div>` : ""}
            <p style="font-size: 15px; color: #374151; line-height: 1.6;">
              We will contact you shortly with the next steps. You can also track your application status any time from your dashboard.
            </p>`,
          text: `Congratulations ${after.name || ""}! Your application for ${after.jobTitle || "your application"} has been accepted.${after.feedback ? ` Message from our team: ${after.feedback}` : ""}`,
        });
      } else {
        await sendMail({
          to: after.email,
          subject: `Update on your Career Bridge application`,
          title: `Hello, ${name}`,
          bodyHtml: `
            <p style="font-size: 15px; color: #374151; line-height: 1.6;">
              Thank you for applying for <strong>${jobTitle}</strong>. After careful review, we are unable to move forward with your application at this time.
            </p>
            ${feedback ? `<div style="background: #FFF7ED; border: 1px solid #FED7AA; border-radius: 12px; padding: 16px; margin: 16px 0;"><p style=\"font-size: 14px; color: #9A3412; margin: 0;\"><strong>Feedback from our team:</strong><br/>${feedback}</p></div>` : ""}
            <p style="font-size: 15px; color: #374151; line-height: 1.6;">
              Please keep an eye on our jobs page — new opportunities are posted regularly and we would love to see you apply again.
            </p>`,
          text: `Thank you for applying for ${after.jobTitle || "a position"} at Career Bridge. Unfortunately we are unable to move forward at this time.${after.feedback ? ` Feedback: ${after.feedback}` : ""}`,
        });
      }
    } catch (error) {
      logger.error(`Failed to send candidate status email for ${event.params.candidateId}:`, error);
    }
  }
);

/**
 * Emails the client when their consultation is confirmed or cancelled.
 */
exports.sendConsultationStatusEmail = onDocumentUpdated(
  {
    document: "consultations/{consultationId}",
    database: "default",
    secrets: [SMTP_USER, SMTP_PASS],
  },
  async (event) => {
    const before = event.data && event.data.before ? event.data.before.data() : null;
    const after = event.data && event.data.after ? event.data.after.data() : null;
    if (!before || !after) return;

    if (before.status === after.status) return;
    if (!["confirmed", "cancelled"].includes(after.status)) return;

    if (!after.email) {
      logger.warn(`Consultation ${event.params.consultationId} has no email; skipping notification.`);
      return;
    }

    const name = escapeHtml(after.name || "there");
    const service = escapeHtml(after.service || "your consultation");
    const dateLine = [after.date, after.time].filter(Boolean).map(escapeHtml).join(" at ");

    try {
      if (after.status === "confirmed") {
        await sendMail({
          to: after.email,
          subject: `Your consultation is confirmed ✅`,
          title: `You're all set, ${name}!`,
          bodyHtml: `
            <p style="font-size: 15px; color: #374151; line-height: 1.6;">
              Your <strong>${service}</strong> consultation has been <strong style="color: #10B981;">confirmed</strong>${dateLine ? ` for <strong>${dateLine}</strong>` : ""}.
            </p>
            <p style="font-size: 15px; color: #374151; line-height: 1.6;">
              ${after.meeting === "online" ? "We will send you the meeting link before the session." : "We look forward to welcoming you at our office."}
            </p>`,
          text: `Your ${after.service || ""} consultation has been confirmed${dateLine ? ` for ${after.date} at ${after.time}` : ""}.`,
        });
      } else {
        await sendMail({
          to: after.email,
          subject: `Your consultation has been cancelled`,
          title: `Hello, ${name}`,
          bodyHtml: `
            <p style="font-size: 15px; color: #374151; line-height: 1.6;">
              Unfortunately your <strong>${service}</strong> consultation${dateLine ? ` scheduled for <strong>${dateLine}</strong>` : ""} has been <strong style="color: #F43F5E;">cancelled</strong>.
            </p>
            <p style="font-size: 15px; color: #374151; line-height: 1.6;">
              You can book a new appointment any time from the consultation page — we would be happy to help.
            </p>`,
          text: `Your ${after.service || ""} consultation has been cancelled. You can book a new appointment any time.`,
        });
      }
    } catch (error) {
      logger.error(`Failed to send consultation status email for ${event.params.consultationId}:`, error);
    }
  }
);
