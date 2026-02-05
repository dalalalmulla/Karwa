# Role Labels Usage in Karwa App

This document shows where the role labels (Task Creator and Task Worker) are displayed in the app.

## Currently Updated Screens

### 1. Task Detail Screen (`app/(main)/task/[id].tsx`)
This is the main screen where role labels are prominently displayed:

**Locations:**
- ✅ **Task Creator Rating** - Shows the rating of the person who created the task
- ✅ **Rate the Task Creator** - Button for workers to rate the task creator (when task is completed)
- ✅ **Rate the Task Worker** - Button for task creators to rate the worker (when task is completed)
- ✅ **Assigned Task Worker** - Shows who is assigned to complete the task
- ✅ **Contact the task creator** - Text in worker's contact section
- ✅ **Assign Task Worker** - Alert dialog when assigning a worker

## Screens That May Need Updates

### 2. Tasks List Screen (`app/(main)/tasks-list.tsx`)
- Shows poster name in task cards (currently shows "posterName")
- May benefit from adding "Task Creator" label

### 3. Tasks Screen (`app/(main)/tasks.tsx`)
- Shows pending confirmation tasks
- Mentions "poster" in query keys

### 4. Task Details Screen (`app/(main)/task-details.tsx`)
- Has "Rate Workers" section
- Uses "workers" terminology

### 5. Home Screen (`app/(main)/(tabs)/index.tsx`)
- Displays task cards
- May show creator information

## How to Use Role Labels

Import the constants:
```typescript
import { ROLE_LABELS } from "@/src/constants/roles";
```

Use in your code:
```typescript
// Singular form
ROLE_LABELS.POSTER.singular  // "Task Creator"
ROLE_LABELS.WORKER.singular  // "Task Worker"

// Plural form
ROLE_LABELS.POSTER.plural    // "Task Creators"
ROLE_LABELS.WORKER.plural    // "Task Workers"

// Short form
ROLE_LABELS.POSTER.short     // "Creator"
ROLE_LABELS.WORKER.short     // "Worker"
```

## Summary

The role labels are **primarily identified and displayed** in:
1. **Task Detail Screen** - Main location with multiple instances
2. Rating sections (when task is completed)
3. Assignment sections
4. Contact sections

All user-facing text now uses "Task Creator" and "Task Worker" instead of "Poster" and "Worker" for better clarity.

