import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BoardService } from '../../../../core/services/board.service';

@Component({
  selector: 'app-add-task-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-task-modal.component.html',
  styleUrl: './add-task-modal.component.css',
})
export class AddTaskModalComponent {
  boardService = inject(BoardService);

  selectedBoard = this.boardService.selectedBoard;

  title = signal('');
  description = signal('');
  status = signal('');
  subtasks = signal<string[]>(['']);

  availableStatuses = computed(() => {
    const board = this.selectedBoard();
    if (!board) return [];
    return board.columns.map((c: any) => c.name);
  });

  initEffect = effect(() => {
    const board = this.selectedBoard();
    if (board && !this.status()) {
      this.status.set(board.columns[0]?.name ?? '');
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

  canSave() {
    return !!this.title().trim() && !!this.status();
  }

  save() {
    const board = this.selectedBoard();
    if (!board || !this.canSave()) return;
    const status = this.status();
    const targetColumn = board.columns.find((c: any) => c.name === status) ?? board.columns[0];
    if (!targetColumn) return;

    const newTask: any = {
      id: this.generateId(),
      title: this.title().trim() || 'Untitled Task',
      description: this.description().trim(),
      status: status,
      subtasks: this.subtasks()
        .filter((t) => t.trim().length > 0)
        .map((t) => ({ title: t.trim(), isCompleted: false })),
    };

    this.boardService.addTask(board.id, targetColumn.id, newTask);
    this.reset();
    this.closeModal();
  }

  reset() {
    this.title.set('');
    this.description.set('');
    this.status.set(this.selectedBoard()?.columns[0]?.name ?? '');
    this.subtasks.set(['']);
  }

  closeModal() {
    const modalEl: any = document.getElementById('addTaskModal');
    if (!modalEl) return;
    const Modal = (window as any).bootstrap?.Modal;
    if (Modal) {
      const instance = Modal.getInstance(modalEl) ?? new Modal(modalEl);
      instance.hide();
    }
  }

  generateId() {
    return Math.random().toString(36).substring(2, 9);
  }
}
