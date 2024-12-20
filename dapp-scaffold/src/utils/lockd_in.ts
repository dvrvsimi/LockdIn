export type LockIn = {
    "version": "0.1.0",
    "name": "lock_in",
    "instructions": [
      {
        "name": "createTodoTask",
        "accounts": [
          {
            "name": "user",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "todoList",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "systemProgram",
            "isMut": false,
            "isSigner": false
          }
        ],
        "args": [
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "priority",
            "type": {
              "defined": "TaskPriority"
            }
          },
          {
            "name": "category",
            "type": {
              "defined": "TaskCategory"
            }
          },
          {
            "name": "assignee",
            "type": {
              "option": "publicKey"
            }
          }
        ]
      },
      {
        "name": "updateTaskStatus",
        "accounts": [
          {
            "name": "user",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "todoList",
            "isMut": true,
            "isSigner": false
          }
        ],
        "args": [
          {
            "name": "taskId",
            "type": "u64"
          },
          {
            "name": "newStatus",
            "type": {
              "defined": "TaskStatus"
            }
          }
        ]
      },
      {
        "name": "reassignTask",
        "accounts": [
          {
            "name": "creator",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "todoList",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "assignee",
            "isMut": false,
            "isSigner": false
          }
        ],
        "args": [
          {
            "name": "taskId",
            "type": "u64"
          },
          {
            "name": "newAssignee",
            "type": "publicKey"
          }
        ]
      }
    ],
    "accounts": [
      {
        "name": "task",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "id",
              "type": "u64"
            },
            {
              "name": "title",
              "type": "string"
            },
            {
              "name": "description",
              "type": "string"
            },
            {
              "name": "creator",
              "type": "publicKey"
            },
            {
              "name": "assignee",
              "type": {
                "option": "publicKey"
              }
            },
            {
              "name": "priority",
              "type": {
                "defined": "TaskPriority"
              }
            },
            {
              "name": "status",
              "type": {
                "defined": "TaskStatus"
              }
            },
            {
              "name": "category",
              "type": {
                "defined": "TaskCategory"
              }
            },
            {
              "name": "createdAt",
              "type": "i64"
            },
            {
              "name": "updatedAt",
              "type": "i64"
            },
            {
              "name": "completedAt",
              "type": {
                "option": "i64"
              }
            }
          ]
        }
      },
      {
        "name": "userTodoList",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "owner",
              "type": "publicKey"
            },
            {
              "name": "tasks",
              "type": {
                "vec": {
                  "defined": "Task"
                }
              }
            },
            {
              "name": "taskCount",
              "type": "u64"
            },
            {
              "name": "completedTaskStreak",
              "type": "u64"
            },
            {
              "name": "lastCompletedDate",
              "type": {
                "option": "i64"
              }
            },
            {
              "name": "bump",
              "type": "u8"
            }
          ]
        }
      }
    ],
    "types": [
      {
        "name": "TaskPriority",
        "type": {
          "kind": "enum",
          "variants": [
            {
              "name": "Leisure"
            },
            {
              "name": "Casual"
            },
            {
              "name": "Urgent"
            }
          ]
        }
      },
      {
        "name": "TaskStatus",
        "type": {
          "kind": "enum",
          "variants": [
            {
              "name": "Pending"
            },
            {
              "name": "InProgress"
            },
            {
              "name": "Completed"
            },
            {
              "name": "Cancelled"
            }
          ]
        }
      },
      {
        "name": "TaskCategory",
        "type": {
          "kind": "enum",
          "variants": [
            {
              "name": "Work"
            },
            {
              "name": "Personal"
            },
            {
              "name": "Home"
            },
            {
              "name": "Shopping"
            }
          ]
        }
      }
    ],
    "errors": [
      {
        "code": 6000,
        "name": "InvalidTitle",
        "msg": "Invalid task title or description"
      },
      {
        "code": 6001,
        "name": "TaskAlreadyCompleted",
        "msg": "Task already completed"
      },
      {
        "code": 6002,
        "name": "UnauthorizedModification",
        "msg": "Unauthorized task modification"
      },
      {
        "code": 6003,
        "name": "InvalidPriority",
        "msg": "Invalid task priority"
      },
      {
        "code": 6004,
        "name": "MaxTasksLimitReached",
        "msg": "Maximum tasks limit reached"
      },
      {
        "code": 6005,
        "name": "InvalidStatusTransition",
        "msg": "Invalid task status transition"
      },
      {
        "code": 6006,
        "name": "TaskNotFound",
        "msg": "Task not found"
      }
    ]
  };
  
  export const IDL: LockIn = {
    "version": "0.1.0",
    "name": "lock_in",
    "instructions": [
      {
        "name": "createTodoTask",
        "accounts": [
          {
            "name": "user",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "todoList",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "systemProgram",
            "isMut": false,
            "isSigner": false
          }
        ],
        "args": [
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "priority",
            "type": {
              "defined": "TaskPriority"
            }
          },
          {
            "name": "category",
            "type": {
              "defined": "TaskCategory"
            }
          },
          {
            "name": "assignee",
            "type": {
              "option": "publicKey"
            }
          }
        ]
      },
      {
        "name": "updateTaskStatus",
        "accounts": [
          {
            "name": "user",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "todoList",
            "isMut": true,
            "isSigner": false
          }
        ],
        "args": [
          {
            "name": "taskId",
            "type": "u64"
          },
          {
            "name": "newStatus",
            "type": {
              "defined": "TaskStatus"
            }
          }
        ]
      },
      {
        "name": "reassignTask",
        "accounts": [
          {
            "name": "creator",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "todoList",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "assignee",
            "isMut": false,
            "isSigner": false
          }
        ],
        "args": [
          {
            "name": "taskId",
            "type": "u64"
          },
          {
            "name": "newAssignee",
            "type": "publicKey"
          }
        ]
      }
    ],
    "accounts": [
      {
        "name": "task",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "id",
              "type": "u64"
            },
            {
              "name": "title",
              "type": "string"
            },
            {
              "name": "description",
              "type": "string"
            },
            {
              "name": "creator",
              "type": "publicKey"
            },
            {
              "name": "assignee",
              "type": {
                "option": "publicKey"
              }
            },
            {
              "name": "priority",
              "type": {
                "defined": "TaskPriority"
              }
            },
            {
              "name": "status",
              "type": {
                "defined": "TaskStatus"
              }
            },
            {
              "name": "category",
              "type": {
                "defined": "TaskCategory"
              }
            },
            {
              "name": "createdAt",
              "type": "i64"
            },
            {
              "name": "updatedAt",
              "type": "i64"
            },
            {
              "name": "completedAt",
              "type": {
                "option": "i64"
              }
            }
          ]
        }
      },
      {
        "name": "userTodoList",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "owner",
              "type": "publicKey"
            },
            {
              "name": "tasks",
              "type": {
                "vec": {
                  "defined": "Task"
                }
              }
            },
            {
              "name": "taskCount",
              "type": "u64"
            },
            {
              "name": "completedTaskStreak",
              "type": "u64"
            },
            {
              "name": "lastCompletedDate",
              "type": {
                "option": "i64"
              }
            },
            {
              "name": "bump",
              "type": "u8"
            }
          ]
        }
      }
    ],
    "types": [
      {
        "name": "TaskPriority",
        "type": {
          "kind": "enum",
          "variants": [
            {
              "name": "Leisure"
            },
            {
              "name": "Casual"
            },
            {
              "name": "Urgent"
            }
          ]
        }
      },
      {
        "name": "TaskStatus",
        "type": {
          "kind": "enum",
          "variants": [
            {
              "name": "Pending"
            },
            {
              "name": "InProgress"
            },
            {
              "name": "Completed"
            },
            {
              "name": "Cancelled"
            }
          ]
        }
      },
      {
        "name": "TaskCategory",
        "type": {
          "kind": "enum",
          "variants": [
            {
              "name": "Work"
            },
            {
              "name": "Personal"
            },
            {
              "name": "Home"
            },
            {
              "name": "Shopping"
            }
          ]
        }
      }
    ],
    "errors": [
      {
        "code": 6000,
        "name": "InvalidTitle",
        "msg": "Invalid task title or description"
      },
      {
        "code": 6001,
        "name": "TaskAlreadyCompleted",
        "msg": "Task already completed"
      },
      {
        "code": 6002,
        "name": "UnauthorizedModification",
        "msg": "Unauthorized task modification"
      },
      {
        "code": 6003,
        "name": "InvalidPriority",
        "msg": "Invalid task priority"
      },
      {
        "code": 6004,
        "name": "MaxTasksLimitReached",
        "msg": "Maximum tasks limit reached"
      },
      {
        "code": 6005,
        "name": "InvalidStatusTransition",
        "msg": "Invalid task status transition"
      },
      {
        "code": 6006,
        "name": "TaskNotFound",
        "msg": "Task not found"
      }
    ]
  };