import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BoardService } from '../../../../core/services/board.service';

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

  canSave = computed(() => this.boardName().trim().length > 0);

  syncEffect = effect(() => {
    const board = this.selectedBoard();
    if (!board) {
      this.currentBoardId = null;
      return;
    }
    if (board.id !== this.currentBoardId) {
      this.currentBoardId = board.id;
      this.boardName.set(board.name);
      this.columns.set(board.columns.map((c: any) => c.name));
    }
  });

  addColumn() {
    this.columns.update((cols) => [...cols, '']);
  }

  removeColumn(index: number) {
    this.columns.update((cols) => cols.filter((_, i) => i !== index));
  }

  updateColumn(index: number, value: string) {
    this.columns.update((cols) => cols.map((c, i) => (i === index ? value : c)));
  }

  save() {
    const board = this.selectedBoard();
    if (!board || !this.canSave()) return;
    this.boardService.updateBoard(board.id, this.boardName(), this.columns());
    this.closeModal();
  }

  closeModal() {
    const modalEl: any = document.getElementById('editBoardModal');
    if (!modalEl) return;
    const Modal = (window as any).bootstrap?.Modal;
    if (Modal) {
      const instance = Modal.getInstance(modalEl) ?? new Modal(modalEl);
      instance.hide();
    }
  }
}
