import { FC, useState } from 'react';
import { Plus } from 'lucide-react';
import { TaskCard } from '../components/TaskCard';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Task, TaskStatus, TaskPriority, TaskCategory } from '../models/types/task';

export const TaskView: FC = () => {
  const { publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const [tasks] = useState<Task[]>([
    {
      id: 1,
      title: "Update Smart Contract",
      description: "Implement new feature for task delegation",
      status: "InProgress" as TaskStatus,
      priority: "Urgent" as TaskPriority,
      category: "Work" as TaskCategory,
      assignee: "0x1234...5678"
    },
    {
      id: 2,
      title: "Community Meeting",
      description: "Weekly sync with community members",
      status: "Pending" as TaskStatus,
      priority: "Casual" as TaskPriority,
      category: "Work" as TaskCategory,
      assignee: null
    }
  ]);

  const handleEdit = async (id: number) => {
    // Todo: Implement edit functionality
    console.log('Editing task:', id);
  };

  const handleDelete = async (id: number) => {
    // Todo: Implement delete functionality
    console.log('Deleting task:', id);
  };

  const handleAddTask = () => {
    if (!publicKey) {
      setVisible(true);
      return;
    }
    // Todo: Implement add task functionality
    console.log('Adding new task');
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">My Tasks</h1>
        <button 
          onClick={handleAddTask}
          className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>New Task</span>
        </button>
      </div>

      {!publicKey ? (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">Connect your wallet to view and manage tasks</p>
          <button
            onClick={() => setVisible(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Connect Wallet
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {tasks.map((task) => (
            <TaskCard 
              key={task.id}
              {...task}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};