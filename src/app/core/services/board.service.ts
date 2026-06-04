import { HttpClient } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Board } from '../models/board';
import { Column } from '../models/column';
import { Subtask, Task } from '../models/task';

const STORAGE_KEY = 'kanban-boards';

@Injectable({
  providedIn: 'root',
})
export class BoardService {

  http = inject(HttpClient);

  boards = signal<Board[]>([]);
  selectedBoardId = signal<string | null>(null);
  selectedTaskId = signal<string | null>(null);

  boardsLoaded = false;

  constructor() {
    effect(() => {
      const currentBoards = this.boards();
      if (this.boardsLoaded) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(currentBoards));
        } catch {
          // localStorage might be full or disabled - ignore
        }
      }
    });
  }

  selectedBoard = computed<Board | null>(() => {
    const id = this.selectedBoardId();
    return this.boards().find((board: Board) => board.id === id) ?? null;
  });

  selectedTask = computed<Task | null>(() => {
    const board = this.selectedBoard();
    const taskId = this.selectedTaskId();
    if (!board || !taskId) {
      return null;
    }

    for (const column of board.columns) {
      const task = column.tasks.find((task: Task) => task.id === taskId);
      if (task) {
        return task;
      }
    }

    return null;
  });

  async loadBoards() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Board[];
        this.boards.set(parsed);
        this.boardsLoaded = true;
        if (parsed.length > 0) {
          this.selectedBoardId.set(parsed[0].id);
        }
        return;
      } catch {
        // stored data is corrupted, fall through to JSON
      }
    }

    const data = await firstValueFrom(
      this.http.get<{ boards: Board[] }>('assets/data/data.json')
    );
    this.boards.set(data.boards);

    if (data.boards.length > 0) {
      this.selectedBoardId.set(data.boards[0].id);
    }
    this.boardsLoaded = true;
  }

  selectBoard(id: string) {
    this.selectedBoardId.set(id);
  }

  selectTask(id: string | null) {
    this.selectedTaskId.set(id);
  }

  addBoard(name: string, columnNames: string[] = []) {
    const newBoard: Board = {
      id: this.generateId(),
      name: name,
      columns: columnNames
        .filter((columnName: string) => columnName.trim().length > 0)
        .map((columnName: string): Column => ({
          id: this.generateId(),
          name: columnName.trim(),
          tasks: [],
        }))
    };

    this.boards.update((currentBoards: Board[]) => [...currentBoards, newBoard]);
  }

  updateBoard(id: string, name: string, columnNames: string[] = []) {
    this.boards.update((currentBoards: Board[]) =>
      currentBoards.map((board: Board) => {
        if (board.id !== id) return board;

        const updatedColumns: Column[] = columnNames
          .filter((columnName: string) => columnName.trim().length > 0)
          .map((columnName: string): Column => {
            const existing = board.columns.find((column: Column) => column.name === columnName);
            if (existing) {
              return { ...existing, name: columnName };
            }
            return {
              id: this.generateId(),
              name: columnName.trim(),
              tasks: [],
            };
          });

        return {
          ...board,
          name: name.trim() || board.name,
          columns: updatedColumns,
        };
      })
    );
  }

  deleteBoard(id: string) {
    this.boards.update((currentBoards: Board[]) =>
      currentBoards.filter((board: Board) => board.id !== id)
    );

    if (this.selectedBoardId() === id) {
      this.selectedBoardId.set(null);
    }
  }

  addTask(boardId: string, columnId: string, task: Task) {
    this.boards.update((currentBoards: Board[]) =>
      currentBoards.map((board: Board) => {
        if (board.id !== boardId) return board;
        return {
          ...board,
          columns: board.columns.map((column: Column) => {
            if (column.id !== columnId) return column;
            return {
              ...column,
              tasks: [...column.tasks, task],
            };
          }),
        };
      })
    );
  }

  updateTask(boardId: string, columnId: string, updatedTask: Task) {
    this.boards.update((currentBoards: Board[]) =>
      currentBoards.map((board: Board) => {
        if (board.id !== boardId) return board;
        return {
          ...board,
          columns: board.columns.map((column: Column) => {
            if (column.id !== columnId) return column;
            return {
              ...column,
              tasks: column.tasks.map((task: Task) =>
                task.id === updatedTask.id ? updatedTask : task
              ),
            };
          }),
        };
      })
    );
  }

  deleteTask(boardId: string, columnId: string, taskId: string) {
    this.boards.update((currentBoards: Board[]) =>
      currentBoards.map((board: Board) => {
        if (board.id !== boardId) return board;
        return {
          ...board,
          columns: board.columns.map((column: Column) => {
            if (column.id !== columnId) return column;
            return {
              ...column,
              tasks: column.tasks.filter((task: Task) => task.id !== taskId),
            };
          }),
        };
      })
    );
  }

  moveTask(
    boardId: string,
    taskId: string,
    fromColumnId: string,
    toColumnId: string,
    newIndex: number
  ) {
    let movedTask: Task | null = null;

    this.boards.update((currentBoards: Board[]) =>
      currentBoards.map((board: Board) => {
        if (board.id !== boardId) return board;

        const fromColumn = board.columns.find(
          (column: Column) => column.id === fromColumnId
        );
        const toColumn = board.columns.find(
          (column: Column) => column.id === toColumnId
        );
        if (!fromColumn || !toColumn) return board;

        const taskIndex = fromColumn.tasks.findIndex(
          (task: Task) => task.id === taskId
        );
        if (taskIndex === -1) return board;

        const task: Task = fromColumn.tasks[taskIndex];
        movedTask = {
          ...task,
          status: toColumn.name,
        };

        const newFromTasks: Task[] = fromColumn.tasks.filter(
          (taskItem: Task) => taskItem.id !== taskId
        );

        const insertAt = Math.max(0, Math.min(newIndex, toColumn.tasks.length));
        const newToTasks: Task[] = [...toColumn.tasks];
        newToTasks.splice(insertAt, 0, movedTask);

        return {
          ...board,
          columns: board.columns.map((column: Column) => {
            if (column.id === fromColumnId) {
              return { ...column, tasks: newFromTasks };
            }
            if (column.id === toColumnId) {
              return { ...column, tasks: newToTasks };
            }
            return column;
          }),
        };
      })
    );
  }

  toggleSubtask(
    boardId: string,
    columnId: string,
    taskId: string,
    subtaskIndex: number
  ) {
    this.boards.update((currentBoards: Board[]) =>
      currentBoards.map((board: Board) => {
        if (board.id !== boardId) return board;
        return {
          ...board,
          columns: board.columns.map((column: Column) => {
            if (column.id !== columnId) return column;
            return {
              ...column,
              tasks: column.tasks.map((task: Task) => {
                if (task.id !== taskId) return task;
                const updatedSubtasks: Subtask[] = (task.subtasks ?? []).map(
                  (subtask: Subtask, index: number) => {
                    if (index === subtaskIndex) {
                      return { ...subtask, isCompleted: !subtask.isCompleted };
                    }
                    return subtask;
                  }
                );
                return { ...task, subtasks: updatedSubtasks };
              }),
            };
          }),
        };
      })
    );
  }

  generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }
}
