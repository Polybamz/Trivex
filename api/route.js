// app/api/send-email/route.js

import { NextResponse } from 'next/server';

import { sendEmail } from '../utils/nodemailer'; 


export async function POST(request) {
  try {
    const { to, subject, data } = await request.json();

    // Basic validation: Ensure required fields are present
    if (!to || !subject || !data || typeof data !== 'object' || !data.recipientName || !data.updatesLink) {
      return NextResponse.json(
        { error: 'Missing required email fields: to, subject, data (recipientName, updatesLink). Data must be an object.' },
        { status: 400 }
      );
    }

    
    await sendEmail(to, subject, data);

    // Return a success response
    return NextResponse.json(
      { message: 'Email sent successfully!' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Next.js API Error sending email:', error);
    // Return an error response
    return NextResponse.json(
      { error: 'Failed to send email.', details: error.message },
      { status: 500 }
    );
  }
}

