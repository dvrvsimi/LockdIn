import { FC } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle, User } from 'lucide-react';
import { Card } from './ui/cards';
import { Task, ProgramTaskStatus, ProgramTaskPriority, ProgramTaskCategory } from '../models/types/task';

interface TaskCardProps {
  task: Task;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export const TaskCard: FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
}) => {
  const getStatusIcon = (status: ProgramTaskStatus) => {
    if ('completed' in status) return <CheckCircle className="w-5 h-5 text-green-500" />;
    if ('inProgress' in status) return <Clock className="w-5 h-5 text-blue-500" />;
    if ('cancelled' in status) return <XCircle className="w-5 h-5 text-red-500" />;
    return <AlertCircle className="w-5 h-5 text-yellow-500" />;
  };

  const getStatusText = (status: ProgramTaskStatus) => {
    if ('completed' in status) return 'Completed';
    if ('inProgress' in status) return 'In Progress';
    if ('cancelled' in status) return 'Cancelled';
    return 'Pending';
  };

  const getPriorityColor = (priority: ProgramTaskPriority) => {
    if ('urgent' in priority) return 'text-red-500 bg-red-500/10';
    if ('casual' in priority) return 'text-blue-500 bg-blue-500/10';
    return 'text-gray-500 bg-gray-500/10';
  };

  const getPriorityText = (priority: ProgramTaskPriority) => {
    if ('urgent' in priority) return 'Urgent';
    if ('casual' in priority) return 'Casual';
    return 'Leisure';
  };

  const getCategoryText = (category: ProgramTaskCategory) => {
    if ('work' in category) return 'Work';
    if ('personal' in category) return 'Personal';
    if ('home' in category) return 'Home';
    if ('shopping' in category) return 'Shopping';
    return 'Other';
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Card className="p-6 bg-slate-800">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            {getStatusIcon(task.status)}
            <h3 className="text-xl font-bold text-white">{task.title}</h3>
          </div>
          <p className="text-gray-400 mb-4">{task.description}</p>
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-sm ${getPriorityColor(task.priority)}`}>
              {getPriorityText(task.priority)}
            </span>
            <span className="text-gray-400 text-sm">
              {getCategoryText(task.category)}
            </span>
            {task.assignee && (
              <div className="flex items-center text-gray-400 text-sm">
                <User className="w-4 h-4 mr-1" />
                {formatAddress(task.assignee.toString())}
              </div>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          {onEdit && !('completed' in task.status) && (
            <button 
              onClick={() => onEdit(task.id)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button 
              onClick={() => onDelete(task.id)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </Card>
  );
};