// sendEmail.ts
import nodemailer from "nodemailer";

interface SendEmailParams {
    to: string;
    cc?: string | null;  // Make cc optional and allow it to be null
    subject: string;
    text: string;
    html: string;
}

export async function sendEmail({ to, cc, subject, text, html }: SendEmailParams) {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    try {
        const info = await transporter.sendMail({
            from: `"D1 NOTES" <${process.env.SMTP_USER}>`,
            to,
            cc: cc || undefined,  // Only include cc if it's provided
            subject,
            text,
            html,
        });
        
        return { success: true, info };
    } catch (error) {
        console.error("Error sending email:", error);
        return { success: false, error };
    }
}
