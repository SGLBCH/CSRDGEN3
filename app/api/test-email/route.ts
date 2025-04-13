import { NextResponse } from 'next/server';
import { sendEmail } from '../../../utils/email';

export async function GET(request: Request) {
  try {
    console.log('Test email API endpoint called');
    
    const result = await sendEmail({
      to: 'scott.golbach@gmail.com',
      subject: 'Test Email from API',
      html: '<p>This is a test email from the API endpoint to verify email functionality is working.</p>'
    });

    console.log('Email send result:', result);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to send email', details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Test email sent successfully', 
      data: result.data 
    });
  } catch (error) {
    console.error('Error in test-email API route:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred', details: error },
      { status: 500 }
    );
  }
} 