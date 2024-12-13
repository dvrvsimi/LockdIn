import { FC } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle, User } from 'lucide-react';
import { Card } from './ui/cards';
import { Task } from '../models/types/task';

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
  const getStatusIcon = (status: any) => {
    if (status.completed) return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (status.inProgress) return <Clock className="w-5 h-5 text-blue-500" />;
    if (status.cancelled) return <XCircle className="w-5 h-5 text-red-500" />;
    return <AlertCircle className="w-5 h-5 text-yellow-500" />;
  };

  const getStatusText = (status: any) => {
    if (status.completed) return 'Completed';
    if (status.inProgress) return 'In Progress';
    if (status.cancelled) return 'Cancelled';
    return 'Pending';
  };

  const getPriorityColor = (priority: any) => {
    if (priority.urgent) return 'text-red-500 bg-red-500/10';
    if (priority.casual) return 'text-blue-500 bg-blue-500/10';
    return 'text-gray-500 bg-gray-500/10';
  };

  const getPriorityText = (priority: any) => {
    if (priority.urgent) return 'Urgent';
    if (priority.casual) return 'Casual';
    return 'Leisure';
  };

  const getCategoryText = (category: any) => {
    if (category.work) return 'Work';
    if (category.personal) return 'Personal';
    if (category.home) return 'Home';
    if (category.shopping) return 'Shopping';
    return 'Other';
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
                {task.assignee.toString().slice(0, 6)}...{task.assignee.toString().slice(-4)}
              </div>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          {onEdit && (
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