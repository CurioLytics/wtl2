# 🔄 Project Awareness & Context
- **Always read `PLANNING.md`** at the start of a new conversation to understand the project's architecture, goals, style, and constraints.  
- **Check `TASK.md`** before starting a new task. If the task isn’t listed, add it with a brief description and today's date.  
- **Use consistent naming conventions, file structure, and architecture patterns** as described in `PLANNING.md`.  
- **Follow Vite + Supabase + Tailwind best practices** for project setup, file structure, and styling conventions.  

# 🧱 Code Structure & Modularity
- **Never create a file longer than 500 lines of code.** Refactor into modules or helpers when needed.  
- **Organize code by feature or responsibility**, separating components, stores, services, and utilities clearly.  
- **Follow Tailwind conventions for CSS**: use utility-first classes in components; avoid inline `<style>` blocks unless necessary.  
- **Use clear, consistent imports** (relative within packages; absolute from root aliases if configured).  
- **Directory guidance** (example for webapp):  
/src
/components
/pages
/layouts
/services # Supabase API calls
/stores # state management
/utils
/styles # global CSS / Tailwind config overrides
/tests

markdown
Copy code

# 🧪 Testing & Reliability
- **Always create unit tests for new features** (functions, components, API calls).  
- **Update existing tests** if logic changes.  
- **Tests live in `/tests`**, mirroring app structure.  
- Include at least:  
  - 1 expected-use test  
  - 1 edge case  
  - 1 failure case  

# ✅ Task Completion
- **Mark completed tasks in `TASK.md`** immediately after finishing them.  
- Add new sub-tasks or TODOs discovered during development under “Discovered During Work”.  

# 📚 Documentation & Explainability
- **Update `README.md`** when features, dependencies, or setup steps change.  
- **Comment non-obvious code**; ensure readability for mid-level developers.  
- **For complex logic**, add an inline `# Reason:` comment explaining *why*, not just *what*.  
- **Document Supabase services and API usage** in a dedicated `/docs` folder if needed.  

# 🧠 AI Behavior Rules
- **Never assume missing context. Ask questions if uncertain.**  
- **Never hallucinate libraries, components, or functions** – only use verified packages for Vite + Supabase + Tailwind.  
- **Confirm file paths and module names exist** before referencing them.  
- **Never delete or overwrite existing code** unless explicitly instructed or part of a task from `TASK.md`.  
- **Follow project styling conventions** in all generated code (Tailwind classes, component patterns, consistent naming).  
- **When generating files**, respect modular boundaries: separate components, pages, services, styles, and tests appropriately.