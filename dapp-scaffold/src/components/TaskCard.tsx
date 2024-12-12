import { FC } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle, User } from 'lucide-react';
import { Card } from './ui/cards';

interface TaskCardProps {
  id: number;
  title: string;
  description: string;
  status: 'Pending' | 'InProgress' | 'Completed' | 'Cancelled';
  priority: 'Leisure' | 'Casual' | 'Urgent';
  category: 'Work' | 'Personal' | 'Home' | 'Shopping';
  assignee: string | null;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export const TaskCard: FC<TaskCardProps> = ({
  id,
  title,
  description,
  status,
  priority,
  category,
  assignee,
  onEdit,
  onDelete,
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'InProgress':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'Cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return 'text-red-500 bg-red-500/10';
      case 'Casual':
        return 'text-blue-500 bg-blue-500/10';
      default:
        return 'text-gray-500 bg-gray-500/10';
    }
  };

  return (
    <Card className="p-6 bg-slate-800">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            {getStatusIcon(status)}
            <h3 className="text-xl font-bold text-white">{title}</h3>
          </div>
          <p className="text-gray-400 mb-4">{description}</p>
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-sm ${getPriorityColor(priority)}`}>
              {priority}
            </span>
            <span className="text-gray-400 text-sm">{category}</span>
            {assignee && (
              <div className="flex items-center text-gray-400 text-sm">
                <User className="w-4 h-4 mr-1" />
                {`${assignee.slice(0, 6)}...${assignee.slice(-4)}`}
              </div>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          {onEdit && (
            <button 
              onClick={() => onEdit(id)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button 
              onClick={() => onDelete(id)}
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