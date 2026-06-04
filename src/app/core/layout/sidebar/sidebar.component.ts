import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { BoardService } from '../../services/board.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  boardService = inject(BoardService);
  themeService = inject(ThemeService);

  toggleSidebar = output<void>();

  boards = this.boardService.boards;
  isDark = this.themeService.isDark;

  selectBoard(id: string) {
    this.boardService.selectBoard(id);
  }

  toggleTheme() {
    this.themeService.toggle();
  }
}
