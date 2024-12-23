import { FC, useState, useEffect } from 'react';
import Image from 'next/image';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { PlusCircle, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '../../components/ui/cards';
import { TaskCard } from '../../components/TaskCard';
import { TaskStats } from '../../components/TaskStats';
import { NewTaskDialog } from '../../components/NewTaskDialog';
import { useTaskProgram } from '../../hooks/useTaskProgram';
import { Task, ProgramTaskStatus } from '../../models/types/task';
import { notify } from '../../utils/notifications';
import styles from '../../styles/Home.module.css';

// Helper functions for task status
const isActiveStatus = (status: ProgramTaskStatus): boolean => {
  return 'pending' in status || 'inProgress' in status;
};

const isCompletedStatus = (status: ProgramTaskStatus): boolean => {
  return 'completed' in status;
};

// Separate TaskList component for better organization
const TaskList: FC<{
  loading: boolean;
  tasks: Task[];
  publicKey: PublicKey | null;
  onEdit: (id: number) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}> = ({ loading, tasks, publicKey, onEdit, onDelete }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 text-purple-600 animate-spin mb-4" />
        <p className="text-gray-500">Loading tasks...</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        {publicKey 
          ? 'No tasks yet. Create your first task to get started!'
          : 'Connect your wallet to view tasks'}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export const HomeView: FC = () => {
  // Hooks
  const { publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const { fetchTasks, updateTaskStatus, deleteTask } = useTaskProgram();
  
  // State
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [operationInProgress, setOperationInProgress] = useState(false);

  // Task loading effect
  useEffect(() => {
    let mounted = true;

    const loadTasks = async () => {
      if (!publicKey) {
        if (mounted) {
          setTasks([]);
          setLoading(false);
        }
        return;
      }
      
      try {
        setLoading(true);
        const fetchedTasks = await fetchTasks();
        if (mounted) {
          setTasks(fetchedTasks || []);
        }
      } catch (error: any) {
        console.error('Error loading tasks:', error);
        if (mounted) {
          setTasks([]);
          notify({ 
            type: 'error', 
            message: 'Failed to load tasks', 
            description: error?.message || 'Please try again'
          });
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadTasks();
    return () => { mounted = false; };
  }, [publicKey, fetchTasks]);

  // Event handlers
  const handleTaskCreated = async () => {
    setIsNewTaskDialogOpen(false);
    if (publicKey) {
      try {
        setOperationInProgress(true);
        const fetchedTasks = await fetchTasks();
        setTasks(fetchedTasks || []);
        notify({ 
          type: 'success',
          message: 'Task created successfully'
        });
      } catch (error: any) {
        console.error('Error refreshing tasks after creation:', error);
        notify({ 
          type: 'error',
          message: 'Failed to refresh tasks',
          description: error?.message || 'Please try again'
        });
      } finally {
        setOperationInProgress(false);
      }
    }
  };

  const handleEditTask = async (taskId: number) => {
    if (operationInProgress) return;
    
    try {
      setOperationInProgress(true);
      await updateTaskStatus(taskId, 'InProgress');
      const updatedTasks = await fetchTasks();
      setTasks(updatedTasks || []);
    } catch (error: any) {
      console.error('Error updating task:', error);
      notify({ 
        type: 'error',
        message: 'Failed to update task',
        description: error?.message || 'Please try again'
      });
    } finally {
      setOperationInProgress(false);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (operationInProgress) return;

    try {
      setOperationInProgress(true);
      await deleteTask(taskId);
      const updatedTasks = await fetchTasks();
      setTasks(updatedTasks || []);
    } catch (error: any) {
      console.error('Error deleting task:', error);
      notify({ 
        type: 'error',
        message: 'Failed to delete task',
        description: error?.message || 'Please try again'
      });
    } finally {
      setOperationInProgress(false);
    }
  };

  // Computed values
  const activeTasks = tasks.filter(task => isActiveStatus(task.status)).length;
  const completedTasks = tasks.filter(task => isCompletedStatus(task.status)).length;
  const streak = tasks.length > 0 ? Math.max(...tasks.map(task => 
    task.completedAt ? new Date(task.completedAt).getTime() : 0
  )) : 0;

  return (
    <div className="min-h-screen flex flex-col bg-black">
      {/* Navbar */}
      <nav className="bg-[#120030] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Image
                src="/LockdLogo.png"
                alt="LockdIn Logo"
                width={120}
                height={40}
                priority
              />
            </div>
            <div className="flex items-center gap-4">
              <WalletMultiButton className={styles.walletButton} />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!publicKey ? (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)]">
            <div className="relative mb-8">
              <Image
                src="/hero.svg"
                alt="Web3 Developer Illustration"
                width={300}
                height={225}
                priority
                className="max-w-full"
              />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Welcome to LockdIn!
            </h1>
            <p className="text-white mb-12 text-lg text-center max-w-md">
              Efficiently create and manage your daily tasks on the blockchain.
            </p>
            <Button 
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg text-lg"
              onClick={() => setVisible(true)}
            >
              Get Started
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            <TaskStats 
              activeTasks={activeTasks}
              completedTasks={completedTasks}
              streak={streak}
            />

            {/* Tasks Section */}
            <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between bg-white">
                <CardTitle className="text-xl font-semibold text-black">
                  My Tasks
                </CardTitle>
                <Button 
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={() => setIsNewTaskDialogOpen(true)}
                  disabled={loading || operationInProgress}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  New Task
                </Button>
              </CardHeader>
              <CardContent className="bg-white">
                <TaskList 
                  loading={loading || operationInProgress}
                  tasks={tasks}
                  publicKey={publicKey}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* New Task Dialog */}
      <NewTaskDialog 
        isOpen={isNewTaskDialogOpen}
        onClose={() => setIsNewTaskDialogOpen(false)}
        onTaskCreated={handleTaskCreated}
      />
    </div>
  );
};