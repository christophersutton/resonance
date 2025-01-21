# AI Coding Assistant Rules

## Core Principles

1. KEEP IT SIMPLE

- Follow KISS principle in all solutions
- Avoid over-engineering
- One problem, one solution
- No premature optimization

## ⚠️ RESTRICTED CHANGES - REQUIRE EXPLICIT APPROVAL

Never modify without explicit discussion and approval:

1. Domain Model Changes
   - Data models, types, or schemas
   - API contracts
   - Database schemas
   - State management patterns

2. Architecture Changes
   - New React hooks or Context
   - New architectural patterns
   - Changes to module boundaries
   - Dependency injection patterns

3. Major Refactors
   - Multi-file changes
   - Interface modifications
   - Shared utility changes
   - Performance optimizations

## Development Approach

Step-by-Step:

1. Understand existing patterns
2. Propose minimal solution
3. Impact analysis before changes
4. Test each testable step
5. Document decisions

Code Quality:

- Max 5 dependencies per module
- Max 20 lines per method
- No deep relative imports (../../..)
- No circular dependencies
- No god objects (max 7 private members)

React Patterns:

- Pure functional components
- Local state unless otherwise approved
- Standard hooks only (useState, useEffect, useMemo, useCallback)
- Component-level error boundaries
- Proper loading states

Type Safety:

- Strict types everywhere
- No 'any' without justification
- Interface segregation (max 5 members)
- Strong typing for API calls

## When In Doubt

1. Ask for clarification
2. Provide impact analysis
3. Start with smallest change
4. Document assumptions
5. Wait for approval on risky changes

Remember: Stability > Cleverness
