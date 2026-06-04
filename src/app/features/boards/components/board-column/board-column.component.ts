import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskCardComponent } from '../../../tasks/components/task-card/task-card.component';
import { Column } from '../../../../core/models/column';

@Component({
  selector: 'app-board-column',
  standalone: true,
  imports: [CommonModule, TaskCardComponent],
  templateUrl: './board-column.component.html',
  styleUrl: './board-column.component.css',
})
export class BoardColumnComponent {
  @Input({ required: true }) column!: Column;
  @Input({ required: true }) boardId!: string;
}
