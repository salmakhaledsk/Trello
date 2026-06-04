import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BoardService } from '../../../../core/services/board.service';
import { Column } from '../../../../core/models/column';
import { Subtask, Task } from '../../../../core/models/task';

@Component({
  selector: 'app-edit-task-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-task-modal.component.html',
  styleUrl: './edit-task-modal.component.css',
})
export class EditTaskModalComponent {
  boardService = inject(BoardService);

  selectedBoard = this.boardService.selectedBoard;
  selectedTask = this.boardService.selectedTask;

  title = signal('');
  description = signal('');
  status = signal('');
  subtasks = signal<string[]>([]);
  currentColumnId: string | null = null;
  currentTaskId: string | null = null;

  availableStatuses = computed<string[]>(() => {
    const board = this.selectedBoard();
    if (!board) return [];
    return board.columns.map((column: Column) => column.name);
  });

  canSave = computed<boolean>(
    () => !!this.title().trim() && !!this.status()
  );

  syncEffect = effect(() => {
    const task = this.selectedTask();
    const board = this.selectedBoard();
    if (!task || !board) {
      this.currentTaskId = null;
      this.currentColumnId = null;
      return;
    }

    if (task.id !== this.currentTaskId) {
      this.currentTaskId = task.id;
      const column = board.columns.find((column: Column) =>
        column.tasks.some((taskItem: Task) => taskItem.id === task.id)
      );
      this.currentColumnId = column?.id ?? null;
      this.title.set(task.title);
      this.description.set(task.description ?? '');
      this.status.set(task.status ?? column?.name ?? '');
      this.subtasks.set(
        (task.subtasks ?? []).map((subtask: Subtask) => subtask.title)
      );
    }
  });

  addSubtask() {
    this.subtasks.update((current: string[]) => [...current, '']);
  }

  removeSubtask(index: number) {
    this.subtasks.update((current: string[]) =>
      current.filter((_value: string, i: number) => i !== index)
    );
  }

  updateSubtask(index: number, value: string) {
    this.subtasks.update((current: string[]) =>
      current.map((currentValue: string, i: number) =>
        i === index ? value : currentValue
      )
    );
  }

  save() {
    const board = this.selectedBoard();
    const task = this.selectedTask();
    if (!board || !task || !this.canSave() || !this.currentColumnId) return;

    const originalSubtasks = task.subtasks ?? [];
    const newSubtasks: Subtask[] = this.subtasks()
      .filter((currentTitle: string) => currentTitle.trim().length > 0)
      .map((currentTitle: string, index: number): Subtask => ({
        title: currentTitle.trim(),
        isCompleted: originalSubtasks[index]?.isCompleted ?? false,
      }));

    const updatedTask: Task = {
      ...task,
      title: this.title().trim() || task.title,
      description: this.description().trim(),
      status: this.status(),
      subtasks: newSubtasks,
    };

    this.boardService.updateTask(board.id, this.currentColumnId, updatedTask);
    this.closeModal();
  }

  closeModal() {
    const modalEl: HTMLElement | null = document.getElementById('editTaskModal');
    if (!modalEl) return;
    const bootstrapWindow = window as unknown as { bootstrap?: { Modal: { getInstance: (el: HTMLElement) => { hide: () => void } | null; new (el: HTMLElement): { hide: () => void } } } };
    const Modal = bootstrapWindow.bootstrap?.Modal;
    if (Modal) {
      const instance = Modal.getInstance(modalEl) ?? new Modal(modalEl);
      instance.hide();
    }
  }
}
