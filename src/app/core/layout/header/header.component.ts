import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardService } from '../../services/board.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  boardService = inject(BoardService);

  toggleSidebar = output<void>();

  selectedBoard = this.boardService.selectedBoard;
}
