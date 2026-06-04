import { Component, inject, Input } from '@angular/core';
import { BoardService } from '../../../../core/services/board.service';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.css',
})
export class TaskCardComponent {
  boardService = inject(BoardService);

  @Input({ required: true }) task!: any;
  @Input({ required: true }) boardId!: string;
  @Input({ required: true }) columnId!: string;

  openTask() {
    this.boardService.selectTask(this.task.id);
  }

  getCompletedCount() {
    return (this.task.subtasks ?? []).filter((s: any) => s.isCompleted).length;
  }
}
