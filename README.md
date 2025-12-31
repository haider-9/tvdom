# TVDom

A modern, elegant TV and Movie discovery platform built with SvelteKit and TMDB API. Discover, explore, and track your favorite movies, TV shows, and celebrities with a beautiful, Netflix-inspired interface.

## ✨ Features

### 🎬 Movies & TV Shows
- Browse popular, trending, top-rated, now playing, and upcoming content
- Horizontal scrollable carousels for elegant browsing
- Detailed pages with cast, crew, trailers, and similar recommendations
- Genre-based filtering and discovery
- Rich backdrop and poster imagery

### 👥 People & Celebrities
- Discover popular actors, directors, and creators
- Detailed person pages with biography and career information
- Complete filmography with movie and TV credits

### 🔍 Search & Discovery
- Real-time search across movies, TV shows, and people
- Multiple category tabs for easy navigation
- Pagination support for browsing large result sets

### 🎨 Design & UX
- Modern, Netflix-inspired card designs with backdrop images
- Smooth horizontal scrolling sections
- Elegant hover effects and transitions
- Fully responsive design for all screen sizes
- Dark mode optimized interface
- Custom purple-themed color scheme

### ⚡ Performance
- Server-side rendering for optimal SEO
- Efficient data loading with SvelteKit
- Image lazy loading
- Optimized API calls

## Tech Stack

- **Framework**: SvelteKit
- **UI Components**: shadcn-svelte
- **Styling**: TailwindCSS with custom theme
- **API**: The Movie Database (TMDB)
- **Icons**: Lucide Svelte
- **Notifications**: Svelte Sonner

## Getting Started

### Prerequisites

- Node.js 18+ installed
- TMDB API key and access token

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

4. Add your TMDB credentials to `.env`:

```
TMDB_API_KEY=your_api_key_here
TMDB_ACCESS_TOKEN=your_access_token_here
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## 📁 Project Structure

```
tvdom/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── ui/              # shadcn-svelte UI components
│   │   │   ├── MediaCard.svelte # Movie/TV show card component
│   │   │   ├── PersonCard.svelte # Person/celebrity card component
│   │   │   ├── Hero.svelte      # Homepage hero section
│   │   │   ├── Navbar.svelte    # Navigation bar
│   │   │   └── Footer.svelte    # Footer component
│   │   ├── tmdb.ts              # TMDB API client with all endpoints
│   │   ├── types.ts             # TypeScript type definitions
│   │   ├── constants.ts         # App constants
│   │   └── utils.ts             # Utility functions
│   ├── routes/
│   │   ├── [type]/[id]/         # Dynamic movie/TV detail pages
│   │   ├── movies/              # Movies listing with categories
│   │   ├── tv/                  # TV shows listing with categories
│   │   ├── people/              # Popular people listing
│   │   ├── person/[id]/         # Person detail page with gallery
│   │   ├── search/              # Search functionality
│   │   └── +page.svelte         # Homepage with trending content
│   ├── app.css                  # Global styles with custom theme
│   └── app.html                 # HTML template
├── static/                      # Static assets
└── package.json
```

## 🎯 Key Pages

### Homepage (`/`)
- Hero section with featured content
- Trending movies and TV shows
- Quick navigation to all sections

### Movies (`/movies`)
- Popular, Trending, Top Rated, Now Playing, Upcoming sections
- Genre browsing
- Pagination support

### TV Shows (`/tv`)
- Popular, Trending, Top Rated, Airing Today sections
- Genre browsing
- Pagination support

### Movie/TV Detail (`/movie/:id` or `/tv/:id`)
- Full details with backdrop and poster
- Cast and crew information (horizontal scrollable)
- Watch trailer button
- Budget, revenue, runtime information
- Similar recommendations
- Production companies

### People (`/people`)
- Popular actors, directors, and creators
- Grid layout with pagination

### Person Detail (`/person/:id`)
- Biography and personal information
- Photo gallery with lightbox viewer
- Complete filmography (movies and TV shows)
- Horizontal scrollable credits

### Search (`/search`)
- Real-time search across all content types
- Filtered results by category

## 🔌 API Integration

All API calls are handled server-side using SvelteKit's `+page.server.ts` load functions:
- **Better Performance**: Faster initial page loads
- **SEO Optimization**: Content is rendered server-side
- **Security**: API keys never exposed to client
- **Type Safety**: Full TypeScript support

### Available TMDB Endpoints
- Movies: Popular, Trending, Top Rated, Upcoming, Now Playing
- TV Shows: Popular, Trending, Top Rated, Airing Today
- People: Popular, Details, Combined Credits, Images
- Search: Multi-search across all content
- Details: Full information with credits, videos, similar content

## 🎨 UI Components

Built with **shadcn-svelte** for beautiful, accessible components:
- **Button**: Actions and navigation with href support
- **Card**: Content containers for media items
- **Input**: Search and form inputs
- **Badge**: Ratings, genres, and metadata
- **Skeleton**: Loading states
- **Dialog**: Modals and overlays

To add more components:
```bash
npx shadcn-svelte@latest add [component-name]
```

## 🎭 Design System

### Theme
- **Color Scheme**: Custom purple theme with OKLCH color space
- **Typography**: Montserrat font family
- **Dark Mode**: Optimized for dark backgrounds
- **Spacing**: Consistent spacing scale

### Card Designs
- **MediaCard**: Backdrop image with overlaid poster, rating badge, and overview
- **PersonCard**: Portrait with gradient overlay and popularity score
- Hover effects with scale and shadow animations
- Smooth transitions throughout

### Layout Patterns
- Horizontal scrollable sections with snap-to-grid
- Responsive grid layouts
- Container-based spacing
- Mobile-first approach


