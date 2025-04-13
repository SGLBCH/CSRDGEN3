import { Resend } from 'resend';

// Initialize Resend with the API key directly
const resend = new Resend('re_LDZ4uoee_9TfbKKHtE9LPcPBxsBQ6VA4x');

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

/**
 * Send an email using Resend
 */
export async function sendEmail({
  to,
  subject,
  html,
  from = 'onboarding@resend.dev', // Default sender - update this with your domain
  replyTo,
}: SendEmailParams) {
  try {
    console.log(`Attempting to send email to: ${to}`);
    
    // Ensure API key is available
    if (!resend) {
      console.error('Resend API key is not available');
      return { success: false, error: 'Resend API key is not available' };
    }
    
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
      replyTo,
    });

    if (error) {
      console.error('Failed to send email:', error);
      return { success: false, error };
    }

    console.log('Email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

/**
 * Example function for sending a welcome email
 */
export async function sendWelcomeEmail(email: string, name: string) {
  return sendEmail({
    to: email,
    subject: 'Welcome to Our Platform',
    html: `
      <div>
        <h1>Welcome, ${name}!</h1>
        <p>Thank you for joining our platform. We're excited to have you on board.</p>
        <p>If you have any questions, feel free to reply to this email.</p>
      </div>
    `,
  });
} 