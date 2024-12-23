use anchor_lang::prelude::*;
use crate::errors::TodoError;
use crate::state::{Task, TaskPriority, TaskStatus, TaskCategory, UserTodoList, TaskNotification, NotificationAccount};

#[derive(Accounts)]
pub struct CreateTask<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(
        init_if_needed,
        seeds = [b"user-todo-list", user.key().as_ref()],
        bump,
        payer = user,
        space = 8 + std::mem::size_of::<UserTodoList>() + 1024
    )]
    pub todo_list: Account<'info, UserTodoList>,


    // notif account
    #[account(
        init_if_needed,
        seeds = [b"user-notifications", assignee.key().as_ref()],
        bump,
        payer = user,
        space = 8 + std::mem::size_of::<NotificationAccount>() + 1024,
        // constraint = assignee.key() != user.key() // only init this account if there's an assignee
    )]
    pub notification_account: Account<'info, NotificationAccount>,

    /// CHECK: Only used as a key for seeds?
    pub assignee: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateTaskStatus<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"user-todo-list", user.key().as_ref()],
        bump,
    )]
    pub todo_list: Account<'info, UserTodoList>,
}

#[derive(Accounts)]
pub struct AssignTask<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"user-todo-list", creator.key().as_ref()],
        bump,
    )]
    pub todo_list: Account<'info, UserTodoList>,

    #[account(
        init_if_needed,
        seeds = [b"user-notifications", assignee.key().as_ref()],
        bump,
        payer = creator,
        space = 8 + std::mem::size_of::<NotificationAccount>() + 1024
    )]
    pub notification_account: Account<'info, NotificationAccount>,

    /// CHECK: Validated in handler
    pub assignee: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SetReminder<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"user-todo-list", user.key().as_ref()],
        bump,
    )]
    pub todo_list: Account<'info, UserTodoList>,

    #[account(
        init_if_needed,
        seeds = [b"user-notifications", user.key().as_ref()],
        bump,
        payer = user,
        space = 8 + std::mem::size_of::<NotificationAccount>() + 1024
    )]
    pub notification_account: Account<'info, NotificationAccount>,

    pub system_program: Program<'info, System>,
}


pub fn create_task(
    ctx: Context<CreateTask>, 
    title: String, 
    description: String,
    priority: TaskPriority,
    category: TaskCategory,
    assignee: Option<Pubkey>
) -> Result<()> {

    // check for self-assignment
    if let Some(assignee_key) = assignee {
        require!(
            assignee_key != ctx.accounts.user.key(),
            TodoError::UnauthorizedModification
        );
    }


    // Initialize notification account if it's new
    if ctx.accounts.notification_account.owner == Pubkey::default() {
        ctx.accounts.notification_account.owner = ctx.accounts.assignee.key();
        ctx.accounts.notification_account.notifications = Vec::new();
        ctx.accounts.notification_account.bump = ctx.bumps.notification_account;
    }


    require!(title.len() <= Task::MAX_TITLE_LENGTH, TodoError::InvalidTitle);
    require!(description.len() <= Task::MAX_DESCRIPTION_LENGTH, TodoError::InvalidTitle);
    require!(ctx.accounts.todo_list.tasks.len() < Task::MAX_TASKS, TodoError::MaxTasksLimitReached);

    let todo_list = &mut ctx.accounts.todo_list;
    let task_id = todo_list.task_count.checked_add(1)
        .ok_or(TodoError::MaxTasksLimitReached)?;

    let task_title = title.clone();
    let new_task = Task::new(
        task_id,
        title,
        description,
        ctx.accounts.user.key(),
        assignee,
        priority,
        category
    );

    todo_list.tasks.push(new_task);
    todo_list.task_count += 1;

    // if user is assigning task to someone else
    if assignee.is_some() {
        let notification = TaskNotification {
            task_id,
            from: ctx.accounts.user.key(),
            title: format!("New Task Assigned: {}", task_title),
            timestamp: Clock::get()?.unix_timestamp,
            read: false,
        };
        
        let notification_account = &mut ctx.accounts.notification_account;
        notification_account.notifications.push(notification);
    
    }

    Ok(())
}

