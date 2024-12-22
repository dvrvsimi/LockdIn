import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { IDL } from '../utils/lockd_in';
import { notify } from '../utils/notifications';
import { 
  Task,
  ProgramTask,
  TaskPriority, 
  TaskCategory,
  TaskStatus,
  TodoListAccount,
  TaskNotification,
  convertToProgramStatus,
  convertToProgramPriority,
  convertToProgramCategory
} from '../models/types/task';

// Define the program type using the IDL
type LockdInProgram = Program<typeof IDL>;

const PROGRAM_ID = new PublicKey('6rmb4Kmxibx3DVj9TDZ8tq5JrQhRGhEnyEtVrb7b8UUn');

class TaskError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'TaskError';
  }
}

export const useTaskProgram = () => {
  const { connection } = useConnection();
  const wallet = useWallet();

  const validateWallet = () => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new TaskError('Wallet not connected!', 'WALLET_NOT_CONNECTED');
    }
    return wallet.publicKey;
  };

  const getProgram = (): LockdInProgram => {
    validateWallet();
    const provider = new anchor.AnchorProvider(
      connection, 
      {
        publicKey: wallet.publicKey!,
        signTransaction: wallet.signTransaction!,
        signAllTransactions: wallet.signAllTransactions!,
      },
      { commitment: 'processed' }
    );

    return new anchor.Program(IDL, PROGRAM_ID, provider);
  };

  const getTodoListPDA = async (owner: PublicKey): Promise<[PublicKey, number]> => {
    return await PublicKey.findProgramAddress(
      [Buffer.from('user-todo-list'), owner.toBuffer()],
      PROGRAM_ID
    );
  };

  const getNotificationPDA = async (owner: PublicKey): Promise<[PublicKey, number]> => {
    return await PublicKey.findProgramAddress(
      [Buffer.from('user-notifications'), owner.toBuffer()],
      PROGRAM_ID
    );
  };

  const convertProgramTaskToTask = (programTask: ProgramTask): Task => {
    return {
      id: programTask.id.toNumber(),
      title: programTask.title,
      description: programTask.description,
      creator: programTask.creator,
      assignee: programTask.assignee,
      priority: programTask.priority,
      status: programTask.status,
      category: programTask.category,
      createdAt: new Date(programTask.createdAt.toNumber() * 1000),
      updatedAt: new Date(programTask.updatedAt.toNumber() * 1000),
      completedAt: programTask.completedAt ? new Date(programTask.completedAt.toNumber() * 1000) : null,
      deadline: programTask.deadline ? new Date(programTask.deadline.toNumber() * 1000) : null,
    };
  };

  const createTask = async (
    title: string,
    description: string,
    priority: TaskPriority,
    category: TaskCategory,
    assignee?: PublicKey
  ): Promise<string> => {
    try {
      const userPubkey = validateWallet();
      const program = getProgram();
      const [todoListPDA] = await getTodoListPDA(userPubkey);

      // Input validation
      if (!title.trim() || title.length > 50) {
        throw new TaskError('Invalid title length', 'INVALID_TITLE');
      }
      if (!description.trim() || description.length > 250) {
        throw new TaskError('Invalid description length', 'INVALID_DESCRIPTION');
      }

      let accounts: any = {
        user: userPubkey,
        todoList: todoListPDA,
        systemProgram: SystemProgram.programId,
      };

      if (assignee) {
        const [notificationPDA] = await getNotificationPDA(assignee);
        accounts = {
          ...accounts,
          notificationAccount: notificationPDA,
          assignee: assignee,
        };
      }

      const tx = await program.methods
        .createTodoTask(
          title,
          description,
          convertToProgramPriority(priority),
          convertToProgramCategory(category),
          assignee || null
        )
        .accounts(accounts)
        .rpc();

      await connection.confirmTransaction(tx);
      
      notify({ 
        type: 'success', 
        message: 'Task created successfully!', 
        txid: tx,
        description: `Task "${title}" has been created.`
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
      const userPubkey = validateWallet();
      const program = getProgram();
      const [todoListPDA] = await getTodoListPDA(userPubkey);
      
      try {
        const account = await program.account.userTodoList.fetch(todoListPDA) as TodoListAccount;
        return account.tasks.map(convertProgramTaskToTask);
      } catch (err) {
        if ((err as Error).message?.includes('Account does not exist')) {
          return [];
        }
        throw err;
      }
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
      const userPubkey = validateWallet();
      const program = getProgram();
      const [todoListPDA] = await getTodoListPDA(userPubkey);

      const tx = await program.methods
        .updateTaskStatus(
          new anchor.BN(taskId),
          convertToProgramStatus(newStatus)
        )
        .accounts({
          user: userPubkey,
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
      const userPubkey = validateWallet();
      const program = getProgram();
      const [todoListPDA] = await getTodoListPDA(userPubkey);
      const [notificationPDA] = await getNotificationPDA(newAssignee);

      const tx = await program.methods
        .reassignTask(
          new anchor.BN(taskId),
          newAssignee
        )
        .accounts({
          creator: userPubkey,
          todoList: todoListPDA,
          notificationAccount: notificationPDA,
          assignee: newAssignee,
          systemProgram: SystemProgram.programId,
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

  const setTaskReminder = async (
    taskId: number,
    deadline: Date
  ): Promise<string> => {
    try {
      const userPubkey = validateWallet();
      const program = getProgram();
      const [todoListPDA] = await getTodoListPDA(userPubkey);
      const [notificationPDA] = await getNotificationPDA(userPubkey);

      const deadlineTimestamp = Math.floor(deadline.getTime() / 1000);

      const tx = await program.methods
        .setTaskReminder(
          new anchor.BN(taskId),
          new anchor.BN(deadlineTimestamp)
        )
        .accounts({
          user: userPubkey,
          todoList: todoListPDA,
          notificationAccount: notificationPDA,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      await connection.confirmTransaction(tx);

      notify({
        type: 'success',
        message: 'Reminder set successfully!',
        txid: tx,
        description: `Task reminder has been set for ${deadline.toLocaleDateString()}`
      });

      return tx;
    } catch (error: any) {
      console.error('Error setting reminder:', error);
      notify({
        type: 'error',
        message: 'Failed to set reminder',
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
    setTaskReminder,
  };
};