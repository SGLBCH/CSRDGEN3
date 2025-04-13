import { NextResponse } from 'next/server';
import { sendEmail } from '../../../utils/email';

export async function GET(request: Request) {
  try {
    // Get email from query params or use a default
    const url = new URL(request.url);
    const email = url.searchParams.get('email') || 'scott.golbach@gmail.com';

    const result = await sendEmail({
      to: email,
      subject: 'Hello World from Resend',
      html: '<p>Congrats on sending your <strong>first email</strong> with Resend!</p>'
    });

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to send email', details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Email sent successfully', data: result.data });
  } catch (error) {
    console.error('Error in email-test API route:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 