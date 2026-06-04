import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BoardService } from '../../../../core/services/board.service';
import { Column } from '../../../../core/models/column';
import { Subtask, Task } from '../../../../core/models/task';

@Component({
  selector: 'app-view-task-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './view-task-modal.component.html',
  styleUrl: './view-task-modal.component.css',
})
export class ViewTaskModalComponent {
  boardService = inject(BoardService);

  selectedBoard = this.boardService.selectedBoard;
  selectedTask = this.boardService.selectedTask;

  availableStatuses = computed<string[]>(() => {
    const board = this.selectedBoard();
    if (!board) return [];
    return board.columns.map((column: Column) => column.name);
  });

  findTaskColumn(): Column | null {
    const task = this.selectedTask();
    const board = this.selectedBoard();
    if (!task || !board) return null;
    return (
      board.columns.find((column: Column) =>
        column.tasks.some((taskItem: Task) => taskItem.id === task.id)
      ) ?? null
    );
  }

  toggleSubtask(index: number) {
    const task = this.selectedTask();
    const board = this.selectedBoard();
    if (!task || !board) return;
    const column = this.findTaskColumn();
    if (!column) return;
    this.boardService.toggleSubtask(board.id, column.id, task.id, index);
  }

  onStatusChange(newStatus: string) {
    const task = this.selectedTask();
    const board = this.selectedBoard();
    if (!task || !board) return;

    const column = this.findTaskColumn();
    if (!column) return;

    const updatedTask: Task = { ...task, status: newStatus };
    this.boardService.updateTask(board.id, column.id, updatedTask);
  }

  countCompleted(task: Task): number {
    return (task.subtasks ?? []).filter(
      (subtask: Subtask) => subtask.isCompleted
    ).length;
  }

  editTask() {
    const modalEl: HTMLElement | null = document.getElementById('viewTaskModal');
    if (!modalEl) return;
    const bootstrapWindow = window as unknown as { bootstrap?: { Modal: { getInstance: (el: HTMLElement) => { hide: () => void } | null; new (el: HTMLElement): { hide: () => void } } } };
    const Modal = bootstrapWindow.bootstrap?.Modal;
    if (Modal) {
      const instance = Modal.getInstance(modalEl) ?? new Modal(modalEl);
      instance.hide();
    }
  }
}
