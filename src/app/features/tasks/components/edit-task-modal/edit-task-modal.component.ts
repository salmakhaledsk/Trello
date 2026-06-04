import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BoardService } from '../../../../core/services/board.service';

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

  availableStatuses = computed(() => {
    const board = this.selectedBoard();
    if (!board) return [];
    return board.columns.map((c: any) => c.name);
  });

  canSave = computed(() => !!this.title().trim() && !!this.status());

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
      const column = board.columns.find((c: any) =>
        c.tasks.some((t: any) => t.id === task.id)
      );
      this.currentColumnId = column?.id ?? null;
      this.title.set(task.title);
      this.description.set(task.description ?? '');
      this.status.set(task.status ?? column?.name ?? '');
      this.subtasks.set((task.subtasks ?? []).map((s: any) => s.title));
    }
  });

  addSubtask() {
    this.subtasks.update((s) => [...s, '']);
  }

  removeSubtask(index: number) {
    this.subtasks.update((s) => s.filter((_, i) => i !== index));
  }

  updateSubtask(index: number, value: string) {
    this.subtasks.update((s) => s.map((v, i) => (i === index ? value : v)));
  }

  save() {
    const board = this.selectedBoard();
    const task = this.selectedTask();
    if (!board || !task || !this.canSave() || !this.currentColumnId) return;

    const originalSubtasks = task.subtasks ?? [];
    const newSubtasks = this.subtasks()
      .filter((t) => t.trim().length > 0)
      .map((t, idx) => ({
        title: t.trim(),
        isCompleted: originalSubtasks[idx]?.isCompleted ?? false,
      }));

    const updatedTask: any = {
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
    const modalEl: any = document.getElementById('editTaskModal');
    if (!modalEl) return;
    const Modal = (window as any).bootstrap?.Modal;
    if (Modal) {
      const instance = Modal.getInstance(modalEl) ?? new Modal(modalEl);
      instance.hide();
    }
  }
}
