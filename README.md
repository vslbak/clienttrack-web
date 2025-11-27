# ClientTrack Web

React + Vite dashboard UI for the ClientTrack CRM demo.

## Tech Stack
- React + Vite
- TypeScript
- Tailwind
- React Router

## Features
- Dashboard KPIs
- Clients CRUD
- Deals CRUD + stages
- Activities timeline
- Proposal view + PDF download

## Run locally
```
npm install
npm run dev
```

Set:
```
VITE_API_BASE_URL=http://localhost:8080
```

## Build
```
npm run build
```

## Deploy
Docker image served via Caddy:
```
docker build -t clienttrack-web .
docker compose up -d
```