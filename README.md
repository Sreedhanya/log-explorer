🧭 Log Explorer

A lightweight React + TypeScript log analysis tool that ingests structured logs (JSON array or NDJSON), normalizes them, and provides powerful filtering, time-range selection, saved views, and export capabilities.

🔗 Live Demo:
https://sreedhanya.github.io/log-explorer/

✨ Features
📥 Log Ingestion

Supports:

JSON array format

NDJSON (newline-delimited JSON)

Robust parsing with error handling

Automatic normalization of:

timestamp

level

service

message

correlationId

🔎 Advanced Filtering

🔍 Full-text search (precomputed searchable index)

🎚 Level filtering (error / warn / info)

🧩 Service filtering

🕒 Time range filtering

Custom From/To selection

Quick actions: “From Min”, “To Max”

Combined multi-filter support

💾 Saved Views

Save filter configurations locally

Restore filters instantly

Stored in browser localStorage

Includes:

Query

Levels

Services

Time range

Creation timestamp

📤 Export

Export filtered results as JSON

Preserves original raw log structure

Auto-generates filename based on uploaded file

📊 Log Visualization

Sorted by timestamp (newest first)

Interactive table

Row selection highlights

Detailed JSON view

Copy raw log to clipboard

🏗 Architecture Overview
State Management

useReducer for ingestion state machine:

idle

parsing

loaded

error

useMemo for:

Filtering

Time bounds calculation

Unique services/levels extraction

useEffect for:

Persisting saved views

Data Flow

Upload → Parse → Normalize → Filter → Render → Export

Key Concepts Demonstrated

Custom hooks (useIngest)

Pure reducers

Derived state via useMemo

Controlled components

Defensive parsing

Type-safe domain modeling

LocalStorage persistence

Immutable state updates

Functional React patterns

📁 Project Structure
src/
 ├── features/
 │    ├── ingest/
 │    │     ├── parse.ts
 │    │     ├── normalize.ts
 │    │     ├── useIngest.ts
 │    │     └── UploadPanel.tsx
 │    └── explorer/
 │          ├── LogTable.tsx
 │          └── LogDetails.tsx
 ├── App.tsx
 └── App.css
🧪 Example Log Format
NDJSON
{"timestamp":"2026-02-09T22:00:00Z","level":"info","service":"auth","message":"Login successful","correlationId":"xyz-001"}
{"timestamp":"2026-02-09T22:01:15Z","level":"info","service":"auth","message":"Token refreshed","correlationId":"xyz-001"}
{"timestamp":"2026-02-09T22:02:10Z","level":"error","service":"gateway","message":"Upstream timeout","correlationId":"xyz-002","timeoutMs":30000}
🚀 Deployment

Deployed using GitHub Pages with GitHub Actions.

Build:

npm run build

Deployment workflow auto-publishes to:

https://sreedhanya.github.io/log-explorer/
🛠 Tech Stack

React

TypeScript

Vite

GitHub Actions

GitHub Pages

📈 Why This Project Matters

This project demonstrates:

Real-world frontend state modeling

Data normalization patterns

Performance optimization using memoization

UI state persistence

Clean architectural separation

Production-ready error handling

It simulates functionality found in internal observability or log monitoring tools.

🔮 Possible Enhancements

Dark mode

Column sorting

Pagination / virtualization for large datasets

Log grouping by correlationId

Download as CSV

Shareable saved views via URL params

👩‍💻 Author

Dhanya Pisharasyar
Software Engineer | TypeScript | React | Systems-focused frontend