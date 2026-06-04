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
    const modalEl: HTMLElement | null = document.getElementById('addBoardModal');
    if (!modalEl) return;
    const bootstrapWindow = window as unknown as { bootstrap?: { Modal: { getInstance: (el: HTMLElement) => { hide: () => void } | null; new (el: HTMLElement): { hide: () => void } } } };
    const Modal = bootstrapWindow.bootstrap?.Modal;
    if (Modal) {
      const instance = Modal.getInstance(modalEl) ?? new Modal(modalEl);
      instance.hide();
    }
  }
}
