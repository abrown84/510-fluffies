import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Use Resend's test sender until you verify your domain at resend.com/domains
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
const BREEDER_EMAIL = process.env.BREEDER_EMAIL || 'hello@cdcertifiedfrenchies.com'

export type ApplicationStatus = 'pending' | 'reviewing' | 'approved' | 'waitlisted' | 'declined'

interface StatusEmailContent {
  subject: string
  heading: string
  message: string
  showNextSteps: boolean
  nextSteps?: string[]
}

const statusEmailContent: Record<ApplicationStatus, StatusEmailContent> = {
  pending: {
    subject: "Application Received - C.D. Certified Frenchies",
    heading: "We've Received Your Application!",
    message: "Thank you for your interest in our Fluffy French Bulldogs. We've received your application and will review it shortly.",
    showNextSteps: true,
    nextSteps: [
      "We typically review applications within 2-3 business days",
      "We may reach out with follow-up questions",
      "Feel free to reply to this email with any questions"
    ]
  },
  reviewing: {
    subject: "Application Under Review - C.D. Certified Frenchies",
    heading: "Your Application is Being Reviewed",
    message: "Great news! We're currently reviewing your application for one of our Fluffy French Bulldogs. We'll be in touch soon with an update.",
    showNextSteps: true,
    nextSteps: [
      "We may contact you for a phone or video call",
      "Please ensure your contact information is up to date",
      "We'll notify you as soon as we have a decision"
    ]
  },
  approved: {
    subject: "🎉 Congratulations! Application Approved - C.D. Certified Frenchies",
    heading: "Welcome to the C.D. Certified Frenchies Family!",
    message: "We're thrilled to let you know that your application has been approved! We believe you'll provide a wonderful home for one of our puppies.",
    showNextSteps: true,
    nextSteps: [
      "We'll contact you shortly to discuss next steps",
      "A deposit will be required to reserve your puppy",
      "We'll share available puppies that match your preferences",
      "Feel free to reach out with any questions"
    ]
  },
  waitlisted: {
    subject: "You're on Our Waitlist - C.D. Certified Frenchies",
    heading: "You've Been Added to Our Waitlist",
    message: "Thank you for your patience! While we don't have a puppy available right now that matches your criteria, we've added you to our waitlist. We'll contact you as soon as we have puppies that fit your preferences.",
    showNextSteps: true,
    nextSteps: [
      "We'll notify you when matching puppies become available",
      "Your position on the waitlist is based on application date",
      "Feel free to update your preferences anytime"
    ]
  },
  declined: {
    subject: "Application Update - C.D. Certified Frenchies",
    heading: "Application Update",
    message: "Thank you for your interest in C.D. Certified Frenchies. After careful consideration, we've decided not to move forward with your application at this time. We wish you the best in finding your perfect companion.",
    showNextSteps: false
  }
}

export async function sendStatusChangeEmail(
  recipientEmail: string,
  recipientName: string,
  newStatus: ApplicationStatus
): Promise<{ success: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured, skipping email')
    return { success: false, error: 'Email service not configured' }
  }

  const content = statusEmailContent[newStatus]

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: recipientEmail,
      subject: content.subject,
      html: generateEmailHtml(recipientName, content),
    })

    if (error) {
      console.error('Failed to send email:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error('Email send error:', err)
    return { success: false, error: 'Failed to send email' }
  }
}

function generateEmailHtml(name: string, content: StatusEmailContent): string {
  const nextStepsHtml = content.showNextSteps && content.nextSteps
    ? `
      <div style="margin-top: 24px; padding: 16px; background-color: #faf5f0; border-radius: 8px;">
        <p style="margin: 0 0 12px 0; font-weight: 600; color: #1a1a1a;">What's Next?</p>
        <ul style="margin: 0; padding-left: 20px; color: #4a4a4a;">
          ${content.nextSteps.map(step => `<li style="margin-bottom: 8px;">${step}</li>`).join('')}
        </ul>
      </div>
    `
    : ''

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #1a1a1a;">C.D. Certified Frenchies</h1>
            <p style="margin: 4px 0 0 0; color: #8b7355; font-size: 14px;">Premium Fluffy French Bulldogs</p>
          </div>

          <!-- Main Content -->
          <div style="background-color: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <h2 style="margin: 0 0 16px 0; font-size: 22px; color: #1a1a1a;">${content.heading}</h2>

            <p style="margin: 0 0 16px 0; color: #4a4a4a; line-height: 1.6;">
              Dear ${name},
            </p>

            <p style="margin: 0; color: #4a4a4a; line-height: 1.6;">
              ${content.message}
            </p>

            ${nextStepsHtml}
          </div>

          <!-- Footer -->
          <div style="text-align: center; margin-top: 32px; color: #8a8a8a; font-size: 14px;">
            <p style="margin: 0 0 8px 0;">
              Questions? Reply to this email or contact us at
              <a href="mailto:${BREEDER_EMAIL}" style="color: #8b7355;">${BREEDER_EMAIL}</a>
            </p>
            <p style="margin: 0;">
              <a href="https://cdcertifiedfrenchies.com" style="color: #8b7355;">cdcertifiedfrenchies.com</a>
            </p>
            <p style="margin: 16px 0 0 0; font-size: 12px;">
              © ${new Date().getFullYear()} C.D. Certified Frenchies. All rights reserved.
            </p>
          </div>
        </div>
      </body>
    </html>
  `
}
