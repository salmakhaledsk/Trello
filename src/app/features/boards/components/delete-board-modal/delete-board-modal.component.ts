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
    const modalEl: any = document.getElementById('deleteBoardModal');
    if (!modalEl) return;
    const Modal = (window as any).bootstrap?.Modal;
    if (Modal) {
      const instance = Modal.getInstance(modalEl) ?? new Modal(modalEl);
      instance.hide();
    }
  }
}
