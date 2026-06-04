import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BoardService } from '../../../../core/services/board.service';
import { Column } from '../../../../core/models/column';
import { Task } from '../../../../core/models/task';

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

  availableStatuses = computed<string[]>(() => {
    const board = this.selectedBoard();
    if (!board) return [];
    return board.columns.map(function (column: Column) {
      return column.name;
    });
  });

  initEffect = effect(() => {
    const board = this.selectedBoard();
    if (board && !this.status()) {
      this.status.set(board.columns[0]?.name ?? '');
    }
  });

  addSubtask() {
    this.subtasks.update(function (currentSubtasks) {
      return [...currentSubtasks, ''];
    });
  }

  removeSubtask(index: number) {
    this.subtasks.update(function (currentSubtasks) {
      return currentSubtasks.filter(function (_: string, i: number) {
        return i !== index;
      });
    });
  }

  updateSubtask(index: number, value: string) {
    this.subtasks.update(function (currentSubtasks) {
      return currentSubtasks.map(function (currentValue: string, i: number) {
        if (i === index) return value;
        return currentValue;
      });
    });
  }

  canSave(): boolean {
    return !!this.title().trim() && !!this.status();
  }

  save() {
    const board = this.selectedBoard();
    if (!board || !this.canSave()) return;
    const status = this.status();
    const targetColumn: Column | undefined =
      board.columns.find(function (column: Column) {
        return column.name === status;
      }) ?? board.columns[0];
    if (!targetColumn) return;

    const newTask: Task = {
      id: this.generateId(),
      title: this.title().trim() || 'Untitled Task',
      description: this.description().trim(),
      status: status,
      subtasks: this.subtasks()
        .filter(function (currentSubtask: string) {
          return currentSubtask.trim().length > 0;
        })
        .map(function (currentSubtask: string) {
          return { title: currentSubtask.trim(), isCompleted: false };
        }),
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
    const modalEl: HTMLElement | null = document.getElementById('addTaskModal');
    if (!modalEl) return;
    const Modal = (window as any).bootstrap?.Modal;
    if (Modal) {
      const instance = Modal.getInstance(modalEl) ?? new Modal(modalEl);
      instance.hide();
    }
  }

  generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }
}
