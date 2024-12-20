import { PublicKey } from '@solana/web3.js';

export type EndpointTypes = 'mainnet' | 'devnet' | 'localnet';

export type TaskStatus = 'Pending' | 'InProgress' | 'Completed' | 'Cancelled';
export type TaskPriority = 'Leisure' | 'Casual' | 'Urgent';
export type TaskCategory = 'Work' | 'Personal' | 'Home' | 'Shopping';


// Enums for internal use that match the Anchor program's expected format
export const TaskStatusValues = {
  Pending: { pending: {} },
  InProgress: { inProgress: {} },
  Completed: { completed: {} },
  Cancelled: { cancelled: {} }
} as const;

export const TaskPriorityValues = {
  Leisure: { leisure: {} },
  Casual: { casual: {} },
  Urgent: { urgent: {} }
} as const;

export const TaskCategoryValues = {
  Work: { work: {} },
  Personal: { personal: {} },
  Home: { home: {} },
  Shopping: { shopping: {} }
} as const;

export interface Task {
  id: number;
  title: string;
  description: string;
  creator: PublicKey;
  assignee: PublicKey | null;
  priority: typeof TaskPriorityValues[keyof typeof TaskPriorityValues];
  status: typeof TaskStatusValues[keyof typeof TaskStatusValues];
  category: typeof TaskCategoryValues[keyof typeof TaskCategoryValues];
  createdAt: number;
  updatedAt: number;
  completedAt: number | null;
}

// Helper functions to convert between string types and Anchor format
export const getTaskStatusValue = (status: TaskStatus) => TaskStatusValues[status];
export const getTaskPriorityValue = (priority: TaskPriority) => TaskPriorityValues[priority];
export const getTaskCategoryValue = (category: TaskCategory) => TaskCategoryValues[category];


export interface TodoListAccount {
  owner: PublicKey;
  tasks: Task[];
  taskCount: number;
  completedTaskStreak: number;
  lastCompletedDate: number | null;
  bump: number;
}
