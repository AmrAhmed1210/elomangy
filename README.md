# 3loomangy Web

Official website for 3loomangy (علومنجي) - FSCU student initiative providing study materials, diploma resources, training content, and team information.

## Features

- **Materials Section**: Browse study materials by year, track, semester, and course
- **Diplomas Section**: View available diploma programs and their resources
- **Training Sessions**: Access training videos and organized categories
- **Team Work**: Showcase team projects, events, and services
- **Join Us**: Apply to join the team (controlled by admin)
- **Special Sections**: Additional resources like equivalency exams
- **About Us**: Learn about FSCU and the 3loomangy initiative
- **Admin Dashboard**: Manage all site content including materials, training, team content, join requests, and social links
- **Responsive Design**: Modern UI with animated backgrounds and glass-morphism effects
- **Supabase Integration**: Real-time data fetching from PostgreSQL database

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React
- **Search**: Fuse.js for client-side search
- **Routing**: React Router v6

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase project with PostgreSQL enabled

### Installation

1. Clone the repository:
```bash
git clone https://github.com/AmrAhmed1210/elomangy.git
cd elomangy
```

2. Install dependencies:
```bash
npm install
```

3. Set up Supabase:
- Create a Supabase project at [supabase.com](https://supabase.com)
- Enable PostgreSQL Database
- Copy your Project URL and Anon Key from Settings → API
- Add your Supabase credentials to `.env.local`:
```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

4. Run the database schema:
- Open Supabase SQL Editor
- Copy and run the contents of `supabase-schema.sql`
- This creates all tables and RLS policies

5. Seed the database with sample data:
```bash
npm run seed:supabase
```

6. Start the development server:
```bash
npm run dev
```

## Project Structure

```
src/
├── components/
│   ├── common/          # Reusable components (Card, LoadingSkeleton, EmptyState, ResourceLinkList)
│   ├── layout/          # Layout components (PageLayout, PageHeader, Footer)
│   ├── auth/            # Authentication components (ProtectedAdminRoute)
│   ├── training/        # Training sessions components (VideoCard, CategoryCard, SessionCard)
│   ├── Navbar.jsx
│   └── Footer.jsx
├── pages/
│   ├── Home.jsx
│   ├── Materials.jsx
│   ├── YearDetail.jsx
│   ├── TrackYearDetail.jsx
│   ├── SemesterDetail.jsx
│   ├── CourseDetail.jsx
│   ├── Diplomas.jsx
│   ├── DiplomaDetail.jsx
│   ├── TrainingSessions.jsx
│   ├── SessionDetail.jsx
│   ├── CategoryDetail.jsx
│   ├── Team.jsx
│   ├── JoinUs.jsx
│   ├── SpecialSectionDetail.jsx
│   ├── About.jsx
│   ├── AdminLogin.jsx
│   └── AdminDashboard.jsx
├── contexts/
│   └── AuthContext.jsx   # Authentication context
├── hooks/
│   └── useSiteConfig.jsx # Custom hook for site configuration
├── lib/
│   └── supabase.js      # Supabase configuration
└── index.css           # Global styles
```

## Database Tables

### Content Tables
- `tracks` - Academic tracks (Biochemistry, Biophysics, etc.)
- `semesters` - Semester data linked to tracks
- `courses` - Course data linked to semesters
- `resource_links` - Resource links for courses, diplomas, and special sections
- `diplomas` - Diploma programs
- `special_sections` - Special sections (Equivalency Exams, etc.)
- `dashboard_boxes` - Custom boxes on Materials page

### Training Tables
- `training_sessions` - Training session data
- `training_categories` - Training categories
- `training_videos` - Training video data

### Team Tables
- `team_projects` - Team project showcase
- `team_events` - Team events (upcoming and past)
- `team_services` - Team services offered

### Configuration Tables
- `site_config` - Site configuration (social links, about content, join requests settings)
  - `about_fscu_content` - About page content
  - `facebook_url`, `youtube_url`, `linkedin_url` - Social media links
  - `whatsapp_number`, `email` - Contact information
  - `join_requests_open` - Toggle for Join Us form
  - `join_requests_message` - Custom message when form is closed

### Admin Tables
- `admins` - Admin whitelist with roles (owner/admin)
- `join_requests` - Join Us form submissions

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run seed:supabase` - Seed Supabase with sample data

## Deployment

The app is designed to be deployed to Vercel, Netlify, or any static hosting service.

1. Build the project:
```bash
npm run build
```

2. Add environment variables to your hosting provider:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

3. Deploy the `dist` folder to your hosting provider.

## License

This project is part of the 3loomangy student initiative at FSCU.
