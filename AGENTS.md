<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Identiq Codebase Guidelines for AI Agents

## Architecture & Principles
1. **Server-Side AI**: All AI calls must go through Next.js API routes (`app/api/` or server actions) using OpenRouter or Gemini (`@google/genai`). Never expose API keys to the browser.
2. **Design System**: Maintain the warm off-white and pastel aesthetic (`#FAF8F6`, `#F3EDE8`, pastel pink, mint, lavender, blue, peach, yellow) with Plus Jakarta Sans and DM Sans typography.
3. **Evidence Distinction**: Always distinguish between **supported**, **conflicting**, and **unverified** claims. Never label unverified claims as false.
4. **Build Integrity**: Always run `npm run build` (`compile_applet`) and `npm run lint` (`lint_applet`) to verify changes before completing a task.
