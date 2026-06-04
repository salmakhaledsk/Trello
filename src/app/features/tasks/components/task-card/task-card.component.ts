import { Component, inject, Input } from '@angular/core';
import { BoardService } from '../../../../core/services/board.service';
import { Task } from '../../../../core/models/task';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.css',
})
export class TaskCardComponent {
  boardService = inject(BoardService);

  @Input({ required: true }) task!: Task;
  @Input({ required: true }) boardId!: string;
  @Input({ required: true }) columnId!: string;

  openTask() {
    this.boardService.selectTask(this.task.id);
  }

  onDragStart(event: DragEvent) {
    event.dataTransfer?.setData('taskId', this.task.id);
    event.dataTransfer?.setData('fromColumnId', this.columnId);
    (event.currentTarget as HTMLElement).classList.add('dragging');
  }

  onDragEnd(event: DragEvent) {
    (event.currentTarget as HTMLElement).classList.remove('dragging');
  }

  getCompletedCount(): number {
    return (this.task.subtasks ?? []).filter((subtask) => {
      return subtask.isCompleted;
    }).length;
  }
}
