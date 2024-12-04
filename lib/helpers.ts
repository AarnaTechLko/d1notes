// sendEmail.ts
import nodemailer from "nodemailer";
import crypto from 'crypto';
import CryptoJS from 'crypto-js';
interface SendEmailParams {
    to: string;
    cc?: string | null;  // Make cc optional and allow it to be null
    subject: string;
    text: string;
    html: string;
}
const SECRET_KEY = '0123456789abcdef0123456789abcdef'; // Replace with a strong secret in .env
const IV_LENGTH =16; // Initialization vector length

export const encryptData = (data: string): string => {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(SECRET_KEY, 'utf-8'), iv);
    let encrypted = cipher.update(data, 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  };
  
  // Decrypt function
  export const decryptData = (encryptedData: string): string => {
    const [iv, encrypted] = encryptedData.split(':');
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(SECRET_KEY, 'utf-8'),
      Buffer.from(iv, 'hex')
    );
    let decrypted = decipher.update(encrypted, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    return decrypted;
  };


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


// utils/generatePassword.js

export const generateRandomPassword = (length = 12) => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=<>?";
    let password = "";
    
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    
    return password;
  };
  



