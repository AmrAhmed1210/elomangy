# 3loomangy Web

Official website for 3loomangy (علومنجي) - FSCU student initiative providing study materials, diploma resources, and training content.

## Features

- **Materials Section**: Browse study materials by year, track, semester, and course
- **Diplomas Section**: View available diploma programs and their resources
- **Training Sessions**: Access training videos and organized categories
- **About Us**: Learn about FSCU and the 3loomangy initiative
- **Responsive Design**: Modern UI with animated backgrounds and glass-morphism effects
- **Firebase Integration**: Real-time data fetching from Firestore

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore
- **Icons**: Lucide React
- **Search**: Fuse.js for client-side search
- **Routing**: React Router v6

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase project with Firestore enabled

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

3. Set up Firebase:
- Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
- Enable Firestore Database
- Create a web app and copy the Firebase config
- Add your Firebase config to `src/lib/firebase.js`

4. Seed Firestore with sample data:
```bash
npm run seed
```

5. Start the development server:
```bash
npm run dev
```

## Project Structure

```
src/
├── components/
│   ├── common/          # Reusable components (LoadingSkeleton, EmptyState)
│   ├── training/        # Training sessions components
│   ├── Navbar.jsx
│   └── Footer.jsx
├── pages/
│   ├── Home.jsx
│   ├── Materials.jsx
│   ├── Diplomas.jsx
│   ├── About.jsx
│   └── TrainingSessions.jsx
├── lib/
│   └── firebase.js      # Firebase configuration
└── index.css           # Global styles
```

## Firebase Collections

- `tracks` - Academic tracks (Biochemistry, Biophysics, etc.)
- `semesters` - Semester data linked to tracks
- `courses` - Course data linked to semesters
- `resourceLinks` - Resource links for courses and diplomas
- `diplomas` - Diploma programs
- `specialSections` - Special sections (Equivalency Exams, etc.)
- `trainingSessions` - Training session data
- `trainingCategories` - Training categories
- `trainingVideos` - Training video data
- `siteConfig` - Site configuration (social links, about content)
- `teamProjects` - Team project showcase
- `teamEvents` - Team events
- `teamServices` - Team services

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run seed` - Seed Firestore with sample data

## Deployment

The app is designed to be deployed to Vercel, Netlify, or any static hosting service.

1. Build the project:
```bash
npm run build
```

2. Deploy the `dist` folder to your hosting provider.

## License

This project is part of the 3loomangy student initiative at FSCU.
