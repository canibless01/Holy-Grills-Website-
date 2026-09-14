# API Integration Guide

## General Rules

- Never modify unrelated files.
- Always reuse the existing API client.
- Never call fetch() or axios directly inside React components.
- Use TanStack Query for all server state.
- Keep components presentational.
- Business logic belongs in hooks or services.
- Follow the existing folder structure.
- Reuse existing types whenever possible.
- Create new types only if they don't already exist.
- Use TypeScript strictly (avoid any).
- Use Zod for request/response validation if the project already uses it.
- Preserve the current UI and styling.
- Do not rename files unless necessary.
- Explain any architectural changes before making them.

## API Structure

features/
  users/
    api.ts
    hooks.ts
    types.ts

## Naming

getUsers()
getUser()
createUser()
updateUser()
deleteUser()

useUsers()
useCreateUser()

## Error Handling

- Centralize error handling in the API client.
- Display user-friendly error messages.
- Don't swallow errors.

## Authentication

- Use the existing authentication flow.
- Never duplicate token logic.

## Before finishing

- Ensure TypeScript passes.
- Ensure ESLint passes.
- Ensure no unrelated files were changed.