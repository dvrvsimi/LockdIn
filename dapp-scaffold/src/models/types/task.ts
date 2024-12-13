export type EndpointTypes = 'mainnet' | 'devnet' | 'localnet'
export type TaskStatus = 'Pending' | 'InProgress' | 'Completed' | 'Cancelled';
export type TaskPriority = 'Leisure' | 'Casual' | 'Urgent';
export type TaskCategory = 'Work' | 'Personal' | 'Home' | 'Shopping';

import { PublicKey } from '@solana/web3.js';

export interface Task {
  id: number;
  title: string;
  description: string;
  creator: PublicKey;
  assignee: PublicKey | null;
  priority: 'Leisure' | 'Casual' | 'Urgent';
  status: {
    pending?: {};
    inProgress?: {};
    completed?: {};
    cancelled?: {};
  };
  category: 'Work' | 'Personal' | 'Home' | 'Shopping';
  createdAt: number;
  updatedAt: number;
  completedAt: number | null;
}