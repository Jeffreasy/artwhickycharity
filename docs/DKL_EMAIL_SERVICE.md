# DKL Email Service Integration

This document describes how we've integrated the DKL Email Service into our Whisky For Charity application.

## Overview

The DKL Email Service is a robust and scalable email service written in Go. It provides a comprehensive solution for email handling, including contact form emails, registration notifications, and admin notifications. We've integrated this service to handle our order confirmation emails.

## Integration Points

1. **Checkout Process**: When a customer completes an order, the checkout form sends the order information to our API endpoint.

2. **API Endpoint**: We've created a dedicated API endpoint (`/api/orders/send-emails-dkl`) that formats the order information and sends it to the DKL Email Service.

3. **Email Templates**: The DKL Email Service uses HTML templates for emails, which provide a responsive design and support dynamic content.

## Configuration

The integration requires the following environment variables:

```env
DKL_EMAIL_SERVICE_URL=https://dklemailservice.onrender.com
DKL_EMAIL_API_KEY=your_api_key_here
```

## API Endpoints Used

We're primarily using these endpoints from the DKL Email Service:

1. `/api/contact-email` - For customer order confirmations
2. `/api/aanmelding-email` - For admin notifications

## Testing

A test endpoint is available at `/api/test-dkl-email` to verify the DKL Email Service connection. This endpoint sends a simple test email to check if the service is working correctly.

## Error Handling

Our implementation includes comprehensive error handling:

1. Connection errors with detailed logging
2. Fallback mechanisms if email sending fails
3. Clear status messaging to the user

## Security

The DKL Email Service implements several security features:

1. API key authentication
2. Rate limiting
3. Input validation

## Next Steps

To complete the integration:

1. Obtain a valid API key from the DKL Email Service administrator
2. Update the `.env.local` file with the API key
3. Test the email sending via the test endpoint
4. Monitor email sending in production

## Documentation

For complete details on the DKL Email Service, refer to:

[DKL Email Service Documentation](https://github.com/Jeffreasy/dklemailservice) 