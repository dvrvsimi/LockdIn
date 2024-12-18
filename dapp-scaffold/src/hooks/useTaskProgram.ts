import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import * as anchor from '@project-serum/anchor';
import { IDL } from '../utils/lock_in';
import { notify } from '../utils/notifications';
import { 
  Task, 
  TaskPriority, 
  TaskCategory,
  TaskPriorityValues,
  TaskCategoryValues,
  TaskStatus
} from '../models/types/task';
import { Program } from '@project-serum/anchor';

// Define the program type using the IDL
type LockInProgram = Program<typeof IDL>;

const PROGRAM_ID = new PublicKey('6rmb4Kmxibx3DVj9TDZ8tq5JrQhRGhEnyEtVrb7b8UUn');

export const useTaskProgram = () => {
  const { connection } = useConnection();
  const wallet = useWallet();

  const getProgram = (): LockInProgram => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error('Wallet not connected!');
    }

    const provider = new anchor.AnchorProvider(
      connection, 
      {
        publicKey: wallet.publicKey,
        signTransaction: wallet.signTransaction,
        signAllTransactions: wallet.signAllTransactions,
      },
      { commitment: 'processed' }
    );

    return new anchor.Program(IDL, PROGRAM_ID, provider);
  };

  const getTodoListPDA = async (owner: PublicKey): Promise<[PublicKey, number]> => {
    return await PublicKey.findProgramAddress(
      [anchor.utils.bytes.utf8.encode('user-todo-list'), owner.toBuffer()],
      PROGRAM_ID
    );
  };

  const createTask = async (
    title: string,
    description: string,
    priority: TaskPriority,
    category: TaskCategory,
    assignee?: PublicKey
  ): Promise<string> => {
    try {
      if (!wallet.publicKey) throw new Error('Wallet not connected!');

      const program = getProgram();
      const [todoListPDA] = await getTodoListPDA(wallet.publicKey);

      // Check if the todo list account exists
      try {
        await program.account.userTodoList.fetch(todoListPDA);
      } catch (e) {
        console.log('Todo list account does not exist, creating...');
      }

      const priorityValue = TaskPriorityValues[priority];
      const categoryValue = TaskCategoryValues[category];

      const tx = await program.methods
        .createTodoTask(
          title,
          description,
          priorityValue,
          categoryValue,
          assignee || null
        )
        .accounts({
          user: wallet.publicKey,
          todoList: todoListPDA,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      await connection.confirmTransaction(tx);
      
      notify({ 
        type: 'success', 
        message: 'Task created successfully!', 
        txid: tx,
        description: `Task "${title}" has been created on the blockchain.`
      });

      return tx;
    } catch (error: any) {
      console.error('Error creating task:', error);
      notify({ 
        type: 'error', 
        message: 'Failed to create task', 
        description: error?.message
      });
      throw error;
    }
  };

  const fetchTasks = async (): Promise<Task[]> => {
    try {
      if (!wallet.publicKey) throw new Error('Wallet not connected!');

      const program = getProgram();
      const [todoListPDA] = await getTodoListPDA(wallet.publicKey);
      
      const account = await program.account.userTodoList.fetch(todoListPDA);
      
      // Transform the account data to match our Task interface
      return account.tasks.map((task: any): Task => ({
        id: task.id.toNumber(),
        title: task.title,
        description: task.description,
        creator: task.creator,
        assignee: task.assignee,
        priority: task.priority,
        status: task.status,
        category: task.category,
        createdAt: task.createdAt.toNumber(),
        updatedAt: task.updatedAt.toNumber(),
        completedAt: task.completedAt ? task.completedAt.toNumber() : null
      }));
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      notify({ 
        type: 'error', 
        message: 'Failed to fetch tasks', 
        description: error?.message 
      });
      return [];
    }
  };

  const updateTaskStatus = async (
    taskId: number,
    newStatus: TaskStatus
  ): Promise<string> => {
    try {
      if (!wallet.publicKey) throw new Error('Wallet not connected!');

      const program = getProgram();
      const [todoListPDA] = await getTodoListPDA(wallet.publicKey);

      const tx = await program.methods
        .updateTaskStatus(
          new anchor.BN(taskId),
          { [newStatus.toLowerCase()]: {} }
        )
        .accounts({
          user: wallet.publicKey,
          todoList: todoListPDA,
        })
        .rpc();

      await connection.confirmTransaction(tx);

      notify({
        type: 'success',
        message: 'Task status updated!',
        txid: tx,
        description: `Task status has been updated to ${newStatus}`
      });

      return tx;
    } catch (error: any) {
      console.error('Error updating task status:', error);
      notify({
        type: 'error',
        message: 'Failed to update task status',
        description: error?.message
      });
      throw error;
    }
  };

  const assignTask = async (
    taskId: number,
    newAssignee: PublicKey
  ): Promise<string> => {
    try {
      if (!wallet.publicKey) throw new Error('Wallet not connected!');

      const program = getProgram();
      const [todoListPDA] = await getTodoListPDA(wallet.publicKey);

      const tx = await program.methods
        .reassignTask(
          new anchor.BN(taskId),
          newAssignee
        )
        .accounts({
          creator: wallet.publicKey,
          todoList: todoListPDA,
          assignee: newAssignee,
        })
        .rpc();

      await connection.confirmTransaction(tx);

      notify({
        type: 'success',
        message: 'Task assigned successfully!',
        txid: tx,
        description: `Task has been assigned to ${newAssignee.toString()}`
      });

      return tx;
    } catch (error: any) {
      console.error('Error assigning task:', error);
      notify({
        type: 'error',
        message: 'Failed to assign task',
        description: error?.message
      });
      throw error;
    }
  };

  return {
    createTask,
    fetchTasks,
    updateTaskStatus,
    assignTask,
  };
};