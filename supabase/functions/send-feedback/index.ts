import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

interface FeedbackData {
  feedback: string
  userAgent?: string
  platform?: string
  appVersion?: string
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { feedback, userAgent, platform, appVersion }: FeedbackData = await req.json()

    if (!feedback || feedback.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Feedback is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Email content
    const subject = `Sumitt Feedback - ${new Date().toISOString().split('T')[0]}`
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Sumitt Feedback</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2>New Feedback Received for Sumitt</h2>
    
    <div style="border: 1px solid #ddd; padding: 20px; margin: 20px 0;">
        <h3>Feedback:</h3>
        <p style="white-space: pre-wrap;">${feedback}</p>
    </div>
    
    <div style="border: 1px solid #ddd; padding: 15px; margin: 20px 0;">
        <h3>Additional Info:</h3>
        <ul style="margin: 0; padding-left: 20px;">
            <li><strong>Platform:</strong> ${platform || 'Unknown'}</li>
            <li><strong>App Version:</strong> ${appVersion || 'Unknown'}</li>
            <li><strong>Timestamp:</strong> ${new Date().toLocaleString()}</li>
        </ul>
    </div>
    
    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
    <p style="color: #666; font-size: 12px;">
        This feedback was submitted through the Sumitt app.
    </p>
</body>
</html>
    `

    // Send email using Resend
    try {
      const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
      if (RESEND_API_KEY) {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Sumitt <onboarding@resend.dev>', // Using Resend's default domain
            to: ['chikaosro@gmail.com'],
            subject: subject,
            html: emailHtml,
          }),
        })

        if (!response.ok) {
          const error = await response.text()
          console.error('Resend API error:', error)
        } else {
          const data = await response.json()
          console.log('Email sent successfully:', data.id)
        }
      } else {
        console.log('RESEND_API_KEY not configured, logging feedback instead')
      }
    } catch (emailError) {
      console.error('Email service error:', emailError)
    }

    // Always log the feedback for backup
    console.log('=== SUMITT FEEDBACK RECEIVED ===')
    console.log('Subject:', subject)
    console.log('Body:', feedback)
    console.log('================================')

    return new Response(
      JSON.stringify({ success: true, message: 'Feedback submitted successfully' }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error processing feedback:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to process feedback' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}) 