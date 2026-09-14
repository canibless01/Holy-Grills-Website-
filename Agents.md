# Frontend-update rules

- The backend is complete and up to date. Do NOT read, explore, or modify
  anything in /backend. Treat the domain section pasted into the task
  prompt as the full and authoritative API contract — endpoints, request/
  response shapes, field names — no need to verify it against backend code.
- This is NOT a from-scratch build. The frontend for each domain already
  exists. Your job is to extend/update existing screens and components to
  expose backend capabilities they're currently missing — not to redesign
  or rebuild what's already working.
- Before changing a screen, find and reuse its existing components,
  patterns, and API-calling conventions. Match the existing code style.
- Never invent new colors, fonts, spacing, or component styles — use only
  what's already defined in [design tokens / theme file / component
  library].
- If a genuinely new UI element is needed (no existing equivalent — e.g. a
  new input type), build it to spec and follow the existing design system,
  but flag it in the PR description as new rather than extended.
