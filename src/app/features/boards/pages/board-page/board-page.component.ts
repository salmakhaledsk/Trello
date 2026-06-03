import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardColumnComponent } from "../../components/board-column/board-column.component";
import { ViewTaskModalComponent } from "../../../tasks/components/view-task-modal/view-task-modal.component";
import { AddTaskModalComponent } from "../../../tasks/components/add-task-modal/add-task-modal.component";
import { EditBoardModalComponent } from "../../components/edit-board-modal/edit-board-modal.component";
import { DeleteBoardModalComponent } from "../../components/delete-board-modal/delete-board-modal.component";
import { BoardsService } from '../../services/boards.service';
import { EditTaskModalComponent } from "../../../tasks/components/edit-task-modal/edit-task-modal.component";
import { DeleteTaskModalComponent } from "../../../tasks/components/delete-task-modal/delete-task-modal.component";
import { AddBoardModalComponent } from "../../components/add-board-modal/add-board-modal.component";

// import { DeleteTaskModalComponent } from "../../../tasks/components/edit-task-modal/delete-task-modal.component";
@Component({
  selector: 'app-board-page',
  standalone: true,
  imports: [CommonModule, BoardColumnComponent, ViewTaskModalComponent, AddTaskModalComponent, EditBoardModalComponent, DeleteBoardModalComponent, EditTaskModalComponent, DeleteTaskModalComponent, AddBoardModalComponent],
  templateUrl: './board-page.component.html',
  styleUrls: ['./board-page.component.css']
})
export class BoardPageComponent {
   private boardService = inject(BoardsService);

  boards: any[] = [];

  ngOnInit(): void {

    this.boardService.getBoards().subscribe({
      next: (res) => {

        console.log(res);

        this.boards = res.boards;
      }
    });

  }

}