import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import * as anchor from '@project-serum/anchor';
import { IDL } from '../utils/lock_in';
import { notify } from '../utils/notifications';

const PROGRAM_ID = new PublicKey('6rmb4Kmxibx3DVj9TDZ8tq5JrQhRGhEnyEtVrb7b8UUn');

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
      { commitment: 'confirmed' }
    );

    return new anchor.Program(IDL, PROGRAM_ID, provider);
  };

  const getTodoListPDA = async (owner: PublicKey) => {
    const [todoListPDA] = await PublicKey.findProgramAddress(
      [anchor.utils.bytes.utf8.encode('user-todo-list'), owner.toBuffer()],
      PROGRAM_ID
    );
    return todoListPDA;
  };

  const createTask = async (
    title: string,
    description: string,
    priority: 'Leisure' | 'Casual' | 'Urgent',
    category: 'Work' | 'Personal' | 'Home' | 'Shopping',
    assignee?: PublicKey
  ) => {
    try {
      const program = getProgram();
      const todoListPDA = await getTodoListPDA(wallet.publicKey!);

      const tx = await program.methods
        .createTodoTask(
          title,
          description,
          { [priority.toLowerCase()]: {} },
          { [category.toLowerCase()]: {} },
          assignee || null
        )
        .accounts({
          user: wallet.publicKey!,
          todoList: todoListPDA,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      notify({ type: 'success', message: 'Task created successfully!', txid: tx });
      return tx;
    } catch (error: any) {
      notify({ type: 'error', message: `Failed to create task: ${error?.message}` });
      throw error;
    }
  };

  const fetchTasks = async () => {
    try {
      const program = getProgram();
      const todoListPDA = await getTodoListPDA(wallet.publicKey!);
      const account = await program.account.userTodoList.fetch(todoListPDA);
      return account.tasks;
    } catch (error: any) {
      notify({ type: 'error', message: `Failed to fetch tasks: ${error?.message}` });
      throw error;
    }
  };

  return {
    createTask,
    fetchTasks,
  };
};