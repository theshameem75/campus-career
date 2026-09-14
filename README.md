# CampusCareer

CampusCareer is a React frontend for SELISE Blocks project
`D8fb34a0fb75740f0b8a479a550807393`. Product-specific features will be added
once requirements are available.

## Stack

React, TypeScript, Vite, Tailwind CSS, shadcn/ui conventions, React Router,
TanStack Query, React Hook Form, Zod, Lucide React, Sonner, and the SELISE
Blocks client.

## Setup

```powershell
npm install
npm run setup:https
npm run dev
```

Local HTTPS uses `https://dbfvug-elgew.slsblx.com:5173`. The OIDC client id is
intentionally empty because the project does not have a public OIDC client yet.

## Quality checks

```powershell
npm run lint
npm run typecheck
npm run build
```
