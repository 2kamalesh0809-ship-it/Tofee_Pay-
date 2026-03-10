# Tofee Pay - White-label Payment Collection Platform

Tofee Pay is a production-ready SaaS platform that allows organizations (gyms, tuition centers, event organizers, etc.) to collect payments easily, manage members, and track transactions.

## Features

- **Multi-tenant Architecture**: Support for multiple organizations with isolated data.
- **Group Management**: Organize members into groups (batches, courses, events).
- **Member Management**: Track member payment status and contact details.
- **Quick Collect Links**: Generate shareable payment links for instant collection.
- **Razorpay Integration**: Seamless payment processing with automated status updates via webhooks.
- **Modern Dashboard**: Clean, responsive UI built with TailwindCSS and Vanilla JS.
- **Security**: JWT authentication, hashed passwords, and webhook signature verification.

## Tech Stack

- **Frontend**: HTML5, TailwindCSS, Vanilla JavaScript (ES6 Modules)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Payment Gateway**: Razorpay

## Setup Instructions

### Prerequisites

- Node.js installed
- MongoDB installed or a MongoDB Atlas URI
- Razorpay account for API keys

### Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd platform/backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file from `.env.example` and fill in your details:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_secret_key
   RAZORPAY_KEY_ID=your_key_id
   RAZORPAY_KEY_SECRET=your_key_secret
   RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
   ```
4. Start the server:
   ```bash
   npm start
   ```

### Frontend Setup

1. The frontend is built using Vanilla JS and TailwindCSS via CDN.
2. Simply serve the `frontend` directory using any static file server (e.g., Live Server in VS Code).
3. Ensure the `API_BASE_URL` in `frontend/js/api.js` points to your running backend.

### Razorpay Webhook Configuration

Set your Razorpay webhook URL to: `https://your-backend-url/api/webhooks/razorpay`
Select `payment.captured` and `payment.failed` events.

## Deployment

- **Frontend**: Deploy to Vercel or Netlify.
- **Backend**: Deploy to Railway, Render, or AWS.
- **Database**: Use MongoDB Atlas.

## License

MIT
