# React & TypeScript Style Guide

## Core Principles

- Keep components small and focused
- Minimize prop drilling through strategic composition
- Avoid premature optimization
- Prioritize type safety and maintainability

## Component Structure

### File Organization

```tsx
// imports
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'

// types
type Props = {
  userId: string
  onUpdate?: (data: User) => void
}

// component
export function UserProfile({ userId, onUpdate }: Props) {
  // hooks at the top
  const [isLoading, setIsLoading] = useState(false)
  
  // handlers after hooks
  const handleSubmit = async () => {
    // ...
  }

  // early returns for loading/error states
  if (isLoading) return <LoadingSpinner />

  // main render
  return (
    <div>
      {/* JSX here */}
    </div>
  )
}
```

## Supabase Data Fetching

- Use TypeScript generics with Supabase client
- Handle loading and error states explicitly
- Prefer optimistic updates where appropriate

```tsx
// ✅ Good
const { data, error } = await supabase
  .from('users')
  .select('id, name, email')
  .eq('id', userId)
  .single()

// ❌ Avoid
const result = await supabase
  .from('users')
  .select('*') // Avoid selecting all columns
```

## State Management

- Use local state by default
- Lift state only when needed
- Avoid prop drilling more than 2 levels deep

```tsx
// ✅ Good - Colocated state
function UserForm() {
  const [formData, setFormData] = useState<UserFormData>()
  return <Form data={formData} onSubmit={handleSubmit} />
}

// ❌ Avoid - Unnecessary prop drilling
function App() {
  const [userData, setUserData] = useState()
  return (
    <Layout>
      <Sidebar>
        <Navigation userData={userData}>
          <UserMenu userData={userData} />
        </Navigation>
      </Sidebar>
    </Layout>
  )
}
```

## Component Composition

- Break large components into smaller, focused pieces
- Use composition over configuration
- Keep components shallow (max 3 levels of nesting)

```tsx
// ✅ Good
function UserDashboard() {
  return (
    <DashboardLayout>
      <UserProfile />
      <UserActivity />
      <UserSettings />
    </DashboardLayout>
  )
}

// ❌ Avoid
function UserDashboard({ 
  showProfile, 
  showActivity,
  profileConfig,
  activityConfig,
  // ... many more props
}) {
  // Complex conditional rendering
}
```

## Performance Optimization

- Use `memo` only when profiling shows a need
- Prefer `useMemo` for expensive computations
- Use `useCallback` for handlers passed to optimized child components
- Implement proper loading states to avoid layout shift

```tsx
// ✅ Good
function ExpensiveList({ items }: Props) {
  const sortedItems = useMemo(() => 
    items.sort((a, b) => b.date - a.date),
    [items]
  )
  
  return (
    <div role="list">
      {sortedItems.map(item => (
        <ListItem key={item.id} data={item} />
      ))}
    </div>
  )
}
```

## Error Handling

- Use error boundaries for component-level errors
- Handle API errors gracefully with user feedback
- Provide fallback UI for error states

```tsx
// ✅ Good
function UserData() {
  const [error, setError] = useState<Error | null>(null)
  
  if (error) {
    return <ErrorMessage error={error} retry={refetch} />
  }
  
  return <DataDisplay data={data} />
}
```

## Type Safety

- Use strict TypeScript configuration
- Define explicit interfaces for all props
- Use discriminated unions for complex state
- Generate types from Supabase schema

```tsx
// ✅ Good
type UserState = 
  | { status: 'loading' }
  | { status: 'error'; error: Error }
  | { status: 'success'; data: User }

// ❌ Avoid
type UserState = {
  status: string
  data?: any
  error?: any
}
```

Remember: Readability > Cleverness