pub fn update_task_status(
    ctx: Context<UpdateTaskStatus>,
    task_id: u64,
    new_status: TaskStatus,
) -> Result<()> {
    let todo_list = &mut ctx.accounts.todo_list;
    let clock = Clock::get()?;
    let current_timestamp = clock.unix_timestamp;

    let task = todo_list.tasks.iter_mut()
        .find(|t| t.id == task_id)
        .ok_or(TodoError::TaskNotFound)?;

    require!(
        task.creator == ctx.accounts.user.key() || 
        task.assignee == Some(ctx.accounts.user.key()),
        TodoError::UnauthorizedModification
    );

    match task.status {
        TaskStatus::Completed => {
            return Err(TodoError::TaskAlreadyCompleted.into())
        }
        TaskStatus::Cancelled => {
            require!(
                new_status == TaskStatus::InProgress,
                TodoError::InvalidStatusTransition
            );
        }
        _ => {}
    }

    task.status = new_status;
    task.updated_at = current_timestamp;

    if new_status == TaskStatus::Completed {
        task.completed_at = Some(current_timestamp);
        
        let today = current_timestamp / 86400;
        if let Some(last_completed) = todo_list.last_completed_date {
            let last_completed_day = last_completed / 86400;
            if last_completed_day == today - 1 {
                todo_list.completed_task_streak += 1;
            } else {
                todo_list.completed_task_streak = 1;
            }
        } else {
            todo_list.completed_task_streak = 1;
        }
        todo_list.last_completed_date = Some(current_timestamp);
    }

    Ok(())
}

pub fn assign_task(
    ctx: Context<AssignTask>, 
    task_id: u64, 
    new_assignee: Pubkey
) -> Result<()> {
    let todo_list = &mut ctx.accounts.todo_list;
    let clock = Clock::get()?;
    let current_timestamp = clock.unix_timestamp;

    let task = todo_list.tasks.iter_mut()
        .find(|t| t.id == task_id)
        .ok_or(TodoError::UnauthorizedModification)?;

    require!(task.creator == ctx.accounts.creator.key(), TodoError::UnauthorizedModification);

    task.assignee = Some(new_assignee);
    task.updated_at = current_timestamp;

    
    // notif feature
    let notification = TaskNotification {
        task_id,
        from: ctx.accounts.creator.key(),
        title: format!("Task Reassigned: {}", task.title),
        timestamp: current_timestamp,
        read: false,
    };
    
    let notification_account = &mut ctx.accounts.notification_account;
    notification_account.notifications.push(notification);

    Ok(())
}


pub fn set_reminder(
    ctx: Context<SetReminder>,
    task_id: u64,
    deadline: i64,  // timestamp for the deadline
) -> Result<()> {
    let todo_list = &mut ctx.accounts.todo_list;
    let current_timestamp = Clock::get()?.unix_timestamp;
    
    // Find the task
    let task = todo_list.tasks.iter_mut()
        .find(|t| t.id == task_id)
        .ok_or(TodoError::TaskNotFound)?;
    
    // verify the user is either the creator OR assignee
    require!(
        task.creator == ctx.accounts.user.key() || 
        task.assignee == Some(ctx.accounts.user.key()),
        TodoError::UnauthorizedModification
    );

    // ensure deadline is in the future
    require!(
        deadline > current_timestamp,
        TodoError::InvalidDeadline // add this in errors.rs
    );

    // calculate days until deadline
    let days_until_deadline = (deadline - current_timestamp) / 86400; // convert to days

    // create reminder notification based on urgency
    let reminder_message = match days_until_deadline {
        0 => format!("URGENT: Task '{}' is due today!", task.title),
        1 => format!("Task '{}' is due tomorrow!", task.title),
        2..=3 => format!("Task '{}' is due in {} days", task.title, days_until_deadline),
        _ => {
            // Format date as dd-mm-yyyy using timestamp
            let seconds_per_day = 86400;
            let days_since_epoch = deadline / seconds_per_day;
            let years = 1970 + (days_since_epoch / 365);
            let days = days_since_epoch % 365;
            let months = (days / 30) + 1;
            let day = (days % 30) + 1;
            
            format!("Task '{}' is due on {}-{:02}-{:02}", 
                task.title, day, months, years)
        }
    };

    let notification = TaskNotification {
        task_id,
        from: ctx.accounts.user.key(),
        title: reminder_message,
        timestamp: current_timestamp,
        read: false,
    };

    let notification_account = &mut ctx.accounts.notification_account;
    notification_account.notifications.push(notification);

    // update task deadline
    task.deadline = Some(deadline);
    task.updated_at = current_timestamp;

    Ok(())
}