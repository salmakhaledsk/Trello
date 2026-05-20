import { Component, Input } from '@angular/core';
import { TaskCardComponent } from "../../../tasks/components/task-card/task-card.component";

@Component({
  selector: 'app-board-column',
  imports: [TaskCardComponent],
  templateUrl: './board-column.component.html',
  styleUrl: './board-column.component.css'
})
export class BoardColumnComponent {
  @Input() title: string = '';

  @Input() color: string = '';
}
