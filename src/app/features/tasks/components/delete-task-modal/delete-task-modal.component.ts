import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardService } from '../../../../core/services/board.service';

@Component({
  selector: 'app-delete-task-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-task-modal.component.html',
  styleUrl: './delete-task-modal.component.css',
})
export class DeleteTaskModalComponent {
  boardService = inject(BoardService);

  selectedBoard = this.boardService.selectedBoard;
  selectedTask = this.boardService.selectedTask;

  confirmDelete() {
    const task = this.selectedTask();
    const board = this.selectedBoard();
    if (!task || !board) return;

    const column = board.columns.find((c: any) =>
      c.tasks.some((t: any) => t.id === task.id)
    );
    if (!column) return;

    this.boardService.deleteTask(board.id, column.id, task.id);
    this.closeModal();
  }

  closeModal() {
    const modalEl: any = document.getElementById('deleteTaskModal');
    if (!modalEl) return;
    const Modal = (window as any).bootstrap?.Modal;
    if (Modal) {
      const instance = Modal.getInstance(modalEl) ?? new Modal(modalEl);
      instance.hide();
    }
  }
}
