import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardColumnComponent } from '../../components/board-column/board-column.component';
import { ViewTaskModalComponent } from '../../../tasks/components/view-task-modal/view-task-modal.component';
import { AddTaskModalComponent } from '../../../tasks/components/add-task-modal/add-task-modal.component';
import { EditBoardModalComponent } from '../../components/edit-board-modal/edit-board-modal.component';
import { DeleteBoardModalComponent } from '../../components/delete-board-modal/delete-board-modal.component';
import { BoardService } from '../../../../core/services/board.service';
import { EditTaskModalComponent } from '../../../tasks/components/edit-task-modal/edit-task-modal.component';
import { DeleteTaskModalComponent } from '../../../tasks/components/delete-task-modal/delete-task-modal.component';
import { AddBoardModalComponent } from '../../components/add-board-modal/add-board-modal.component';

@Component({
  selector: 'app-marketing-plan-page',
  standalone: true,
  imports: [
    CommonModule,
    BoardColumnComponent,
    ViewTaskModalComponent,
    AddTaskModalComponent,
    EditBoardModalComponent,
    DeleteBoardModalComponent,
    EditTaskModalComponent,
    DeleteTaskModalComponent,
    AddBoardModalComponent,
  ],
  templateUrl: './marketing-plan-page.component.html',
  styleUrls: ['./marketing-plan-page.component.css'],
})
export class MarketingPlanPageComponent implements OnInit {
  boardService = inject(BoardService);

  selectedBoard = this.boardService.selectedBoard;

  ngOnInit(): void {
    this.boardService.loadBoards().then(() => {
      const board = this.boardService.boards().find((b: any) => b.name === 'Marketing Plan');
      if (board) {
        this.boardService.selectBoard(board.id);
      }
    });
  }
}
