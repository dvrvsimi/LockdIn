import { FC, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { PlusCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '../../components/ui/cards';
import { TaskCard } from '../../components/TaskCard';
import { TaskStats } from '../../components/TaskStats';
import { NewTaskDialog } from '../../components/NewTaskDialog';
import { useTaskProgram } from '../../hooks/useTaskProgram';
import { Task } from '../../models/types/task';
import styles from '../../styles/Home.module.css';

export const HomeView: FC = () => {
  const { publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const { fetchTasks } = useTaskProgram();
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTasks = useCallback(async () => {
    if (!publicKey) return;
    
    try {
      setLoading(true);
      const fetchedTasks = await fetchTasks();
      setTasks(fetchedTasks as Task[] || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [publicKey, fetchTasks]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleTaskCreated = async () => {
    setIsNewTaskDialogOpen(false);
    await loadTasks();
  };

  const handleEditTask = async (taskId: number) => {
    // Todo: Implement edit functionality
    console.log('Editing task:', taskId);
  };

  const handleDeleteTask = async (taskId: number) => {
    // Todo: Implement delete functionality
    console.log('Deleting task:', taskId);
  };

  const activeTasks = tasks.filter(task => task.status.pending || task.status.inProgress).length;
  const completedTasks = tasks.filter(task => task.status.completed).length;
  const streak = 0; // This will need to be calculated based on your data structure

  return (
    <div className={`min-h-screen flex flex-col ${publicKey ? 'bg-black' : ''}`}>
      {/* Navbar */}
      <nav className="bg-[#120030]">
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
              Efficiently create and manage your daily tasks.
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
              <CardHeader className="flex flex-row items-center justify-between bg-black">
                <CardTitle className="text-xl font-semibold text-white">
                  My Tasks {loading && '(Loading...)'}
                </CardTitle>
                <Button 
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={() => setIsNewTaskDialogOpen(true)}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  New Task
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tasks.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      {loading ? 'Loading tasks...' : 'No tasks yet. Create your first task to get started!'}
                    </div>
                  ) : (
                    tasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onEdit={handleEditTask}
                        onDelete={handleDeleteTask}
                      />
                    ))
                  )}
                </div>
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