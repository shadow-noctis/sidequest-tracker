# Side quest Tracker

## Overview
*(Learning project:)* A spoiler-free sidequest tracker allowing users to view information about sidequests for a game and mark the quest finished for tracking their progress.

# Features
- List quests by game
- List achievements by game
- Toggle achievements based on platform
- login / logout
- Mark quests done/undone (Only logged in users)
- Admin feature: add, delete, edit
- Import quests/achievemments using JSON file
- Helpful tip (viewed only after clicking)

## Planned features
- Request new game (form)
- User profile
- Edit user rights (admin only)
- Proper registration (require email verification)

## Tech Stack
- **Frontend**: React + Vite
- **Backend**: Node.js

## Status
🚧 Simple version functional. Possible minor bugs

## Setup
1. Clone this repo
2. Install dependencies for frontend and backend:
   ```cd frontend && npm install```
   ```cd ../backend && npm install```
3. Run Backend
   ```node server.js```
4. Run Frontend
   ```npm run dev```
