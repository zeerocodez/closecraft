# Closecraft Sales Closer Platform

## Product Purpose
Closecraft is a premium, conversion-focused platform serving two core audiences:
1. Aspiring sales closers seeking training, practice, and remote opportunities.
2. Businesses seeking trained, qualified sales closers for their pipelines.

The platform emphasizes practical skills (Skill → Practice → Proof → Opportunity → Revenue) over traditional classroom models.

## Technology Stack
- **Frontend/Backend:** Next.js (React) with TypeScript
- **Styling:** CSS/Tailwind (using dark navy, warm off-white, electric blue)
- **Animation:** Framer Motion (respecting `prefers-reduced-motion`)
- **Database:** PostgreSQL or SQLite (depending on environment)
- **Validation:** Zod (server and client-side)

## Local Development
1. Install dependencies: `npm install`
2. Start the development server: `npm run dev`
3. Open `http://localhost:3000` to view the site.

## Environment Variables
The application requires several environment variables for database connections, analytics, and secrets. Refer to `.env.example` (to be created) for the required keys. Never commit the actual `.env` file.

## Database Setup & Migration Process
- The application uses migrations to manage database schemas.
- Ensure your database connection string is properly set in the `.env` file.
- Run migrations before starting the application to ensure the `leads` table and other necessary schemas exist.

## Deployment Process
- Run `npm run build` to verify the production build.
- Ensure environment configuration is correct.
- Verify migrations and test live functionality on the staging/production environment before declaring readiness.

## Admin Architecture
An admin layer is planned to view, filter, and manage closer applications and business requests. The initial build will focus on secure database architecture and robust form submissions, preparing the ground for the admin interface.

## Form Architecture
Forms are validated on both the client (for immediate feedback) and server (for security). Malformed input, spam, and invalid data are rejected server-side to protect the database.

## Analytics Architecture
Conversion tracking is prepared for key actions (hero clicks, form submissions, etc.) using clean event names to allow easy integration with analytics providers later.

## Asset Requirements
- Compressed media and lazy-loaded assets.
- Responsive mobile variants for videos.
- Proper SEO metadata, Open Graph images, and semantic HTML structure.
