# Log Explorer

A lightweight React app to ingest JSON/NDJSON logs and explore them with search, filters, saved views, and export.

## Live Demo
- https://sreedhanya.github.io/log-explorer/

## Features
- Upload **JSON array** or **NDJSON**
- Normalize fields (timestamp, level, service, message, correlationId)
- Table view + details inspector (raw JSON)
- Full-text search
- Filters: level + service
- Saved Views (persisted in localStorage)
- Export filtered results as JSON

## Quick Start (Local)
```bash
npm install
npm run dev