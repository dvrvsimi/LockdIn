import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { LockdIn } from "../target/types/lockd_in";
import { PublicKey, Keypair, LAMPORTS_PER_SOL, SystemProgram } from "@solana/web3.js";
import { expect } from "chai";

describe("lockd-in", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.LockdIn as Program<LockdIn>;
  
  // Test accounts
  const user = Keypair.generate();
  const assignee = Keypair.generate();
  let todoListPda: PublicKey;
  let notificationPda: PublicKey;

  // Helper functions
  const deriveNotificationPDA = async (owner: PublicKey): Promise<PublicKey> => {
    const [pda] = await PublicKey.findProgramAddress(
      [
        Buffer.from("user-notifications"),
        owner.toBuffer()
      ],
      program.programId
    );
    return pda;
  };

  const deriveTodoListPDA = async (owner: PublicKey): Promise<PublicKey> => {
    const [pda] = await PublicKey.findProgramAddress(
      [
        Buffer.from("user-todo-list"),
        owner.toBuffer()
      ],
      program.programId
    );
    return pda;
  };

  before(async () => {
    // Airdrop SOL to user for transactions
    const signature = await provider.connection.requestAirdrop(
      user.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(signature);

    const signatureAssignee = await provider.connection.requestAirdrop(
      assignee.publicKey,
      LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(signatureAssignee);

    // Initialize PDAs
    todoListPda = await deriveTodoListPDA(user.publicKey);
    notificationPda = await deriveNotificationPDA(assignee.publicKey);
  });

  describe("create_todo_task", () => {
    it("should create a new task successfully", async () => {
      const title = "Test Task";
      const description = "Test Description";
      
      try {
        await program.methods
          .createTodoTask(
            title,
            description,
            { casual: {} },
            { work: {} },
            assignee.publicKey
          )
          .accounts({
            user: user.publicKey,
            todoList: todoListPda,
            notificationAccount: notificationPda,
            assignee: assignee.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([user])
          .rpc();

        const todoList = await program.account.userTodoList.fetch(todoListPda);
        expect(todoList.taskCount.toString()).to.equal("1");
        expect(todoList.tasks[0].title).to.equal(title);
        expect(todoList.tasks[0].description).to.equal(description);
        expect(todoList.tasks[0].creator.toString()).to.equal(user.publicKey.toString());
      } catch (error) {
        console.error("Error:", error);
        throw error;
      }
    });

    it("should fail with invalid title", async () => {
      const userNotificationPda = await deriveNotificationPDA(user.publicKey);
      
      try {
        await program.methods
          .createTodoTask(
            "a".repeat(51),
            "Description",
            { casual: {} },
            { work: {} },
            null
          )
          .accounts({
            user: user.publicKey,
            todoList: todoListPda,
            notificationAccount: userNotificationPda,
            assignee: user.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([user])
          .rpc();
        expect.fail("Expected to fail with invalid title");
      } catch (error: any) {
        const errorMsg = error.error?.message || error.message;
        expect(errorMsg).to.include("Invalid task title or description");
      }
    });
  });

  describe("set_task_reminder", () => {
    let taskId: anchor.BN;

    beforeEach(async () => {
      try {
        await program.methods
          .createTodoTask(
            "Task with Reminder",
            "Description",
            { urgent: {} },
            { work: {} },
            assignee.publicKey
          )
          .accounts({
            user: user.publicKey,
            todoList: todoListPda,
            notificationAccount: notificationPda,
            assignee: assignee.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([user])
          .rpc();

        const todoList = await program.account.userTodoList.fetch(todoListPda);
        taskId = todoList.taskCount.subn(1);
      } catch (error) {
        console.error("Error in beforeEach:", error);
        throw error;
      }
    });

    it("should set a reminder successfully", async () => {
      const now = Math.floor(Date.now() / 1000);
      const deadline = now + (3 * 24 * 60 * 60);
      const userNotificationPda = await deriveNotificationPDA(user.publicKey);

      try {
        await program.methods
          .setTaskReminder(
            taskId,
            new anchor.BN(deadline)
          )
          .accounts({
            user: user.publicKey,
            todoList: todoListPda,
            notificationAccount: userNotificationPda,
            systemProgram: SystemProgram.programId,
          })
          .signers([user])
          .rpc();

        const todoList = await program.account.userTodoList.fetch(todoListPda);
        const task = todoList.tasks.find(t => t.id.eq(taskId));
        expect(task.deadline?.toNumber()).to.equal(deadline);
      } catch (error) {
        console.error("Error:", error);
        throw error;
      }
    });
  });

  describe("reassign_task", () => {
    it("should reassign a task to new assignee", async () => {
      const title = "Task to Reassign";
      const description = "Description";
      const userNotificationPda = await deriveNotificationPDA(user.publicKey);
      
      // Create task without initial assignee
      await program.methods
        .createTodoTask(
          title,
          description, 
          { urgent: {} },
          { work: {} },
          null
        )
        .accounts({
          user: user.publicKey,
          todoList: todoListPda,
          notificationAccount: userNotificationPda,
          assignee: user.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      const todoList = await program.account.userTodoList.fetch(todoListPda);
      const taskId = todoList.taskCount.subn(1);

      const newAssignee = Keypair.generate();
      const newAssigneeNotificationPda = await deriveNotificationPDA(newAssignee.publicKey);

      await program.methods
        .reassignTask(
          taskId,
          newAssignee.publicKey
        )
        .accounts({
          creator: user.publicKey,
          todoList: todoListPda,
          notificationAccount: newAssigneeNotificationPda,
          assignee: newAssignee.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      const updatedTodoList = await program.account.userTodoList.fetch(todoListPda);
      const task = updatedTodoList.tasks.find(t => t.id.eq(taskId));
      expect(task.assignee?.toString()).to.equal(newAssignee.publicKey.toString());
    });
  });

  describe("update_task_status", () => {
    let taskId: anchor.BN;
    let userNotificationPda: PublicKey;

    beforeEach(async () => {
      userNotificationPda = await deriveNotificationPDA(user.publicKey);
      
      await program.methods
        .createTodoTask(
          "Status Test Task",
          "Description",
          { casual: {} },
          { work: {} },
          null
        )
        .accounts({
          user: user.publicKey,
          todoList: todoListPda,
          notificationAccount: userNotificationPda,
          assignee: user.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      const todoList = await program.account.userTodoList.fetch(todoListPda);
      taskId = todoList.taskCount.subn(1);
    });

    it("should update task status to in progress", async () => {
      let todoListBeforeUpdate = await program.account.userTodoList.fetch(todoListPda);
      let taskBeforeUpdate = todoListBeforeUpdate.tasks[todoListBeforeUpdate.tasks.length - 1];
      expect(JSON.stringify(taskBeforeUpdate.status)).to.equal(JSON.stringify({ pending: {} }));

      await program.methods
        .updateTaskStatus(
          taskId,
          { inProgress: {} }
        )
        .accounts({
          user: user.publicKey,
          todoList: todoListPda,
        })
        .signers([user])
        .rpc();

      const todoList = await program.account.userTodoList.fetch(todoListPda);
      const task = todoList.tasks.find(t => t.id.eq(taskId));
      expect(JSON.stringify(task.status)).to.equal(JSON.stringify({ inProgress: {} }));
    });

    it("should update task status to completed", async () => {
      await program.methods
        .updateTaskStatus(
          taskId,
          { completed: {} }
        )
        .accounts({
          user: user.publicKey,
          todoList: todoListPda,
        })
        .signers([user])
        .rpc();

      const todoList = await program.account.userTodoList.fetch(todoListPda);
      const task = todoList.tasks.find(t => t.id.eq(taskId));
      expect(JSON.stringify(task.status)).to.equal(JSON.stringify({ completed: {} }));
      expect(task.completedAt).to.not.be.null;
    });

    it("should prevent updating completed task", async () => {
      await program.methods
        .updateTaskStatus(taskId, { completed: {} })
        .accounts({
          user: user.publicKey,
          todoList: todoListPda,
        })
        .signers([user])
        .rpc();

      try {
        await program.methods
          .updateTaskStatus(taskId, { inProgress: {} })
          .accounts({
            user: user.publicKey,
            todoList: todoListPda,
          })
          .signers([user])
          .rpc();
        expect.fail("Should not be able to update completed task");
      } catch (error: any) {
        expect(error.error.errorMessage).to.equal("Task already completed");
      }
    });
  });

  describe("task_notifications", () => {
    it("should notify assignee when task is assigned", async () => {
      const title = "Test Task with Notification";
    
      try {
        await program.methods
          .createTodoTask(
            title,
            "Description",
            { casual: {} },
            { work: {} },
            assignee.publicKey
          )
          .accounts({
            user: user.publicKey,
            todoList: todoListPda,
            notificationAccount: notificationPda,
            assignee: assignee.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([user])
          .rpc();
    
        const notificationAccount = await program.account.notificationAccount.fetch(notificationPda);
        expect(notificationAccount.notifications).to.have.length.above(0);
      } catch (error) {
        console.error("Error:", error);
        throw error;
      }
    });
  
    it("should notify assignee when task is reassigned", async () => {
      const userNotificationPda = await deriveNotificationPDA(user.publicKey);
      
      try {
        await program.methods
          .createTodoTask(
            "Task to Reassign",
            "Description",
            { casual: {} },
            { work: {} },
            null
          )
          .accounts({
            user: user.publicKey,
            todoList: todoListPda,
            notificationAccount: userNotificationPda,
            assignee: user.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([user])
          .rpc();
  
        const todoList = await program.account.userTodoList.fetch(todoListPda);
        const taskId = todoList.taskCount.subn(1);
  
        await program.methods
          .reassignTask(
            taskId,
            assignee.publicKey
          )
          .accounts({
            creator: user.publicKey,
            todoList: todoListPda,
            notificationAccount: notificationPda,
            assignee: assignee.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([user])
          .rpc();
  
        const notificationAccount = await program.account.notificationAccount.fetch(notificationPda);
        const latestNotification = notificationAccount.notifications[notificationAccount.notifications.length - 1];
  
        expect(latestNotification).to.not.be.undefined;
        expect(latestNotification.title).to.include("Task Reassigned");
        expect(latestNotification.from.toString()).to.equal(user.publicKey.toString());
        expect(latestNotification.read).to.be.false;
      } catch (error) {
        console.error("Error:", error);
        throw error;
      }
    });
  });
});