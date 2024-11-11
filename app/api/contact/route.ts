import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/helpers';

export async function POST(req: NextRequest) {
  try {

    const body = await req.json();
    const { email, mobile, name, message } = body;
    const emailResult = await sendEmail({
        to: email,
        cc: 'info@aarnatechxperts.in',  // Add the CC email address here
        subject: "D1 NOTES Contact Form Submission",
        text: "D1 NOTES Contact Form Submission",
        html: `
            <p>Dear ${name},</p>
            <p>Thank you for reaching out to us through our contact form. Here are the details we received:</p>
            <ul>
                <li><strong>Name:</strong> ${name}</li>
                <li><strong>Email:</strong> ${email}</li>
                <li><strong>Mobile:</strong> ${mobile}</li>
                <li><strong>Message:</strong> ${message}</li>
            </ul>
            <p>We will review your message and get back to you as soon as possible.</p>
            <p>Best regards,<br/>D1 NOTES Team</p>
        `,
    });
    
    return NextResponse.json({ message:"Profile Completed"}, { status: 200 });

  } catch (error) {
    const err = error as any;
     
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
