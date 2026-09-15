

## Repo Layout
- `frontend-main/`  → LEGACY app (React). FULL feature set. WRONG design.
- `hg_frontend/`    → PRIMARY app (Next.js). CORRECT design. Missing features.
- `HG Backend/`     → BACKEND. Shared. Do NOT touch.

## Core Mission
Port every feature, screen, flow, interaction, state, and motion
from LEGACY into PRIMARY — rebuilt using PRIMARY's design system.

Port BEHAVIOR. Never port APPEARANCE.

## The One Law
PRIMARY is the ONLY source of visual truth.
LEGACY is the ONLY source of feature truth.
Never reverse this.

## What to Take from LEGACY
- Pages and routes that exist
- Feature sets per page
- Buttons, links, and where they navigate
- Modals, drawers, toasts, popovers
- Forms, inputs, validation rules
- API calls and data models
- Loading / empty / error / success states
- User flows and interactions
- Animations and motion (name, trigger, duration, easing)
- Edge cases and conditional logic

## What to NEVER Take from LEGACY
- CSS files, Tailwind classes, inline styles
- Colors, fonts, spacing, radii, shadows
- Component names, file structure, folder names
- Animation keyframes or timing values
- Any visual styling whatsoever

## What to Keep in PRIMARY
- Its design tokens, colors, typography, spacing
- Its component library and structure
- Its routing style and file conventions
- Its brand identity — untouched

## Merge Rule (for pages in BOTH)
1. PRIMARY page = skeleton. Keep it.
2. LEGACY page = feature checklist. Read it fully.
3. Add every LEGACY feature PRIMARY lacks.
4. Never delete or replace a PRIMARY feature.
5. Additive only. PRIMARY visuals always win.

## Motion Rule
LEGACY defines WHAT animates and WHEN.
PRIMARY defines HOW it looks and feels.
If PRIMARY has no motion tokens yet, define them once in
PRIMARY's design system, then reuse everywhere.
Never copy LEGACY's keyframes or timing values.

## Responsiveness Rule
Every screen must work cleanly on mobile AND desktop.
Not mobile-first. Fully responsive both ways.
If PRIMARY has a desktop-only layout, fix it during the merge.
Test each page at small, medium, and large widths.

## Process — Strict
Work panel by panel, in this order:
1. Student
2. Admin
3. Kitchen
4. Rider

Within each panel, go FILE BY FILE.
Do not skim. Do not batch. Open every LEGACY file.
For each LEGACY file:
- Identify what it does and every feature inside it
- Find the PRIMARY equivalent (or create one if missing)
- Rebuild the feature using PRIMARY components and tokens
- Add loading, empty, error, success states
- Make it responsive

## When Stuck
If a LEGACY feature has no PRIMARY equivalent component:
- Do NOT invent a new visual style
- Build it from PRIMARY's existing components and tokens
- If impossible, SKIP it and log it

## Logging — Required
Maintain `MERGE_LOG.md` at repo root. Update as you go.
For every page, record:
- LEGACY file path
- PRIMARY file path
- Features found in LEGACY
- Features added to PRIMARY
- Features skipped + reason
- Motion ported + how it was mapped
- Responsive issues fixed

## Do Not
- Do not touch BACKEND
- Do not refactor PRIMARY beyond what's needed
- Do not rename existing PRIMARY files or components
- Do not introduce new libraries without logging why
- Do not stop mid-run to ask questions — finish the run, log doubts

## Definition of Done
- Every LEGACY feature exists in PRIMARY
- Every page uses PRIMARY design only
- Every page responsive on mobile + desktop
- MERGE_LOG.md complete
- Typecheck / build passes (if available)
