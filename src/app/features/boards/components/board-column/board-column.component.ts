import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskCardComponent } from '../../../tasks/components/task-card/task-card.component';
import { Column } from '../../../../core/models/column';
import { BoardService } from '../../../../core/services/board.service';

@Component({
  selector: 'app-board-column',
  standalone: true,
  imports: [CommonModule, TaskCardComponent],
  templateUrl: './board-column.component.html',
  styleUrl: './board-column.component.css',
})
export class BoardColumnComponent {
  boardService = inject(BoardService);

  @Input({ required: true }) column!: Column;
  @Input({ required: true }) boardId!: string;

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDragEnter(event: DragEvent) {
    event.preventDefault();
    (event.currentTarget as HTMLElement).classList.add('drop-target');
  }

  onDragLeave(event: DragEvent) {
    (event.currentTarget as HTMLElement).classList.remove('drop-target');
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    (event.currentTarget as HTMLElement).classList.remove('drop-target');

    const taskId = event.dataTransfer?.getData('taskId');
    const fromColumnId = event.dataTransfer?.getData('fromColumnId');
    if (!taskId || !fromColumnId) return;

    const newIndex = this.getDropIndex(event);
    this.boardService.moveTask(
      this.boardId,
      taskId,
      fromColumnId,
      this.column.id,
      newIndex
    );
  }

  getDropIndex(event: DragEvent): number {
    const dropZone = event.currentTarget as HTMLElement;
    const cardElements = Array.from(
      dropZone.querySelectorAll('.task-card')
    ) as HTMLElement[];

    if (cardElements.length === 0) return 0;

    const mouseY = event.clientY;
    for (let i = 0; i < cardElements.length; i++) {
      const rect = cardElements[i].getBoundingClientRect();
      const middle = rect.top + rect.height / 2;
      if (mouseY < middle) {
        return i;
      }
    }
    return cardElements.length;
  }
}
