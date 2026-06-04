import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardService } from '../../../../core/services/board.service';

@Component({
  selector: 'app-delete-board-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-board-modal.component.html',
  styleUrl: './delete-board-modal.component.css',
})
export class DeleteBoardModalComponent {
  boardService = inject(BoardService);

  selectedBoard = this.boardService.selectedBoard;

  confirmDelete(): void {
    const board = this.selectedBoard();
    if (!board) return;
    this.boardService.deleteBoard(board.id);
    this.closeModal();
  }

  closeModal(): void {
    const modalEl: HTMLElement | null = document.getElementById('deleteBoardModal');
    if (!modalEl) return;
    const bootstrapWindow = window as unknown as { bootstrap?: { Modal: { getInstance: (el: HTMLElement) => { hide: () => void } | null; new (el: HTMLElement): { hide: () => void } } } };
    const Modal = bootstrapWindow.bootstrap?.Modal;
    if (Modal) {
      const instance = Modal.getInstance(modalEl) ?? new Modal(modalEl);
      instance.hide();
    }
  }
}
