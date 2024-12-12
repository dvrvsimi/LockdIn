export type EndpointTypes = 'mainnet' | 'devnet' | 'localnet'
export type TaskStatus = 'Pending' | 'InProgress' | 'Completed' | 'Cancelled';
export type TaskPriority = 'Leisure' | 'Casual' | 'Urgent';
export type TaskCategory = 'Work' | 'Personal' | 'Home' | 'Shopping';

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  assignee: string | null;
}