import { FC } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PlusCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '../../components/ui/cards';
import { TaskCard } from '../../components/TaskCard';
import { TaskStats } from '../../components/TaskStats';
import styles from '../../styles/Home.module.css';

export const HomeView: FC = () => {
  const { publicKey } = useWallet();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-purple-700">LockdIn</span>
            </div>
            <div className="flex items-center gap-4">
              <WalletMultiButton className={styles.walletButton} />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!publicKey ? (
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold text-slate-900 mb-4">
              Welcome to LockdIn
            </h1>
            <p className="text-slate-600 mb-8">
              Connect your wallet to start managing your tasks on Solana
            </p>
            <WalletMultiButton className={styles.walletButton} />
          </div>
        ) : (
          <>
            <TaskStats 
              activeTasks={0}
              completedTasks={0}
              streak={0}
            />

            {/* Tasks Section */}
            <Card className="mb-8">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-semibold text-slate-900">
                  My Tasks
                </CardTitle>
                <Button className="bg-purple-700 hover:bg-purple-800">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  New Task
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Placeholder when no tasks */}
                  <div className="text-center py-8 text-slate-500">
                    No tasks yet. Create your first task to get started!
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
};