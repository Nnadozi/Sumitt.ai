# Supabase Edge Function Setup

This directory contains the Supabase edge function for sending feedback emails using Resend.

## Setup Instructions

1. **Install Supabase CLI** (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**:
   ```bash
   supabase login
   ```

3. **Initialize Supabase in your project** (if not already done):
   ```bash
   supabase init
   ```

4. **Link your project**:
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

5. **Deploy the edge function**:
   ```bash
   supabase functions deploy send-feedback
   ```

6. **Get your function URL**:
   After deployment, you'll get a URL like:
   `https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-feedback`

7. **Update the FeedbackModal component**:
   Replace `YOUR_SUPABASE_EDGE_FUNCTION_URL` in `components/FeedbackModal.tsx` with your actual function URL.

## Environment Variables

The edge function uses your Resend API key directly in the code. For production, consider using Supabase secrets:

```bash
supabase secrets set RESEND_API_KEY=re_B8JZNrvN_3bT1go4rXGJ3jbg6tjXv8WGp
```

Then update the edge function to use:
```typescript
const resend = new Resend(Deno.env.get('RESEND_API_KEY'))
```

## Domain Verification

You'll need to verify your domain with Resend. For now, the function uses `feedback@sumitt.app` as the sender. You can:

1. Verify your domain with Resend
2. Or use a verified domain you already have
3. Or use Resend's sandbox domain for testing

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