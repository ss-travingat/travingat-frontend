This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Architecture

This frontend is part of a modular monolith repository. See the root architecture guide at `../ARCHITECTURE.md` for backend and frontend module boundaries.

Feature entrypoints now live in `src/modules/*` and route pages should prefer importing from those module indexes.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Email Service Config (Vercel)

The backend delegates OTP and magic-link email delivery to this frontend app via an internal API route.

Required environment variables:

- `INTERNAL_EMAIL_API_SECRET`: shared secret expected by `POST /api/internal/email/send`
- `SMTP_HOST`: SMTP host (use `smtp.gmail.com`)
- `SMTP_PORT`: SMTP port (`587` for STARTTLS or `465` for SSL)
- `SMTP_USER`: Gmail address
- `SMTP_PASS`: Gmail app password
- `EMAIL_FROM`: sender identity (example: `Travingat <noreply@app.travingat.com>`)

The backend should call:

- `https://app.travingat.com/api/internal/email/send`
