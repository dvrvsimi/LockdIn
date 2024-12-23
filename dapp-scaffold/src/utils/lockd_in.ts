/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/lockd_in.json`.
 */
export type LockdIn = {
  "address": "2KD5XEGEmkWqnhqvAijv2cxjJ4b8m3bXYQg3NPVLTP6h",
  "metadata": {
    "name": "lockdIn",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "createTodoTask",
      "discriminator": [
        86,
        23,
        27,
        149,
        195,
        117,
        98,
        246
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "todoList",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  45,
                  116,
                  111,
                  100,
                  111,
                  45,
                  108,
                  105,
                  115,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "notificationAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  45,
                  110,
                  111,
                  116,
                  105,
                  102,
                  105,
                  99,
                  97,
                  116,
                  105,
                  111,
                  110,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "assignee"
              }
            ]
          }
        },
        {
          "name": "assignee"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
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
            "defined": {
              "name": "taskPriority"
            }
          }
        },
        {
          "name": "category",
          "type": {
            "defined": {
              "name": "taskCategory"
            }
          }
        },
        {
          "name": "assignee",
          "type": {
            "option": "pubkey"
          }
        }
      ]
    },
    {
      "name": "reassignTask",
      "discriminator": [
        18,
        135,
        71,
        49,
        93,
        16,
        109,
        0
      ],
      "accounts": [
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "todoList",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  45,
                  116,
                  111,
                  100,
                  111,
                  45,
                  108,
                  105,
                  115,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "creator"
              }
            ]
          }
        },
        {
          "name": "notificationAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  45,
                  110,
                  111,
                  116,
                  105,
                  102,
                  105,
                  99,
                  97,
                  116,
                  105,
                  111,
                  110,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "assignee"
              }
            ]
          }
        },
        {
          "name": "assignee"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "taskId",
          "type": "u64"
        },
        {
          "name": "newAssignee",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "setTaskReminder",
      "discriminator": [
        203,
        227,
        136,
        204,
        115,
        232,
        68,
        248
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "todoList",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  45,
                  116,
                  111,
                  100,
                  111,
                  45,
                  108,
                  105,
                  115,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "notificationAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  45,
                  110,
                  111,
                  116,
                  105,
                  102,
                  105,
                  99,
                  97,
                  116,
                  105,
                  111,
                  110,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "taskId",
          "type": "u64"
        },
        {
          "name": "deadline",
          "type": "i64"
        }
      ]
    },
    {
      "name": "updateTaskStatus",
      "discriminator": [
        146,
        199,
        8,
        190,
        100,
        232,
        132,
        245
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "todoList",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  45,
                  116,
                  111,
                  100,
                  111,
                  45,
                  108,
                  105,
                  115,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
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
            "defined": {
              "name": "taskStatus"
            }
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "notificationAccount",
      "discriminator": [
        19,
        210,
        32,
        158,
        123,
        8,
        4,
        231
      ]
    },
    {
      "name": "userTodoList",
      "discriminator": [
        68,
        209,
        169,
        62,
        216,
        23,
        136,
        75
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidTitle",
      "msg": "Invalid task title or description"
    },
    {
      "code": 6001,
      "name": "taskAlreadyCompleted",
      "msg": "Task already completed"
    },
    {
      "code": 6002,
      "name": "unauthorizedModification",
      "msg": "Unauthorized task modification"
    },
    {
      "code": 6003,
      "name": "invalidPriority",
      "msg": "Invalid task priority"
    },
    {
      "code": 6004,
      "name": "maxTasksLimitReached",
      "msg": "Maximum tasks limit reached"
    },
    {
      "code": 6005,
      "name": "invalidStatusTransition",
      "msg": "Invalid task status transition"
    },
    {
      "code": 6006,
      "name": "taskNotFound",
      "msg": "Task not found"
    },
    {
      "code": 6007,
      "name": "invalidDeadline",
      "msg": "Invalid deadline - must be in the future"
    }
  ],
  "types": [
    {
      "name": "notificationAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "notifications",
            "type": {
              "vec": {
                "defined": {
                  "name": "taskNotification"
                }
              }
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
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
            "type": "pubkey"
          },
          {
            "name": "assignee",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "priority",
            "type": {
              "defined": {
                "name": "taskPriority"
              }
            }
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "taskStatus"
              }
            }
          },
          {
            "name": "category",
            "type": {
              "defined": {
                "name": "taskCategory"
              }
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
          },
          {
            "name": "deadline",
            "type": {
              "option": "i64"
            }
          }
        ]
      }
    },
    {
      "name": "taskCategory",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "work"
          },
          {
            "name": "personal"
          },
          {
            "name": "home"
          },
          {
            "name": "shopping"
          }
        ]
      }
    },
    {
      "name": "taskNotification",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "taskId",
            "type": "u64"
          },
          {
            "name": "from",
            "type": "pubkey"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "read",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "taskPriority",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "leisure"
          },
          {
            "name": "casual"
          },
          {
            "name": "urgent"
          }
        ]
      }
    },
    {
      "name": "taskStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "pending"
          },
          {
            "name": "inProgress"
          },
          {
            "name": "completed"
          },
          {
            "name": "cancelled"
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
            "type": "pubkey"
          },
          {
            "name": "tasks",
            "type": {
              "vec": {
                "defined": {
                  "name": "task"
                }
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
  ]
};
