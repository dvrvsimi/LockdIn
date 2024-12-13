import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import * as anchor from '@project-serum/anchor';
import { IDL } from '../utils/lock_in';
import { notify } from '../utils/notifications';
import { Task } from '../models/types/task';


const PROGRAM_ID = new PublicKey('6rmb4Kmxibx3DVj9TDZ8tq5JrQhRGhEnyEtVrb7b8UUn'); // change after deploying program!!!!!!

export const useTaskProgram = () => {
  const { connection } = useConnection();
  const wallet = useWallet();

  const getProgram = () => {
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

  const getTodoListPDA = async (owner: PublicKey) => {
    const [todoListPDA] = await PublicKey.findProgramAddress(
      [anchor.utils.bytes.utf8.encode('user-todo-list'), owner.toBuffer()],
      PROGRAM_ID
    );
    return todoListPDA; // how to handle error from wrong deployed program id? or does that not matter?
  };

  const createTask = async (
    title: string,
    description: string,
    priority: 'Leisure' | 'Casual' | 'Urgent',
    category: 'Work' | 'Personal' | 'Home' | 'Shopping',
    assignee?: PublicKey
  ) => {
    try {
      if (!wallet.publicKey) throw new Error('Wallet not connected!');

      const program = getProgram();
      const todoListPDA = await getTodoListPDA(wallet.publicKey);

      // First, check if the todo list account exists
      let todoList;
      try {
        todoList = await program.account.userTodoList.fetch(todoListPDA);
      } catch (e) {
        // If account doesn't exist, we'll create it with the first task
        console.log('Todo list account does not exist, creating...');
      }

      const tx = await program.methods
        .createTodoTask(
          title,
          description,
          { [priority.toLowerCase()]: {} },
          { [category.toLowerCase()]: {} },
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
      const todoListPDA = await getTodoListPDA(wallet.publicKey);
      
      const account = await program.account.userTodoList.fetch(todoListPDA);
      return account.tasks as Task[]; // still don't know why i have to as Task[]
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

  return {
    createTask,
    fetchTasks,
  };
};