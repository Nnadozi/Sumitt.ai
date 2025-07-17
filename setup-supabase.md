# Supabase Edge Function Setup Guide

## Quick Setup Steps

1. **Install Supabase CLI**:
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**:
   ```bash
   supabase login
   ```

3. **Initialize Supabase** (if not already done):
   ```bash
   supabase init
   ```

4. **Create a new Supabase project** at https://supabase.com/dashboard

5. **Link your project**:
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```
   (Replace `YOUR_PROJECT_REF` with your actual project reference from the Supabase dashboard)

6. **Deploy the edge function**:
   ```bash
   supabase functions deploy send-feedback
   ```

7. **Get your function URL**:
   After deployment, you'll get a URL like:
   `https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-feedback`

8. **Update the FeedbackModal component**:
   In `components/FeedbackModal.tsx`, replace:
   ```typescript
   const response = await fetch('YOUR_SUPABASE_EDGE_FUNCTION_URL', {
   ```
   with your actual function URL.

## Domain Setup for Resend

The edge function is configured to send emails from `feedback@sumitt.app`. You have a few options:

1. **Verify your domain with Resend**:
   - Go to https://resend.com/domains
   - Add and verify your domain
   - Update the edge function to use your verified domain

2. **Use Resend's sandbox domain** (for testing):
   - Update the edge function to use `onboarding@resend.dev` as the sender

3. **Use a different verified domain**:
   - If you have another domain verified with Resend, update the edge function

## Testing

You can test the function locally:
```bash
supabase functions serve send-feedback
```

Then test with curl:
```bash
curl -X POST http://localhost:54321/functions/v1/send-feedback \
  -H "Content-Type: application/json" \
  -d '{"message": "Test feedback message"}'
```

## Security Note

For production, consider moving the Resend API key to Supabase secrets:
```bash
supabase secrets set RESEND_API_KEY=re_B8JZNrvN_3bT1go4rXGJ3jbg6tjXv8WGp
```

Then update the edge function to use:
```typescript
const resend = new Resend(Deno.env.get('RESEND_API_KEY'))
``` 