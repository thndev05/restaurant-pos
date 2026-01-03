# SePay Bank Transfer Payment Integration

This guide explains how to set up and use the SePay webhook integration for bank transfer payments in the Restaurant POS system.

## Overview

The SePay integration allows customers to pay via bank transfer using QR codes. When a customer scans the QR code and completes the transfer, SePay automatically sends a webhook notification to update the payment status.

## Features

- ✅ Generate QR codes for bank transfer payments
- ✅ Automatic payment confirmation via webhook
- ✅ Transaction ID tracking
- ✅ Support for both dine-in and takeaway orders
- ✅ Real-time payment status updates

## Setup Instructions

### 1. Environment Configuration

Add the following to your `.env` file in the backend directory:

```env
# SEPAY CONFIGURATION
SEPAY_BANK_ACCOUNT=00002084815
SEPAY_BANK_NAME=TPBank
SEPAY_ACCOUNT_HOLDER=Your Account Name
```

Replace the values with your actual bank account details.

### 2. Configure SePay Webhook

1. Go to [SePay Dashboard](https://my.sepay.vn)
2. Navigate to **WebHooks** menu
3. Click **Add New Webhook**
4. Fill in the details:
   - **Name**: `RestaurantPOS`
   - **Event**: Select "Có tiền vào" (Money In)
   - **Account**: Select your TPBank account
   - **Skip if no payment code**: Choose "Có" (Yes)
   - **Webhook URL**: `https://f918a2d6ff45.ngrok-free.app/v1/webhooks/sepay`
   - **Authentication**: "Không cần chứng thực" (No Authentication)
   - **Content Type**: `application/json`
   - **Retry on**: Select "HTTP Status Code không nằm trong phạm vi từ 200 đến 299"

5. Click **Save**

### 3. Ngrok Setup (for local development)

The webhook URL is already configured to use your ngrok tunnel:
```
https://f918a2d6ff45.ngrok-free.app/v1/webhooks/sepay
```

Make sure your ngrok tunnel is running and forwarding to `localhost:3000`.

## How It Works

### Payment Flow

1. **Customer selects BANKING payment method**
   - Staff creates payment in the system
   - System generates unique Transaction ID (format: TX1234567890)
   - Payment status: PENDING

2. **QR Code is displayed**
   - Contains bank account details
   - Transfer amount
   - Transfer content with Transaction ID

3. **Customer scans and pays**
   - Opens banking app
   - Scans QR code
   - Confirms transfer

4. **SePay webhook notification**
   - SePay detects the transfer
   - Sends POST request to webhook endpoint
   - System extracts Transaction ID from transfer content
   - Finds matching payment

5. **Automatic payment confirmation**
   - Payment status: SUCCESS
   - Session/Order status: PAID
   - Table status: AVAILABLE
   - Staff receives confirmation

## API Endpoints

### Create Payment
```http
POST /payments
```
Creates a new payment. For BANKING method, payment status starts as PENDING.

**Request Body:**
```json
{
  "sessionId": "uuid",
  "orderId": "uuid",
  "totalAmount": "100000",
  "subTotal": "90909.09",
  "tax": "9090.91",
  "discount": "0",
  "paymentMethod": "BANKING",
  "notes": "Optional notes"
}
```

**Response:**
```json
{
  "code": 201,
  "message": "Payment created successfully. Waiting for bank transfer confirmation.",
  "data": {
    "id": "payment-uuid",
    "transactionId": "TX1234567890",
    "status": "PENDING",
    ...
  }
}
```

### Get Payment QR Code
```http
GET /payments/:id/qr-code
```
Returns QR code URL and bank transfer information.

**Response:**
```json
{
  "code": 200,
  "message": "QR code generated successfully",
  "data": {
    "paymentId": "payment-uuid",
    "transactionId": "TX1234567890",
    "amount": 100000,
    "status": "PENDING",
    "accountNumber": "00002084815",
    "bankName": "TPBank",
    "accountHolder": "Your Account Name",
    "content": "Thanh toan TX1234567890",
    "qrCodeUrl": "https://qr.sepay.vn/img?acc=00002084815&bank=TPBank&amount=100000&des=Thanh%20toan%20TX1234567890"
  }
}
```

### SePay Webhook (Public)
```http
POST /v1/webhooks/sepay
```
Receives bank transfer notifications from SePay.

**Request Body:**
```json
{
  "id": 92704,
  "gateway": "TPBank",
  "transactionDate": "2023-03-25 14:02:37",
  "accountNumber": "00002084815",
  "code": null,
  "content": "Thanh toan TX1234567890",
  "transferType": "in",
  "transferAmount": 100000,
  "accumulated": 19077000,
  "subAccount": null,
  "referenceCode": "MBVCB.3278907687",
  "description": "Full SMS content"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment processed successfully",
  "paymentId": "payment-uuid"
}
```

## Transaction ID Format

Transaction IDs are automatically generated with the following format:
- Prefix: `TX`
- Length: 12 characters total (TX + 10 random characters)
- Characters: A-Z (excluding I, O), 2-9
- Example: `TX1234567890`, `TXABC3D5E6F7`

This format:
- Avoids confusing characters (I, O, 1, 0)
- Easy to read and communicate
- Unique and trackable

## Testing

### Local Testing with Ngrok

1. Start backend server:
```bash
cd backend
npm run start:dev
```

2. Ensure ngrok is running:
```bash
ngrok http 3000
```

3. Create a test payment with BANKING method
4. Use SePay sandbox to simulate transfer
5. Check webhook logs at SePay dashboard

### Webhook Testing

You can test the webhook endpoint manually:

```bash
curl -X POST https://f918a2d6ff45.ngrok-free.app/v1/webhooks/sepay \
  -H "Content-Type: application/json" \
  -d '{
    "id": 92704,
    "gateway": "TPBank",
    "transactionDate": "2023-03-25 14:02:37",
    "accountNumber": "00002084815",
    "content": "Thanh toan TX1234567890",
    "transferType": "in",
    "transferAmount": 100000,
    "accumulated": 19077000,
    "referenceCode": "MBVCB.3278907687",
    "description": "Transfer message"
  }'
```

## Frontend Usage

The payment dialog automatically shows the QR code when BANKING payment method is selected:

```tsx
// Payment method selection
<Select value={paymentMethod} onValueChange={setPaymentMethod}>
  <SelectItem value="CASH">Cash</SelectItem>
  <SelectItem value="BANKING">Bank Transfer</SelectItem>
  <SelectItem value="CARD">Credit/Debit Card</SelectItem>
</Select>

// QR code is displayed automatically after creating payment
```

## Security Notes

- ✅ Webhook endpoint is public (no authentication required by SePay)
- ✅ Transaction ID validation ensures only valid payments are processed
- ✅ Amount verification prevents wrong payment amounts
- ✅ Duplicate payment prevention (status check)
- ✅ Transaction logging for audit trail

## Troubleshooting

### Webhook not receiving notifications

1. Check ngrok is running: `https://f918a2d6ff45.ngrok-free.app`
2. Verify webhook URL in SePay dashboard: `https://f918a2d6ff45.ngrok-free.app/v1/webhooks/sepay`
3. Check backend logs for incoming requests
4. Verify firewall/network settings

### Payment not auto-confirming

1. Check transfer content includes Transaction ID
2. Verify Transaction ID format is correct
3. Check webhook logs in SePay dashboard
4. Review backend logs for errors

### QR Code not displaying

1. Check environment variables are set
2. Verify payment was created successfully
3. Check browser console for errors

## Production Deployment

For production deployment:

1. Replace ngrok URL with your production domain
2. Update webhook URL in SePay dashboard
3. Ensure HTTPS is enabled
4. Set up proper monitoring and logging
5. Configure error notifications

## Support

For issues related to:
- **SePay integration**: Contact [SePay Support](https://sepay.vn)
- **Technical issues**: Check application logs
- **Transaction issues**: Review webhook logs in SePay dashboard
