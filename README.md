# Pelindo Survey Portal

This is a comprehensive survey management and data collection application built with **Next.js**, **React**, **TailwindCSS**, and **Supabase**.

## Features

* **Admin Dashboard (`/master`)**:
  * Manage survey entities.
  * Manage accounts and access control.
  * View and analyze survey results.
  * Manage surveys, including creating and editing questions.
* **Survey Interface (`/survey`)**:
  * Dynamic, user-friendly survey forms accessible via unique Survey IDs.
  * Identity verification before participating in surveys.
* **Authentication (`/login`)**:
  * Secure login system for admins and authorized users.
* **API Endpoints (`/api`)**:
  * Custom API routes for handling authentication, master data operations, and survey submissions securely.
* **Data Export**:
  * Integrated with `xlsx` for exporting survey results.

## Tech Stack

* **Framework**: [Next.js](https://nextjs.org) (App Router)
* **Styling**: [Tailwind CSS](https://tailwindcss.com) & PostCSS
* **Backend & Database**: [Supabase](https://supabase.com)
* **Authentication**: Next.js custom API routes & `bcryptjs`
* **Data Fetching**: [SWR](https://swr.vercel.app)
* **Animations**: [GSAP](https://gsap.com)
* **Other Utilities**: `xlsx` (Excel exports), `jose` (JWT handling)

## Project Structure

```text
├── app/
│   ├── api/           # Backend API routes (auth, master data, survey operations)
│   ├── login/         # Login page for authentication
│   ├── master/        # Admin panel (accounts, entities, results, survey builder)
│   ├── survey/        # Public survey participation pages
│   ├── globals.css    # Global styles
│   └── layout.tsx     # Root layout component
├── public/            # Static assets
└── src/               # Additional utility functions and shared components
```

## Getting Started

First, make sure you have your `.env.local` configured with the necessary environment variables (e.g., Supabase URLs and Keys).

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
