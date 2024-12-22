import { PublicKey } from '@solana/web3.js';
import { BN } from '@project-serum/anchor';

export type TaskStatus = 'Pending' | 'InProgress' | 'Completed' | 'Cancelled';
export type TaskPriority = 'Leisure' | 'Casual' | 'Urgent';
export type TaskCategory = 'Work' | 'Personal' | 'Home' | 'Shopping';

export type ProgramTaskStatus = 
  | { pending: {} }
  | { inProgress: {} }
  | { completed: {} }
  | { cancelled: {} };

export type ProgramTaskPriority = 
  | { leisure: {} }
  | { casual: {} }
  | { urgent: {} };

export type ProgramTaskCategory = 
  | { work: {} }
  | { personal: {} }
  | { home: {} }
  | { shopping: {} };

// Interfaces for program accounts
export interface Task {
  id: number;
  title: string;
  description: string;
  creator: PublicKey;
  assignee: PublicKey | null;
  priority: ProgramTaskPriority;
  status: ProgramTaskStatus;
  category: ProgramTaskCategory;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
  deadline: Date | null;
}

export interface ProgramTask {
  id: BN;
  title: string;
  description: string;
  creator: PublicKey;
  assignee: PublicKey | null;
  priority: ProgramTaskPriority;
  status: ProgramTaskStatus;
  category: ProgramTaskCategory;
  createdAt: BN;
  updatedAt: BN;
  completedAt: BN | null;
  deadline: BN | null;
}

export interface TodoListAccount {
  owner: PublicKey;
  tasks: ProgramTask[];
  taskCount: BN;
  completedTaskStreak: BN;
  lastCompletedDate: BN | null;
  bump: number;
}

// Helper functions to convert between frontend and program types
export const convertToProgramStatus = (status: TaskStatus): ProgramTaskStatus => {
  const key = status.toLowerCase().replace(/([A-Z])/g, '').trim();
  return { [key]: {} } as ProgramTaskStatus;
};

export const convertToProgramPriority = (priority: TaskPriority): ProgramTaskPriority => {
  return { [priority.toLowerCase()]: {} } as ProgramTaskPriority;
};

export const convertToProgramCategory = (category: TaskCategory): ProgramTaskCategory => {
  return { [category.toLowerCase()]: {} } as ProgramTaskCategory;
};

export const convertFromProgramStatus = (status: ProgramTaskStatus): TaskStatus => {
  const key = Object.keys(status)[0];
  return key.charAt(0).toUpperCase() + key.slice(1) as TaskStatus;
};

export const convertFromProgramPriority = (priority: ProgramTaskPriority): TaskPriority => {
  const key = Object.keys(priority)[0];
  return key.charAt(0).toUpperCase() + key.slice(1) as TaskPriority;
};

export const convertFromProgramCategory = (category: ProgramTaskCategory): TaskCategory => {
  const key = Object.keys(category)[0];
  return key.charAt(0).toUpperCase() + key.slice(1) as TaskCategory;
};

// Program event types
export interface TaskCreatedEvent {
  taskId: number;
  creator: PublicKey;
  title: string;
}

export interface TaskAssignedEvent {
  taskId: number;
  assignee: PublicKey;
  assigner: PublicKey;
}

export interface TaskStatusUpdatedEvent {
  taskId: number;
  oldStatus: ProgramTaskStatus;
  newStatus: ProgramTaskStatus;
  updater: PublicKey;
}

// Notification types
export interface TaskNotification {
  taskId: number;
  from: PublicKey;
  title: string;
  timestamp: Date;
  read: boolean;
}