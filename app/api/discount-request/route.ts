import { NextResponse } from 'next/server';
import { sendEmail } from '../../../utils/email';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Send notification email
    const result = await sendEmail({
      to: 'scott.golbach@gmail.com',
      subject: 'New Discount Voucher Request',
      html: `
        <div>
          <h2>New Discount Voucher Request</h2>
          <p>A user has requested a 50% discount voucher.</p>
          <p><strong>Email:</strong> ${email}</p>
          <p>Please send them their voucher code.</p>
        </div>
      `,
    });

    if (!result.success) {
      console.error('Failed to send email:', result.error);
      return NextResponse.json(
        { error: 'Failed to send email', details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Discount request received' });
  } catch (error) {
    console.error('Error in discount-request API route:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 