# Growth_By_Design
Help your Startup achieve Growth By Design

# Growth By Design App

A modern, well-organized Next.js application with TypeScript, Tailwind CSS, and a scalable directory structure.

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
.
├── .gitignore
├── .eslintrc.json
├── next.config.mjs
├── package.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
├── README.md
├── public/
│   └── favicon.ico
└── src/
    ├── app/
    │   ├── api/
    │   │   ├── users/
    │   │   │   ├── [userId]/
    │   │   │   │   └── route.ts      # Individual user operations (GET, PUT, DELETE)
    │   │   │   └── route.ts          # User collection operations (GET all, POST)
    │   │   └── products/
    │   │       └── route.ts          # Product operations (GET all, POST)
    │   ├── layout.tsx                # Root application layout
    │   ├── page.tsx                  # Homepage
    │   └── globals.css               # Global styles with Tailwind
    │
    ├── components/
    │   ├── ui/                       # Reusable UI components
    │   │   ├── Button.tsx
    │   │   └── Input.tsx
    │   └── features/                 # Feature-specific components
    │       └── UserCard.tsx
    │
    ├── lib/
    │   ├── api.ts                    # API utility functions
    │   └── utils.ts                  # Helper functions and utilities
    │
    └── styles/
        └── main.scss                 # Additional global styles (optional)
```

## 🛠 Tech Stack

- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Linting:** ESLint with Next.js config

## 📡 API Endpoints

The application includes example API endpoints:

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create a new user
- `GET /api/users/[id]` - Get user by ID
- `PUT /api/users/[id]` - Update user by ID
- `DELETE /api/users/[id]` - Delete user by ID

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create a new product

## 🎨 Components

### UI Components (`src/components/ui/`)
- **Button**: Reusable button with variants (primary, secondary, outline) and sizes
- **Input**: Form input with label and error handling

### Feature Components (`src/components/features/`)
- **UserCard**: Display user information with edit/delete actions

## 🔧 Utilities (`src/lib/`)

- **api.ts**: HTTP request utilities and API functions
- **utils.ts**: Common helper functions (formatting, debouncing, etc.)

## 📱 Responsive Design

The application is fully responsive and includes:
- Mobile-first design approach
- Dark mode support
- Modern UI with smooth animations
- Accessible components

## 🚀 Deployment

This Next.js application can be deployed to:
- Vercel (recommended)
- Netlify
- AWS
- Any platform supporting Node.js

## 📝 Development

### Adding New API Endpoints

1. Create a new folder in `src/app/api/`
2. Add a `route.ts` file with your HTTP method handlers
3. For dynamic routes, use bracket notation: `[id]/route.ts`

### Adding New Components

1. **UI Components**: Add to `src/components/ui/` for reusable elements
2. **Feature Components**: Add to `src/components/features/` for specific functionality

### Adding Utilities

Add helper functions to `src/lib/utils.ts` or create new files in the `src/lib/` directory.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
