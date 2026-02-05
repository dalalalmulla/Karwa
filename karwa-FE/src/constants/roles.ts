/**
 * User-friendly role labels for tasks
 * These define how we refer to users in different roles within the app
 */

export const ROLE_LABELS = {
  // The person who created/posted the task
  POSTER: {
    singular: 'Task Creator',
    plural: 'Task Creators',
    short: 'Creator',
    // Alternative labels that can be used contextually
    alternatives: ['Poster', 'Task Owner', 'Client'],
  },
  
  // The person who is assigned to complete the task
  WORKER: {
    singular: 'Task Worker',
    plural: 'Task Workers',
    short: 'Worker',
    // Alternative labels that can be used contextually
    alternatives: ['Doer', 'Task Doer', 'Assigned Worker'],
  },
} as const;

/**
 * Get the appropriate label for a role based on context
 */
export function getRoleLabel(role: 'POSTER' | 'WORKER', context: 'singular' | 'plural' | 'short' = 'singular'): string {
  return ROLE_LABELS[role][context];
}

