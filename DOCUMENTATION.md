# CSRD GEN3 System Documentation

## System Architecture Overview

This document provides a comprehensive overview of the CSRD GEN3 application's authentication, payment processing, and database update mechanisms. It serves as a reference for future development and troubleshooting.

### Core Components

1. **Authentication**: Auth0 for user authentication and session management
2. **Database**: Supabase for data storage with PostgreSQL
3. **Payment Processing**: Stripe for handling payments and webhooks
4. **Frontend**: Next.js application with React components
5. **API Routes**: Next.js API routes for backend functionality

## Authentication Flow

### Auth0 Integration

The application uses Auth0 for authentication with the following flow:

1. User initiates login via `/api/auth/login`
2. Auth0 handles authentication and redirects to callback URL
3. Callback processes the Auth0 response and creates a session
4. User data is synchronized to Supabase database
5. Middleware checks authentication status for protected routes

### Key Files:

- `app/api/auth/[auth0]/route.ts`: Auth0 API routes for login, callback, and logout
- `app/components/AuthProvider.tsx`: Client-side Auth0 provider
- `app/middleware.ts`: Route protection and authentication verification

### User Data Structure

Auth0 sometimes returns a nested user structure:
```typescript
// Regular structure
{
  email: "user@example.com",
  name: "User Name",
  sub: "auth0|123456789",
  // other properties
}

// Nested structure (needs special handling)
{
  user: {
    email: "user@example.com",
    name: "User Name",
    sub: "auth0|123456789",
    // other properties
  }
}
```

The application handles both structures with code like:
```typescript
const userData = (user?.user || user) as UserData;
const email = userData?.email;
```

## Database Structure

### Supabase Tables

**Users Table**:
- `id`: UUID (primary key)
- `email`: String (unique)
- `stripe_customer_id`: String (nullable)
- `has_paid`: Boolean
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Database Access Patterns

1. **Regular Client** (`supabase`): Used for standard operations, subject to Row Level Security (RLS)
2. **Admin Client** (`supabaseAdmin`): Used for operations that need to bypass RLS

## Payment Processing

### Stripe Integration

The payment flow consists of:

1. User initiates checkout from pricing page
2. Checkout session is created via `/api/create-checkout-session`
3. User completes payment on Stripe-hosted page
4. Stripe sends webhook event to `/api/stripe-webhook`
5. Webhook handler updates user's payment status in database

### Key Files:

- `app/pricing/page.tsx`: Pricing page with checkout button
- `app/api/create-checkout-session/route.ts`: Creates Stripe checkout session
- `app/api/stripe-webhook/route.ts`: Processes Stripe webhook events
- `utils/stripe.ts`: Stripe utility functions and configuration

### Webhook Handler Logic

The webhook handler uses multiple strategies to find and update users:

1. First attempts to find user by email
2. If not found, tries to find by Stripe customer ID
3. If still not found, tries to get customer email from Stripe
4. As a last resort, creates a new user with the available information
5. Uses admin client for critical operations to bypass RLS

## Middleware Protection

The middleware (`app/middleware.ts`) protects routes based on:

1. Authentication status (redirects to login if not authenticated)
2. Payment status (redirects to pricing page if not paid)

It checks the Supabase database to verify if a user has paid before allowing access to protected routes.

## Common Issues and Solutions

### Auth0 Session Issues

**Problem**: User session not recognized or nested user structure causing errors  
**Solution**: Check for both regular and nested user structures, and implement proper error handling

```typescript
// Handle potentially nested user structure
let userData: UserData | undefined;
if (session?.user) {
  userData = session.user;
} else if (session && 'user' in session && session.user) {
  userData = session.user.user;
}
```

### Stripe Webhook Processing Failures

**Problem**: Webhook events not properly updating user payment status  
**Solution**: Implement multiple lookup strategies and fallback mechanisms

