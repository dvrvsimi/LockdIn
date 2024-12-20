use anchor_lang::prelude::*;

declare_id!("DdJpnMdvznViXZs17HZyBw9sU9MsVCwmrfMZCAeEWwQL");

pub mod errors;
pub mod instructions;
pub mod state;

use instructions::*;
use state::*;

#[program]
pub mod lockd_in {
    use super::*;

    pub fn create_todo_task(
        ctx: Context<CreateTask>,
        title: String,
        description: String,
        priority: TaskPriority,
        category: TaskCategory,
        assignee: Option<Pubkey>,
    ) -> Result<()> {
        instructions::create_task(
            ctx,
            title,
            description,
            priority,
            category,
            assignee)
    }

    pub fn update_task_status(
        ctx: Context<UpdateTaskStatus>,
        task_id: u64,
        new_status: TaskStatus,
    ) -> Result<()> {
        instructions::update_task_status(
            ctx,
            task_id,
            new_status)
    }

    pub fn reassign_task(
        ctx: Context<AssignTask>,
        task_id: u64,
        new_assignee: Pubkey,
    ) -> Result<()> {
        instructions::assign_task(
            ctx,
            task_id,
            new_assignee)
    }


    pub fn set_task_reminder(
        ctx: Context<SetReminder>,
        task_id: u64,
        deadline: i64,
    ) -> Result<()> {
        instructions::set_reminder(
            ctx,
            task_id,
            deadline
        )
    }
}
