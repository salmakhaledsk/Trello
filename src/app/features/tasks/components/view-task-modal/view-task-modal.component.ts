import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BoardService } from '../../../../core/services/board.service';

@Component({
  selector: 'app-view-task-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './view-task-modal.component.html',
  styleUrl: './view-task-modal.component.css',
})
export class ViewTaskModalComponent {
  boardService = inject(BoardService);

  selectedBoard = this.boardService.selectedBoard;
  selectedTask = this.boardService.selectedTask;

  availableStatuses = computed(() => {
    const board = this.selectedBoard();
    if (!board) return [];
    return board.columns.map((c: any) => c.name);
  });

  toggleSubtask(index: number) {
    const task = this.selectedTask();
    const board = this.selectedBoard();
    if (!task || !board) return;
    const column = board.columns.find((c: any) =>
      c.tasks.some((t: any) => t.id === task.id)
    );
    if (!column) return;
    this.boardService.toggleSubtask(board.id, column.id, task.id, index);
  }

  onStatusChange(newStatus: string) {
    const task = this.selectedTask();
    const board = this.selectedBoard();
    if (!task || !board) return;

    const updatedTask: any = { ...task, status: newStatus };
    const column = board.columns.find((c: any) =>
      c.tasks.some((t: any) => t.id === task.id)
    );
    if (!column) return;
    this.boardService.updateTask(board.id, column.id, updatedTask);
  }

  countCompleted(task: any) {
    return (task.subtasks ?? []).filter((s: any) => s.isCompleted).length;
  }

  editTask() {
    const modalEl: any = document.getElementById('viewTaskModal');
    if (!modalEl) return;
    const Modal = (window as any).bootstrap?.Modal;
    if (Modal) {
      const instance = Modal.getInstance(modalEl) ?? new Modal(modalEl);
      instance.hide();
    }
  }
}
