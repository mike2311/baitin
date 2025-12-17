# Task 02-03: Frontend Foundation (React + TypeScript)

## Task Information

- **Phase**: 0 - Foundation
- **Sprint**: Week 3
- **Priority**: High
- **Estimated Effort**: 3 days
- **Dependencies**: Task 01-01 (Development Environment)
- **Assignee**: Frontend Developer

## Objective

Set up React + TypeScript frontend foundation with Vite, routing, state management, API client, and project structure.

## Requirements

### 1. React Project Setup

#### Project Structure
```
src/
├── main.tsx
├── App.tsx
├── components/
│   └── ui/ (shadcn/ui components)
├── pages/
├── hooks/
├── services/
│   └── api/
├── store/
│   └── contexts/
├── types/
├── utils/
└── lib/
```

#### Technology Stack
- React 18+
- TypeScript 5+
- Vite (build tool)
- React Router (routing)
- React Query (server state)
- React Hook Form (forms)
- Axios or Fetch (API client)

### 2. shadcn/ui Setup

#### Installation
- Install shadcn/ui
- Configure components.json
- Set up Tailwind CSS
- Add initial components

#### Initial Components
- Button
- Input
- Label
- Form
- Dialog
- Select

### 3. Routing Setup

#### Routes
- `/login` - Login page
- `/dashboard` - Dashboard (protected)
- Route protection with authentication

#### Route Guards
- Protected route component
- Redirect to login if not authenticated
- Store return URL

### 4. State Management

#### React Query Setup
- Query client configuration
- Default options
- Error handling
- Caching strategy

#### Context API
- Auth context
- User context
- Theme context (if needed)

### 5. API Client Setup

#### Axios/Fetch Configuration
- Base URL configuration
- Request interceptors (add token)
- Response interceptors (handle errors)
- Error handling

### 6. Type Definitions

#### API Types
- Request/response types
- Entity types
- DTO types

## Implementation Steps

1. **Initialize React Project**
   - Create Vite + React + TypeScript project
   - Configure TypeScript
   - Set up folder structure

2. **Install Dependencies**
   - React Router
   - React Query
   - React Hook Form
   - Axios
   - shadcn/ui
   - Tailwind CSS

3. **Set Up shadcn/ui**
   - Initialize shadcn/ui
   - Configure components.json
   - Add initial components

4. **Set Up Routing**
   - Configure React Router
   - Create route components
   - Set up protected routes

5. **Set Up React Query**
   - Configure QueryClient
   - Set up QueryClientProvider
   - Configure default options

6. **Set Up API Client**
   - Configure Axios/Fetch
   - Set up interceptors
   - Create API service structure

7. **Create Auth Context**
   - Auth context provider
   - Login/logout functions
   - Token management

8. **Create Basic Layout**
   - Main layout component
   - Navigation component
   - Footer component

## Acceptance Criteria

- [ ] React project initialized with Vite
- [ ] TypeScript configured correctly
- [ ] shadcn/ui installed and configured
- [ ] Routing set up and working
- [ ] React Query configured
- [ ] API client configured
- [ ] Auth context working
- [ ] Protected routes working
- [ ] Login page accessible
- [ ] Dashboard accessible (when authenticated)
- [ ] Project structure organized

## Project Configuration

### vite.config.ts
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
```

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## API Client Example

```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

## Testing Checklist

- [ ] Application starts successfully
- [ ] Routing works correctly
- [ ] Protected routes redirect to login
- [ ] Login page accessible
- [ ] API client makes requests
- [ ] React Query works
- [ ] Auth context provides user info
- [ ] shadcn/ui components render

## Notes

- Use environment variables for API URL
- Set up path aliases for cleaner imports
- Follow React best practices
- Use TypeScript strictly
- Keep components small and focused

## Dependencies

- Task 01-01: Development Environment Setup

## Next Tasks

- Task 04-01: Text Input Component
- Task 04-02: Lookup Component

## References

- **PoC Strategy**: `../../../../docs/modernization-strategy/15-poc-strategy/poc-strategy.md`
- **UX/UI Strategy**: `../../../../docs/modernization-strategy/06-ux-ui-strategy/ux-ui-strategy.md`

