import nodemailer from "nodemailer";

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
}

let transporter: nodemailer.Transporter | null = null;

function getMailerConfig() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  const fromEmail = process.env.SMTP_FROM_EMAIL ?? process.env.SMTP_USER;
  const fromName = process.env.SMTP_FROM_NAME ?? "Nakisha Empire";
  const secure = String(process.env.SMTP_SECURE ?? port === 465).toLowerCase() === "true";

  return {
    host,
    port,
    user,
    pass,
    fromEmail,
    fromName,
    secure
  };
}

export function isMailerConfigured() {
  const config = getMailerConfig();
  return Boolean(config.host && config.port && config.user && config.pass && config.fromEmail);
}

function getTransporter() {
  if (transporter) {
    return transporter;
  }

  const config = getMailerConfig();

  if (!isMailerConfigured()) {
    throw new Error("SMTP mailer is not configured. Add SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, and SMTP_FROM_EMAIL.");
  }

  transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass
    }
  });

  return transporter;
}

export async function sendTransactionalEmail(input: SendEmailInput) {
  const config = getMailerConfig();
  const client = getTransporter();

  await client.sendMail({
    from: `${config.fromName} <${config.fromEmail}>`,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text
  });
}
