## Quick Reference - Using New Validation & Error Handling

### Server-Side: Validating Input

```typescript
import { validateInput, createProjectSchema } from '@/server/validation';

// In your route handler
const validatedData = validateInput(createProjectSchema, req.body);
// If validation fails, throws ValidationError automatically
```

### Server-Side: Using Error Classes

```typescript
import { 
  ValidationError, 
  AuthenticationError, 
  NotFoundError,
  asyncHandler 
} from '@/server/errors';

// Wrap route handlers
router.post('/projects', asyncHandler(async (req, res) => {
  // Validation errors
  throw new ValidationError('Project name is required');
  
  // Auth errors
  throw new AuthenticationError('Invalid token');
  
  // Not found errors
  throw new NotFoundError('User');
  
  // Errors are caught and handled automatically
}));
```

### Server-Side: Retry Logic for DB Operations

```typescript
import { retryOperation } from '@/server/errors';

const result = await retryOperation(
  () => query('SELECT * FROM users WHERE id=$1', [userId]),
  3,  // max retries
  100 // delay in ms
);
```

### Client-Side: Making API Calls

```typescript
import { api, ApiError } from '@/lib/api';

// Simple GET with type safety
const users = await api.get<User[]>('/api/users');

// POST with error handling
try {
  const user = await api.post<User>('/api/auth/signup', {
    email: 'test@example.com',
    password: 'password123'
  }, token);
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`${error.statusCode}: ${error.message}`);
    console.error(`Details: ${error.details}`);
  }
}

// Automatic retry on network errors
const data = await api.retry(
  () => api.get('/api/projects'),
  3,    // max retries
  1000  // delay in ms
);
```

### Client-Side: Using React Hooks

```typescript
import { useApiGet, useMutation, getUserFriendlyErrorMessage } from '@/hooks/use-api';

// GET with loading/error states
function ProjectsList() {
  const { data, loading, error, execute } = useApiGet('/api/projects');
  
  return (
    <>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{getUserFriendlyErrorMessage(error)}</p>}
      {data && data.map(p => <div>{p.name}</div>)}
    </>
  );
}

// POST with mutation
function CreateProject() {
  const { mutate, loading } = useMutation({
    onSuccess: () => toast({ title: 'Project created!' }),
    onError: (err) => toast({ 
      title: 'Error',
      description: getUserFriendlyErrorMessage(err),
      variant: 'destructive'
    })
  });

  const handleSubmit = async (formData) => {
    await mutate('post', '/api/projects', formData);
  };

  return <form onSubmit={handleSubmit}>{/* ... */}</form>;
}
```

### Available Validation Schemas

```typescript
import {
  signUpSchema,
  loginSchema,
  updateProfileSchema,
  createProjectSchema,
  updateProjectSchema,
  messageSchema,
  joinRequestSchema,
  bookmarkSchema,
  validateInput
} from '@/server/validation';

// All schemas use Zod for validation
// Get typed output:
type SignUp = z.infer<typeof signUpSchema>;
type Project = z.infer<typeof createProjectSchema>;
```

### Error Response Format

All API errors follow this format:
```json
{
  "error": "User-friendly message",
  "details": "Technical details for debugging (dev mode only)",
  "statusCode": 400,
  "timestamp": "2026-01-10T12:34:56.789Z"
}
```

### Available Error Classes

| Class | Status | Use Case |
|-------|--------|----------|
| `ValidationError` | 400 | Input validation failed |
| `AuthenticationError` | 401 | Invalid credentials |
| `AuthorizationError` | 403 | Insufficient permissions |
| `NotFoundError` | 404 | Resource not found |
| `DatabaseError` | 500 | Database operation failed |
| `ApiError` | Any | Generic API error |

### Type Safety with API Responses

```typescript
import { User, Project, Message } from '@/server/types';

// API calls are fully typed
const user = await api.get<User>('/api/auth/me');
const projects = await api.get<Project[]>('/api/projects');
const messages = await api.get<Message[]>(`/api/messages/${userId}`);

// TypeScript will warn if you use wrong types
// data.invalidField; // ❌ TypeScript error
```

---

## Testing the Improvements

### Test Validation
```bash
# Should fail with validation error
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "invalid", "password": "123"}'

# Response: 400 with validation details
```

### Test Error Handling
```bash
# Should fail with 401 Unauthorized
curl -X GET http://localhost:5000/api/auth/me

# Response: 401 with clear error message
```

### Test Pagination
```bash
# Supports pagination
curl http://localhost:5000/api/projects?page=1&limit=20

# Response includes pagination metadata
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

### Test Health Check
```bash
curl http://localhost:5000/api/health
# Response: { "status": "ok", "timestamp": "..." }
```

---

## Logging and Debugging

Server logs now include:
```
📨 POST /api/auth/signup
❌ ERROR [Signup] at 2026-01-10T12:34:56.789Z:
  Name: ValidationError
  Message: Validation error: email: Invalid email format
  Stack: ...
```

Enable debug logging for specific operations:
```typescript
import { logError } from '@/server/errors';

logError(new Error('Something went wrong'), 'MyOperation');
// ❌ ERROR [MyOperation] at 2026-01-10T12:34:56.789Z: ...
```

---

## Migration Notes

### For Existing Code

Old way (❌):
```typescript
const { user } = req.body;
if (!user) return res.status(400).json({ error: 'User required' });
```

New way (✅):
```typescript
const { user } = validateInput(createProjectSchema, req.body);
// Throws ValidationError if invalid, handler catches it automatically
```

### Update .env for JWT

```env
# Added support for configurable token expiry
JWT_EXPIRES_IN=7d  # or use seconds: 604800
```

---

## Troubleshooting

### "Type 'undefined' is not assignable to type..."
- Use proper validation before using data
- Call `validateInput()` for all user input

### "Promise rejected error not caught"
- Wrap async handlers with `asyncHandler()`
- The error middleware catches and responds with proper format

### "API returns 'Something went wrong'"
- Check server logs for actual error details
- Use `getUserFriendlyErrorMessage()` to display to users

### Retry logic not working
- Check network in DevTools
- Verify `api.retry()` is being used
- Non-4xx errors will be retried automatically
