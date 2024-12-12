import { FC } from 'react';
import { Card, CardContent } from './ui/cards';
import { Target, CheckCircle, Clock } from 'lucide-react';

interface StatsProps {
  activeTasks: number;
  completedTasks: number;
  streak: number;
}

export const TaskStats: FC<StatsProps> = ({ activeTasks, completedTasks, streak }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card>
        <CardContent className="flex items-center p-6">
          <div className="bg-purple-100 p-3 rounded-full mr-4">
            <Target className="h-6 w-6 text-purple-700" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Active Tasks</p>
            <h3 className="text-2xl font-bold text-slate-900">{activeTasks}</h3>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="flex items-center p-6">
          <div className="bg-blue-100 p-3 rounded-full mr-4">
            <CheckCircle className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Completed</p>
            <h3 className="text-2xl font-bold text-slate-900">{completedTasks}</h3>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="flex items-center p-6">
          <div className="bg-green-100 p-3 rounded-full mr-4">
            <Clock className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Streak</p>
            <h3 className="text-2xl font-bold text-slate-900">{streak} days</h3>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};