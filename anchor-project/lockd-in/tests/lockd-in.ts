import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { LockdIn } from "../target/types/lockd_in";
import { PublicKey, Keypair, LAMPORTS_PER_SOL, SystemProgram } from "@solana/web3.js";
import { expect } from "chai";

describe("lock-in", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.LockdIn as Program<LockdIn>;
  
  // Test accounts
  const user = Keypair.generate();
  const assignee = Keypair.generate();

  // Store PDA for todo list
  let todoListPda: PublicKey;

  before(async () => {
    // Airdrop SOL to user for transactions
    const signature = await provider.connection.requestAirdrop(
      user.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(signature);

    // Find PDA for todo list
    const [pda] = await PublicKey.findProgramAddress(
      [
        Buffer.from("user-todo-list"),
        user.publicKey.toBuffer()
      ],
      program.programId
    );
    todoListPda = pda;
  });

  describe("create_todo_task", () => {
    it("should create a new task successfully", async () => {
      const title = "Test Task";
      const description = "Test Description";
      
      await program.methods
        .createTodoTask(
          title,
          description,
          { casual: {} },  // TaskPriority
          { work: {} },    // TaskCategory
          null            // No assignee
        )
        .accounts({
          user: user.publicKey,
          todoList: todoListPda,
          systemProgram: SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      // Fetch the todo list account and verify
      const todoList = await program.account.userTodoList.fetch(todoListPda);
      expect(todoList.taskCount.toString()).to.equal("1");
      expect(todoList.tasks[0].title).to.equal(title);
      expect(todoList.tasks[0].description).to.equal(description);
      expect(todoList.tasks[0].creator.toString()).to.equal(user.publicKey.toString());
    });

    it("should fail with invalid title", async () => {
      try {
        await program.methods
          .createTodoTask(
            "a".repeat(51),  // Empty title
            "Description",
            { casual: {} },
            { work: {} },
            null
          )
          .accounts({
            user: user.publicKey,
            todoList: todoListPda,
            systemProgram: SystemProgram.programId,
          })
          .signers([user])
          .rpc();
        expect.fail("Expected tx failure");
      } catch (error: any) {
        const errorMsg = error.error?.message || error.message;
        expect(errorMsg).to.include("Invalid task title or description");
        }
      }
    );
  });

  describe("reassign_task", () => {
    it("should reassign a task to new assignee", async () => {
      // const initAssignee = Keypair.generate();

      // First create a task with initial assignee
      await program.methods
        .createTodoTask(
          "Task to Reassign",
          "Description",
          { urgent: {} },
          { work: {} },
          null
        )
        .accounts({
          user: user.publicKey,
          todoList: todoListPda,
          systemProgram: SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      // Get task ID
      const todoListBefore = await program.account.userTodoList.fetch(todoListPda);
      const taskId = todoListBefore.taskCount.subn(1);

      const newAssignee = Keypair.generate();


      // verify initial and new assignee are different
      // expect(initAssignee.publicKey.toString()).to.not.equal(newAssignee.publicKey.toString());

      // Reassign task
      await program.methods
        .reassignTask(
          taskId,
          newAssignee.publicKey
        )
        .accounts({
          creator: user.publicKey,
          todoList: todoListPda,
          assignee: newAssignee.publicKey,
        })
        .signers([user])
        .rpc();

      // Verify the reassignment
      const todoList = await program.account.userTodoList.fetch(todoListPda);
      const task = todoList.tasks.find(t => t.id.eq(taskId));
      
      expect(task.assignee?.toString()).to.equal(newAssignee.publicKey.toString());
    });
  });

  describe("update_task_status", () => {
    let taskId: anchor.BN;

    beforeEach(async () => {
      // Create a new task for status updates
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
          systemProgram: SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      const todoList = await program.account.userTodoList.fetch(todoListPda);
      taskId = todoList.taskCount.subn(1);
    });

    it("should update task status to in progress", async () => {
      // First verify initial status is pending
      let todoListBeforeUpdate = await program.account.userTodoList.fetch(todoListPda); // come back
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

      // Verify status update
      const todoList = await program.account.userTodoList.fetch(todoListPda);
      const task = todoList.tasks.find(t => t.id.eq(taskId));
      expect(JSON.stringify(task.status)).to.equal(JSON.stringify({ inProgress: {} }));
    });

    it("should update task status to completed", async () => {
      let todoList = await program.account.userTodoList.fetch(todoListPda);
      let task = todoList.tasks.find(t => t.id.eq(taskId));
      console.log("Initial task status:", task.status);
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


        // Verify the update immediately after
        todoList = await program.account.userTodoList.fetch(todoListPda);
        task = todoList.tasks.find(t => t.id.eq(taskId));
        console.log("Updated task status:", task.status);

        // Add a small delay to ensure state is settled
        await new Promise(resolve => setTimeout(resolve, 1000));
    
        expect(JSON.stringify(task.status)).to.equal(JSON.stringify({ completed: {} }));
        expect(task.completedAt).to.not.be.null;


      // // Verify status update
      // const todoListAfterUpdate = await program.account.userTodoList.fetch(todoListPda);
      // task = todoListAfterUpdate.tasks.find(t => t.id.eq(taskId));
      // console.log("Updated task status:", task.status);

      // // adding a small delay to ensure state is settled
      // await new Promise(resolve => setTimeout(resolve, 1000));

      // todoList = await program.account.userTodoList.fetch(todoListPda);
      // task = todoList.tasks.find(t => t.id.eq(taskId));
      // console.log("Final task status:", task.status);

      // const taskAfterUpdate = todoListAfterUpdate.tasks[todoListAfterUpdate.tasks.length - 1];
      // expect(JSON.stringify(taskAfterUpdate.status)).to.equal(JSON.stringify({ completed: {} }));
      // expect(taskAfterUpdate.completedAt).to.not.be.null;
    });
  });
});
