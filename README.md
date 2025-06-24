# Trivex Project

A modern web application built with Next.js, React 19, and Three.js.

## Features
- Next.js 15 with TurboPack for fast development
- React 19 for UI components
- Three.js for 3D graphics rendering
- Nodemailer integration for email functionality
- TypeScript for type safety
- TailwindCSS for styling

## Getting Started

### Prerequisites
- Node.js (version 18 or higher recommended)
- npm or yarn

### Installation
1. Clone the repository
2. Install dependencies:
```bash
npm install
# or
yarn install
```

## Available Scripts

- `npm run dev` - Starts the development server
- `npm run build` - Creates a production build
- `npm run start` - Runs the production server
- `npm run lint` - Runs Next.js linting

## Project Structure

```
trivex/
├── app/                  # Next.js app directory
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── main/             # Main application section
│       └── page.tsx      # Main page
├── api/                  # API routes
│   └── route.js          # API endpoint
├── public/               # Static assets
│   ├── logo.jpg          # Logo image
│   ├── mytsvideo.mp4     # Video asset
│   └── *.svg             # SVG assets
└── utils/                # Utility functions
    └── nodemailer.js     # Email utility
```

## Technologies Used

- [Next.js](https://nextjs.org/) - React framework
- [React 19](https://react.dev/) - UI library
- [Three.js](https://threejs.org/) - 3D library
- [TypeScript](https://www.typescriptlang.org/) - Type checking
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Nodemailer](https://nodemailer.com/) - Email sending

## Configuration

The project comes pre-configured with:
- TypeScript support
- TailwindCSS integration
- Next.js linting rules