```typescript
// Try to find user by email first
if (userEmail) {
  const result = await supabase
    .from('users')
    .select('*')
    .eq('email', userEmail)
    .maybeSingle()
  
  userData = result.data
}

// If email lookup fails, try to find by customer ID
if (!userData && customerId) {
  const result = await supabase
    .from('users')
    .select('*')
    .eq('stripe_customer_id', customerId)
    .maybeSingle()
  
  userData = result.data
}

// Use admin client as a last resort
if (!userData && userEmail) {
  const { data } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('email', userEmail)
    .maybeSingle()
    
  userData = data
}
```

### Database Update Failures

**Problem**: Database updates failing due to RLS or permissions  
**Solution**: Use the admin client for critical operations

```typescript
// Use admin client to bypass RLS
const { error: updateError } = await supabaseAdmin
  .from('users')
  .update({
    has_paid: true,
    stripe_customer_id: customerId
  })
  .eq('id', userData.id)
```

## Testing the System

### Authentication Testing

1. Test login flow with new and existing users
2. Verify session persistence across page refreshes
3. Test logout functionality
4. Verify protected routes are properly restricted

### Payment Testing

1. Test checkout with Stripe test cards:
   - Success: `4242 4242 4242 4242`
   - Failure: `4000 0000 0000 0002`
2. Verify webhook processing with Stripe CLI:
   ```
   stripe listen --forward-to http://localhost:3000/api/stripe-webhook
   ```
3. Check database updates after successful payments
4. Verify access to protected content after payment

## Future Improvements

1. **Consider Supabase Auth0 JWT Integration**: Configure Auth0 as a JWT provider in Supabase for cleaner integration
2. **Implement Payment History**: Track payment history for audit and customer support
3. **Enhance Error Handling**: Add more detailed error logging and user-friendly error messages
4. **Optimize Webhook Handler**: Refactor the complex webhook handler for better maintainability
5. **Add Email Notifications**: Send confirmation emails after successful payments

## Supabase Auth0 JWT Integration (Future Consideration)

If you decide to implement the Supabase Auth0 JWT integration in the future, here's a high-level overview of the process:

1. In Supabase dashboard, go to Authentication > Providers > Auth0
2. Configure the JWT settings with your Auth0 domain and client ID
3. Update your client-side code to pass the Auth0 token to Supabase
4. Test with a small subset of functionality first
5. Gradually migrate your existing user synchronization code

This approach would give you many of the benefits of migrating to Supabase Auth without the full complexity of replacing your entire authentication system.

## Running the Application

### Development Environment

1. Start the Next.js development server:
   ```
   npm run dev
   ```

2. Start the Stripe webhook listener:
   ```
   stripe listen --forward-to http://localhost:3000/api/stripe-webhook
   ```

### Environment Variables

The application requires the following environment variables:

**Auth0 Configuration**:
- `AUTH0_SECRET`
- `AUTH0_BASE_URL`
- `AUTH0_ISSUER_BASE_URL`
- `AUTH0_CLIENT_ID`
- `AUTH0_CLIENT_SECRET`
- `AUTH0_CALLBACK_URL`
- `AUTH0_SCOPE`
- `AUTH0_RESPONSE_TYPE`
- `AUTH0_AUDIENCE`
- `AUTH0_COOKIE_SECRET`

**Supabase Configuration**:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

**Stripe Configuration**:
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`

## Troubleshooting

### Network Connectivity Issues

If you encounter network connectivity issues with Stripe CLI:

```
FATAL Error while authenticating with Stripe: Post "https://api.stripe.com/v1/stripecli/sessions": dial tcp: lookup api.stripe.com: no such host
```

This indicates a DNS resolution failure. Troubleshooting steps:

1. Check your internet connection
2. Reset your network connection
3. Check DNS settings
4. Disable VPN (if applicable)
5. Check your hosts file
6. Try using a cellular hotspot

### Webhook Testing Issues

If webhook events aren't being processed:

1. Ensure the Stripe CLI is running with the correct endpoint:
   ```
   stripe listen --forward-to http://localhost:3000/api/stripe-webhook
   ```

2. Check that the webhook secret in your environment variables matches the one from the Stripe CLI

3. Verify that your server is running and accessible

4. Check the server logs for detailed error messages

---

This documentation provides a comprehensive overview of the current system implementation and should serve as a reference for future development and troubleshooting. 