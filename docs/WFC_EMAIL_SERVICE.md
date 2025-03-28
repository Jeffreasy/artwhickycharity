# WFC Email Service Integration

This document describes the integration of the WFC Email Service into the Whisky For Charity application.

## Overview

The WFC Email Service is a dedicated email service for Whisky For Charity. It provides reliable email delivery for order confirmations and notifications. This service replaces the previous email solutions (Nodemailer, SendGrid, and DKL Email Service).

## Environment Variables

The integration requires the following environment variables:

```env
# WFC Email Service Configuration
WFC_SMTP_HOST=maildrop1.argewebhosting.nl
WFC_SMTP_PORT=465
WFC_SMTP_USER=info@whiskyforcharity.com
WFC_SMTP_PASSWORD=your_password
WFC_SMTP_FROM=info@whiskyforcharity.com
WFC_SMTP_SSL=true
WFC_API_KEY=your_api_key
WFC_ADMIN_EMAIL=admin@whiskyforcharity.com
WFC_SITE_URL=https://whiskyforcharity.com
WFC_BACKEND_URL=http://localhost:3001  # URL of the backend service
```

## Integration Points

1. **Checkout Process**: When a customer completes an order, the checkout form collects their information and sends it to our API endpoint.

2. **API Endpoints**: 
   - `/api/orders/send-emails-wfc` - Main endpoint for order confirmation emails
   - `/api/test-wfc-email` - Test endpoint to verify the email service is working

3. **Backend Service**: The WFC Email Service runs as a separate backend service, accessed via API calls with authentication.

## API Usage

The WFC Email Service expects the following data format for order emails:

```javascript
{
  order: {
    id: 'order-id',
    orderNumber: 'WFC-12345',
    date: '2025-03-28T15:23:36.000Z',
    totalAmount: 150.00,
    items: [
      {
        name: 'Product Name',
        quantity: 1,
        price: 150.00,
        image: 'image-url'
      }
    ]
  },
  customer: {
    name: 'Customer Name',
    email: 'customer@example.com',
    address: 'Customer Address',
    city: 'City',
    postalCode: '1234AB',
    country: 'Country'
  },
  adminEmail: 'admin@whiskyforcharity.com',
  siteUrl: 'https://whiskyforcharity.com'
}
```

## Security

The WFC Email Service implements several security features:

1. API key authentication via `X-API-Key` header
2. SMTP SSL/TLS encryption for email transmission
3. Input validation for all requests

## Testing

You can test the email functionality using the `/api/test-wfc-email` endpoint. This sends a test email to verify that the service is configured correctly.

## Error Handling

The implementation includes comprehensive error handling:

1. Request timeouts to prevent hanging connections
2. Build-time detection to skip API calls during Vercel builds
3. Detailed error logging for easier troubleshooting

## Migration from Previous Solutions

This service replaces the previous email implementations:

1. **Nodemailer Direct SMTP**: Had connection issues with Argeweb
2. **SendGrid**: Had authentication issues with the API key
3. **DKL Email Service**: Was a temporary solution

The WFC Email Service combines the best aspects of these approaches:

- Uses reliable SMTP settings specific to Whisky For Charity
- Provides a dedicated API for email sending
- Handles both customer and admin notifications 