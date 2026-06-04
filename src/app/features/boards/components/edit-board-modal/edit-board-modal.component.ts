import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BoardService } from '../../../../core/services/board.service';
import { Column } from '../../../../core/models/column';

@Component({
  selector: 'app-edit-board-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-board-modal.component.html',
  styleUrl: './edit-board-modal.component.css',
})
export class EditBoardModalComponent {
  boardService = inject(BoardService);

  selectedBoard = this.boardService.selectedBoard;

  boardName = signal('');
  columns = signal<string[]>([]);
  currentBoardId: string | null = null;

  canSave = computed<boolean>(() => this.boardName().trim().length > 0);

  syncEffect = effect(() => {
    const board = this.selectedBoard();
    if (!board) {
      this.currentBoardId = null;
      return;
    }
    if (board.id !== this.currentBoardId) {
      this.currentBoardId = board.id;
      this.boardName.set(board.name);
      this.columns.set(
        board.columns.map((column: Column) => column.name)
      );
    }
  });

  addColumn() {
    this.columns.update((current: string[]) => [...current, '']);
  }

  removeColumn(index: number) {
    this.columns.update((current: string[]) =>
      current.filter((_value: string, i: number) => i !== index)
    );
  }

  updateColumn(index: number, value: string) {
    this.columns.update((current: string[]) =>
      current.map((currentValue: string, i: number) =>
        i === index ? value : currentValue
      )
    );
  }

  save() {
    const board = this.selectedBoard();
    if (!board || !this.canSave()) return;
    this.boardService.updateBoard(board.id, this.boardName(), this.columns());
    this.closeModal();
  }

  closeModal() {
    const modalEl: HTMLElement | null = document.getElementById('editBoardModal');
    if (!modalEl) return;
    const bootstrapWindow = window as unknown as { bootstrap?: { Modal: { getInstance: (el: HTMLElement) => { hide: () => void } | null; new (el: HTMLElement): { hide: () => void } } } };
    const Modal = bootstrapWindow.bootstrap?.Modal;
    if (Modal) {
      const instance = Modal.getInstance(modalEl) ?? new Modal(modalEl);
      instance.hide();
    }
  }
}
