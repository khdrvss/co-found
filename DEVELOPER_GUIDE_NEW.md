# 🛠️ Developer Guide

Complete development guide for contributing to Co-found.uz.

## 🎯 Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 15+ (or Docker)
- Git
- VS Code (recommended)

### Development Setup
```bash
# Clone repository
git clone https://github.com/khdrvss/co-found.git
cd co-found

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your local configuration

# Start PostgreSQL (with Docker)
docker-compose up -d db

# Initialize database
npm run migrate

# Start development servers
npm run dev
```

This starts:
- Frontend dev server: http://localhost:3000
- Backend API server: http://localhost:5000
- Database: localhost:5432

## 🏗️ Project Structure

```
co-found/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # Base UI components (shadcn)
│   │   ├── cards/          # Feature-specific cards
│   │   ├── dialogs/        # Modal dialogs
│   │   └── layout/         # Layout components
│   ├── contexts/           # React contexts
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities and API client
│   ├── pages/              # Route components
│   ├── server/             # Backend server code
│   │   ├── routes.ts       # API routes
│   │   ├── db.ts          # Database connection
│   │   ├── validation.ts   # Input validation
│   │   └── middleware/     # Express middleware
│   └── test/               # Test utilities
├── prisma/                 # Database schema and migrations
├── public/                 # Static assets
└── docker-compose.yml      # Docker configuration
```

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:ui

# Run specific test file
npm test -- AuthDialog.test.tsx

# Run tests with coverage
npm run test:coverage
```

### Writing Tests
```typescript
// Component test example
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TestWrapper } from '@/test/test-utils'
import MyComponent from './MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(
      <TestWrapper>
        <MyComponent />
      </TestWrapper>
    )
    
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })
})
```

### Test Utilities
- `TestWrapper`: Provides all necessary React contexts
- `renderWithProviders()`: Helper for rendering with providers
- Mock functions available via `vi` from Vitest

## 🎨 UI Development

### Design System
We use **shadcn/ui** components with **TailwindCSS**:

```bash
# Add new shadcn component
npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add form
```

### Component Guidelines
```typescript
// Good component structure
interface ComponentProps {
  title: string
  onSubmit: (data: FormData) => void
  isLoading?: boolean
}

export function MyComponent({ title, onSubmit, isLoading = false }: ComponentProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      {/* Component content */}
    </div>
  )
}
```

### Styling Guidelines
- Use TailwindCSS utility classes
- Follow mobile-first responsive design
- Use semantic color tokens
- Maintain consistent spacing (4, 8, 16, 24, 32px)

## 🔌 API Development

### Adding New Endpoints
```typescript
// In src/server/routes.ts
router.get('/api/my-endpoint', asyncHandler(async (req, res) => {
  // Validate input
  const validatedData = validateInput(mySchema, req.query)
  
  // Business logic
  const result = await query('SELECT * FROM table WHERE id = $1', [validatedData.id])
  
  // Return response
  res.json({ data: result.rows })
}))
```

### Validation Schemas
```typescript
// In src/server/validation.ts
export const mySchema = z.object({
  id: z.string().uuid('Invalid ID format'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email format'),
})
```

### Error Handling
```typescript
// Use custom error classes
import { ValidationError, NotFoundError } from './errors'

// Validation error
if (!validData) {
  throw new ValidationError('Invalid input data')
}

// Not found error
if (!user) {
  throw new NotFoundError('User not found')
}
```

## 🗄️ Database Development

### Schema Changes
```bash
# Create new migration
npx prisma migrate dev --name add_new_feature

# Reset database (development only)
npx prisma migrate reset

# Generate Prisma client
npx prisma generate
```

### Query Guidelines
```typescript
// Use parameterized queries
const result = await query(
  'SELECT * FROM users WHERE email = $1 AND status = $2',
  [email, 'active']
)

// Avoid string concatenation (SQL injection risk)
// ❌ Bad
const result = await query(`SELECT * FROM users WHERE email = '${email}'`)
```

### Database Best Practices
- Always use parameterized queries
- Create indexes for frequently queried columns
- Use transactions for multi-step operations
- Handle database errors gracefully

## 🔒 Security Guidelines

### Input Validation
```typescript
// Always validate user input
const validatedData = validateInput(schema, req.body)

// Sanitization is applied automatically via middleware
```

### Authentication
```typescript
// Protect routes with authentication
router.get('/api/protected', authenticateToken, asyncHandler(async (req, res) => {
  // req.user is available here
  const userId = req.user.userId
}))
```

### Rate Limiting
Rate limiting is automatically applied:
- Auth endpoints: 5 attempts/15 minutes
- Mutations: 30 requests/minute
- Reads: 200 requests/minute

### Environment Variables
```typescript
// Use configuration module
import config from './config'

const secret = config.jwt.secret // Environment-based
```

## 📱 Frontend State Management

### React Query
```typescript
// Custom hook for API calls
export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => api.get<Project[]>('/api/projects'),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Mutation with optimistic updates
export function useCreateProject() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateProjectData) => api.post('/api/projects', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}
```

### Context Usage
```typescript
// Use existing contexts
const { user, signIn, signOut } = useAuth()
const { language, setLanguage } = useLanguage()
const { theme, setTheme } = useTheme()
```

## 🚀 Performance Optimization

### Frontend
- Use React.memo for expensive components
- Implement code splitting with React.lazy
- Optimize images with proper sizing
- Use React Query for caching

### Backend
- Database query optimization
- Response caching
- Connection pooling
- Rate limiting

### Database
- Proper indexing
- Query optimization
- Connection pooling
- Regular maintenance

## 🔄 Development Workflow

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/my-new-feature

# Make changes and commit
git add .
git commit -m "feat: add amazing new feature"

# Push and create PR
git push origin feature/my-new-feature
```

### Commit Messages
Follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation changes
- `style:` formatting changes
- `refactor:` code refactoring
- `test:` adding tests
- `chore:` maintenance tasks

### Code Review Checklist
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Security considerations addressed
- [ ] Performance impact considered
- [ ] Error handling implemented
- [ ] TypeScript types properly defined

## 🐛 Debugging

### Frontend Debugging
```typescript
// Use React DevTools
// Enable React Query DevTools in development
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// Add to App.tsx in development
{process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
```

### Backend Debugging
```typescript
// Use structured logging
import { logError } from './errors'

logError(error, 'Function context')

// Debug database queries
console.log('Query:', query, 'Params:', params)
```

### Common Issues
- CORS errors: Check `cors` configuration in server
- Database connection: Verify environment variables
- Authentication: Check JWT token format
- Rate limiting: Check request frequency

## 📊 Monitoring

### Health Checks
```bash
# Application health
curl http://localhost:5000/api/health

# Database health
docker exec co-found-db pg_isready
```

### Performance Monitoring
- React DevTools Profiler
- Network tab for API calls
- Lighthouse for web performance
- Database query analysis

## 🤝 Contributing Guidelines

1. **Fork** the repository
2. **Create** a feature branch
3. **Write** tests for your changes
4. **Follow** coding standards
5. **Update** documentation
6. **Submit** a pull request

### Code Standards
- Use TypeScript for all new code
- Follow existing patterns and conventions
- Write meaningful variable and function names
- Add JSDoc comments for complex functions
- Keep functions small and focused

### Pull Request Guidelines
- Clear description of changes
- Link to related issues
- Include screenshots for UI changes
- Ensure tests pass
- Request review from maintainers

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Vitest Documentation](https://vitest.dev/)

For questions or support, reach out in our Telegram developer channel or create an issue on GitHub.
