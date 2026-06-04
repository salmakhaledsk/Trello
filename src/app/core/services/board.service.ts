import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BoardService {

  http = inject(HttpClient);

  boards = signal<any[]>([]);
  selectedBoardId = signal<string | null>(null);
  selectedTaskId = signal<string | null>(null);

  selectedBoard = computed(() => {
    return (
      this.boards().find(
        board => board.id === this.selectedBoardId()
      ) || null
    );
  });

  selectedTask = computed(() => {

    const board = this.selectedBoard();

    if (!board || !this.selectedTaskId()) {
      return null;
    }

    for (let column of board.columns) {

      const task = column.tasks.find(
        (task: any) => task.id === this.selectedTaskId()
      );

      if (task) {
        return task;
      }
    }

    return null;
  });

  async loadBoards() {

    const data: any = await firstValueFrom(
      this.http.get('assets/data/data.json')
    );

    this.boards.set(data.boards);

    if (data.boards.length > 0) {
      this.selectedBoardId.set(data.boards[0].id);
    }
  }

  selectBoard(id: string) {
    this.selectedBoardId.set(id);
  }

  selectTask(id: string | null) {
    this.selectedTaskId.set(id);
  }

  addBoard(name: string, columnNames: string[] = []) {

    const newBoard: any = {
      id: this.generateId(),
      name,
      columns: columnNames
        .filter(c => c.trim().length > 0)
        .map(c => ({
          id: this.generateId(),
          name: c.trim(),
          tasks: []
        }))
    };

    this.boards.update(boards => [
      ...boards,
      newBoard
    ]);
  }

  updateBoard(id: string, name: string, columnNames: string[] = []) {
    this.boards.update(boards =>
      boards.map((board: any) => {
        if (board.id !== id) return board;

        const normalizedNames = columnNames.filter(c => c.trim().length > 0);
        const updatedColumns = normalizedNames.map((colName: string) => {
          const existing = board.columns.find((c: any) => c.name === colName);
          if (existing) return { ...existing, name: colName };
          return {
            id: this.generateId(),
            name: colName,
            tasks: [],
          };
        });

        return { ...board, name: name.trim() || board.name, columns: updatedColumns };
      })
    );
  }

  deleteBoard(id: string) {

    this.boards.update(
      boards => boards.filter(
        board => board.id !== id
      )
    );

    if (this.selectedBoardId() === id) {
      this.selectedBoardId.set(null);
    }
  }

  addTask(
    boardId: string,
    columnId: string,
    task: any
  ) {

    this.boards.update(boards =>
      boards.map(board => {

        if (board.id !== boardId) {
          return board;
        }

        return {
          ...board,

          columns: board.columns.map((column: any) => {

            if (column.id !== columnId) {
              return column;
            }

            return {
              ...column,
              tasks: [...column.tasks, task]
            };

          })
        };

      })
    );
  }

  updateTask(
    boardId: string,
    columnId: string,
    updatedTask: any
  ) {

    this.boards.update(boards =>
      boards.map(board => {

        if (board.id !== boardId) {
          return board;
        }

        return {
          ...board,

          columns: board.columns.map((column: any) => {

            if (column.id !== columnId) {
              return column;
            }

            return {
              ...column,

              tasks: column.tasks.map((task: any) =>
                task.id === updatedTask.id
                  ? updatedTask
                  : task
              )
            };

          })
        };

      })
    );
  }

  deleteTask(
    boardId: string,
    columnId: string,
    taskId: string
  ) {

    this.boards.update(boards =>
      boards.map(board => {

        if (board.id !== boardId) {
          return board;
        }

        return {
          ...board,

          columns: board.columns.map((column: any) => {

            if (column.id !== columnId) {
              return column;
            }

            return {
              ...column,

              tasks: column.tasks.filter(
                (task: any) => task.id !== taskId
              )
            };

          })
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

    this.boards.update(boards =>
      boards.map(board => {

        if (board.id !== boardId) {
          return board;
        }

        return {
          ...board,

          columns: board.columns.map((column: any) => {

            if (column.id !== columnId) {
              return column;
            }

            return {
              ...column,

              tasks: column.tasks.map((task: any) => {

                if (task.id !== taskId) {
                  return task;
                }

                const updatedSubtasks = task.subtasks.map(
                  (subtask: any, index: number) => {

                    if (index === subtaskIndex) {
                      return {
                        ...subtask,
                        isCompleted: !subtask.isCompleted
                      };
                    }

                    return subtask;
                  }
                );

                return {
                  ...task,
                  subtasks: updatedSubtasks
                };
              })
            };

          })
        };

      })
    );
  }

  generateId() {
    return Math.random().toString(36).substring(2, 9);
  }

}
