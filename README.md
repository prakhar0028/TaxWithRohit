# TaxWithRohit

TaxWithRohit is an Indian tax filing and compliance platform for taxpayers, Chartered Accountants, and administrators. It combines guided ITR filing, tax calculations, document management, tax notice support, investment tools, expert services, and an AI tax assistant in one application.

Production domain: [taxwithrohit.com](https://taxwithrohit.com/)

## Features

- Guided income tax return filing for FY 2024-25 / AY 2025-26
- Old versus New Tax Regime comparison
- Income tax, HRA, SIP, and other calculators
- Document Vault for Form 16 and supporting documents
- Tax notice tracking and compliance assistance
- Chartered Accountant expert workspace
- Investment and financial planning tools
- Subscription plans and payment integration points
- AI tax assistant powered by Google Gemini with a rule-based fallback engine
- Role-based views for taxpayers, tax experts, and administrators

## Tech Stack

- React 19 and TypeScript
- Vite and Tailwind CSS
- Express API server
- Prisma schema for PostgreSQL integration
- Google Gemini AI
- Recharts, Motion, and Lucide React

## Requirements

- Node.js 20 or later
- Bun or npm
- A Google Gemini API key for live AI responses

## Getting Started

Install dependencies:

```bash
bun install
```

Create a local environment file:

```powershell
Copy-Item .env.example .env
```

Set at least the following value in `.env`:

```env
GEMINI_API_KEY=your_gemini_api_key
```

Start the development server:

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser.

The same commands can be run with npm by replacing `bun install` with `npm install` and `bun run` with `npm run`.

## Available Scripts

| Command | Description |
| --- | --- |
| `bun run dev` | Start the Express and Vite development server |
| `bun run lint` | Run the TypeScript compiler without emitting files |
| `bun run build` | Build the frontend and bundle the production server |
| `bun run start` | Start the compiled production server |
| `bun run preview` | Preview the Vite frontend build |
| `bun run clean` | Remove generated build output |

## Environment Configuration

The complete variable list is available in [.env.example](.env.example). Common settings include:

| Variable | Purpose |
| --- | --- |
| `PORT` | Port used by the server. Defaults to `3000` locally. |
| `GEMINI_API_KEY` | Enables live Gemini AI responses. |
| `DATABASE_URL` | PostgreSQL connection string. |
| `OTP_PROVIDER` | OTP provider: `mock`, `msg91`, or `twilio`. |
| `DEV_OTP` | Enables the development OTP helper when set to `true`. |
| `STORAGE_PROVIDER` | File storage provider: `local`, `cloudinary`, or `s3`. |
| `RAZORPAY_KEY_ID` | Razorpay payment integration key. |

For local development, OTP and storage use mock/local implementations by default. Configure production providers and secrets before launching publicly.

## Production Deployment

Build the application:

```bash
bun run build
```

Start the compiled server:

```bash
bun run start
```

The server listens on `process.env.PORT` when provided, otherwise it uses port `3000`. A hosting provider should supply the `PORT` value automatically.

For a public deployment:

1. Deploy the repository to a Node.js hosting provider such as Render, Railway, Fly.io, or a VPS.
2. Set the build command to `bun run build` and the start command to `bun run start`.
3. Add the required environment variables from `.env.example` in the provider dashboard.
4. Add `taxwithrohit.com` as a custom domain in the hosting provider.
5. Point the domain DNS records to the provider as instructed by that provider.
6. Enable HTTPS and verify both `https://taxwithrohit.com` and the `www` redirect if configured.

The domain cannot resolve to a local machine until it is deployed to a public host and its DNS records are configured.

## Project Structure

```text
src/
  components/   Shared layout, common UI, and feature views
  config/       Seed data and subscription configuration
  context/      Authentication and tax application state
  lib/          Database and utility helpers
  services/     Tax engine, AI, OTP, payment, cache, and storage services
  types/        Shared TypeScript types
server.ts       Express API server and production entry point
prisma/         Prisma database schema
```

## Security Notes

- Never commit `.env` or production secrets.
- Replace mock OTP, local storage, and demo authentication before production use.
- Configure a production database, session secret, payment credentials, and storage provider.
- Tax calculations and AI responses are informational and should be reviewed by a qualified tax professional before filing.
