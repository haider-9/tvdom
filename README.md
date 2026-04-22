# TVDom

A modern, elegant TV and Movie discovery platform built with SvelteKit and Appwrite. Discover, explore, and track your favorite movies, TV shows, and celebrities with a beautiful, Netflix-inspired interface.

## 🚀 Features

- **Movie & TV Discovery**: Browse trending, popular, and top-rated content
- **User Authentication**: Secure login and registration with Appwrite
- **Personal Ratings**: Rate and review movies, TV shows, and celebrities
- **Watchlist Management**: Add items to your watchlist and track what you've watched
- **Social Features**: Follow other users and see their activity
- **Person Profiles**: Detailed information about actors, directors, and crew
- **Real-time Updates**: Live updates powered by Appwrite's real-time capabilities
- **Responsive Design**: Beautiful interface that works on all devices

## 🛠 Tech Stack

- **Frontend**: SvelteKit, TypeScript, Tailwind CSS
- **Backend**: Appwrite (Database, Authentication, Storage)
- **APIs**: The Movie Database (TMDB)
- **Image Storage**: Cloudinary
- **Deployment**: Vercel/Netlify compatible

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/tvdom.git
   cd tvdom
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your environment variables:
   - `TMDB_API_KEY`: Get from [TMDB](https://www.themoviedb.org/settings/api)
   - `PUBLIC_CLOUDINARY_*`: Get from [Cloudinary](https://cloudinary.com/)
   - `PUBLIC_APPWRITE_*`: Get from [Appwrite](https://appwrite.io/)

4. **Set up Appwrite database**
   ```bash
   node scripts/setup-appwrite.js
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 🗄️ Database Setup

This project uses Appwrite as the backend. To set up the database:

1. Create an Appwrite project at [Appwrite Cloud](https://cloud.appwrite.io)
2. Add your project credentials to `.env`
3. Run the setup script: `node scripts/setup-appwrite.js`

The script will create:
- Database: `tvdom_main`
- Collections: `users`, `ratings`, `watchlist`, `watched`, `follows`, `person_ratings`, `person_favorites`, `currently_watching`

## 🔧 Configuration

### Appwrite Collections

The application uses the following Appwrite collections:

- **users**: User profiles and metadata
- **ratings**: Movie/TV show ratings and reviews
- **watchlist**: User watchlist items
- **watched**: Items marked as watched
- **follows**: User follow relationships
- **person_ratings**: Celebrity/person ratings
- **person_favorites**: Favorite celebrities
- **currently_watching**: Real-time watching status

### Environment Variables

```env
# TMDB API
TMDB_API_KEY=your_tmdb_api_key
TMDB_ACCESS_TOKEN=your_tmdb_access_token

# Cloudinary
PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

# Appwrite
PUBLIC_APPWRITE_PROJECT_ID=your_project_id
PUBLIC_APPWRITE_PROJECT_NAME=your_project_name
PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_API_KEY=your_server_api_key
```

## 🚀 Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to your preferred platform**
   - Vercel: `vercel deploy`
   - Netlify: `netlify deploy`
   - Or any other SvelteKit-compatible platform

## 📱 Features Overview

### Authentication
- Secure user registration and login
- Session management with Appwrite
- Password reset functionality

### Media Discovery
- Browse movies and TV shows
- Search functionality
- Filter by genre, year, rating
- Trending and popular content

### User Features
- Personal ratings and reviews
- Watchlist management
- Watch history tracking
- Social following system

### Real-time Features
- Live activity feeds
- Real-time notifications
- Currently watching status

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [The Movie Database (TMDB)](https://www.themoviedb.org/) for the comprehensive movie and TV data
- [Appwrite](https://appwrite.io/) for the powerful backend-as-a-service platform
- [SvelteKit](https://kit.svelte.dev/) for the amazing full-stack framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Check the [Appwrite documentation](https://appwrite.io/docs)
- Visit the [SvelteKit documentation](https://kit.svelte.dev/docs)

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


