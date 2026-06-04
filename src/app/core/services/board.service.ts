import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Board } from '../models/board';
import { Column } from '../models/column';
import { Subtask, Task } from '../models/task';

@Injectable({
  providedIn: 'root',
})
export class BoardService {
  http = inject(HttpClient);

  boards = signal<Board[]>([]);
  selectedBoardId = signal<string | null>(null);
  selectedTaskId = signal<string | null>(null);

  saveBoards() {
    localStorage.setItem('kanban-boards', JSON.stringify(this.boards()));
  }

  selectedBoard = computed<Board | null>(() => {
    const id = this.selectedBoardId();
    return this.boards().find((board: Board) => board.id === id) ?? null;
  });

  selectedTask = computed<Task | null>(() => {
    const board = this.selectedBoard();
    const taskId = this.selectedTaskId();

    if (!board || !taskId) return null;

    for (const column of board.columns) {
      const task = column.tasks.find((task: Task) => task.id === taskId);
      if (task) return task;
    }

    return null;
  });

  async loadBoards() {
    const storedBoards = localStorage.getItem('kanban-boards');

    if (storedBoards) {
      this.boards.set(JSON.parse(storedBoards));

      if (this.boards().length > 0) {
        this.selectedBoardId.set(this.boards()[0].id);
      }

      return;
    }

    const data = await firstValueFrom(
      this.http.get<{ boards: Board[] }>('assets/data/data.json')
    );

    this.boards.set(data.boards);

    if (data.boards.length > 0) {
      this.selectedBoardId.set(data.boards[0].id);
    }

    this.saveBoards();
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
      name,
      columns: columnNames
        .filter((c) => c.trim().length > 0)
        .map((c): Column => ({
          id: this.generateId(),
          name: c.trim(),
          tasks: [],
        })),
    };

    this.boards.update((boards) => [...boards, newBoard]);
    this.saveBoards();
  }

  updateBoard(id: string, name: string, columnNames: string[] = []) {
    this.boards.update((boards) =>
      boards.map((board) => {
        if (board.id !== id) return board;

        const updatedColumns: Column[] = columnNames
          .filter((c) => c.trim().length > 0)
          .map((c) => {
            const existing = board.columns.find((col) => col.name === c);
            if (existing) return { ...existing, name: c };

            return {
              id: this.generateId(),
              name: c.trim(),
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

    this.saveBoards();
  }

  deleteBoard(id: string) {
    this.boards.update((boards) =>
      boards.filter((board) => board.id !== id)
    );

    this.saveBoards();

    if (this.selectedBoardId() === id) {
      this.selectedBoardId.set(null);
    }
  }

  addTask(boardId: string, columnId: string, task: Task) {
    this.boards.update((boards) =>
      boards.map((board) => {
        if (board.id !== boardId) return board;

        return {
          ...board,
          columns: board.columns.map((col) =>
            col.id === columnId
              ? { ...col, tasks: [...col.tasks, task] }
              : col
          ),
        };
      })
    );

    this.saveBoards();
  }

  updateTask(boardId: string, columnId: string, updatedTask: Task) {
    this.boards.update((boards) =>
      boards.map((board) => {
        if (board.id !== boardId) return board;

        return {
          ...board,
          columns: board.columns.map((col) => {
            if (col.id !== columnId) return col;

            return {
              ...col,
              tasks: col.tasks.map((t) =>
                t.id === updatedTask.id ? updatedTask : t
              ),
            };
          }),
        };
      })
    );

    this.saveBoards();
  }

  deleteTask(boardId: string, columnId: string, taskId: string) {
    this.boards.update((boards) =>
      boards.map((board) => {
        if (board.id !== boardId) return board;

        return {
          ...board,
          columns: board.columns.map((col) => {
            if (col.id !== columnId) return col;

            return {
              ...col,
              tasks: col.tasks.filter((t) => t.id !== taskId),
            };
          }),
        };
      })
    );

    this.saveBoards();
  }

  moveTask(
    boardId: string,
    taskId: string,
    fromColumnId: string,
    toColumnId: string,
    newIndex: number
  ) {
    let movedTask: Task | null = null;

    this.boards.update((boards) =>
      boards.map((board) => {
        if (board.id !== boardId) return board;

        const fromColumn = board.columns.find((c) => c.id === fromColumnId);
        const toColumn = board.columns.find((c) => c.id === toColumnId);

        if (!fromColumn || !toColumn) return board;

        const taskIndex = fromColumn.tasks.findIndex((t) => t.id === taskId);
        if (taskIndex === -1) return board;

        const task = fromColumn.tasks[taskIndex];

        movedTask = {
          ...task,
          status: toColumn.name,
        };

        const newFromTasks = fromColumn.tasks.filter(
          (t) => t.id !== taskId
        );

        const insertAt = Math.max(
          0,
          Math.min(newIndex, toColumn.tasks.length)
        );

        const newToTasks = [...toColumn.tasks];
        newToTasks.splice(insertAt, 0, movedTask);

        return {
          ...board,
          columns: board.columns.map((col) => {
            if (col.id === fromColumnId) {
              return { ...col, tasks: newFromTasks };
            }
            if (col.id === toColumnId) {
              return { ...col, tasks: newToTasks };
            }
            return col;
          }),
        };
      })
    );

    this.saveBoards();
  }

  toggleSubtask(
    boardId: string,
    columnId: string,
    taskId: string,
    subtaskIndex: number
  ) {
    this.boards.update((boards) =>
      boards.map((board) => {
        if (board.id !== boardId) return board;

        return {
          ...board,
          columns: board.columns.map((col) => {
            if (col.id !== columnId) return col;

            return {
              ...col,
              tasks: col.tasks.map((task) => {
                if (task.id !== taskId) return task;

                const updatedSubtasks: Subtask[] = (task.subtasks ?? []).map(
                  (subtask, index) =>
                    index === subtaskIndex
                      ? { ...subtask, isCompleted: !subtask.isCompleted }
                      : subtask
                );

                return { ...task, subtasks: updatedSubtasks };
              }),
            };
          }),
        };
      })
    );

    this.saveBoards();
  }

  generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }
}