import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BoardService } from '../../../../core/services/board.service';

@Component({
  selector: 'app-add-board-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-board-modal.component.html',
  styleUrl: './add-board-modal.component.css',
})
export class AddBoardModalComponent {
  boardService = inject(BoardService);

  boardName = signal('');
  columns = signal<string[]>(['', '']);

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
    if (!this.boardName().trim()) return;
    this.boardService.addBoard(this.boardName(), this.columns());
    this.reset();
    this.closeModal();
  }

  reset() {
    this.boardName.set('');
    this.columns.set(['', '']);
  }

  closeModal() {
    const modalEl: any = document.getElementById('addBoardModal');
    if (!modalEl) return;
    const Modal = (window as any).bootstrap?.Modal;
    if (Modal) {
      const instance = Modal.getInstance(modalEl) ?? new Modal(modalEl);
      instance.hide();
    }
  }
}
