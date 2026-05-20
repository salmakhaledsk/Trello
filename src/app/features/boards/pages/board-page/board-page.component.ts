import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardColumnComponent } from "../../components/board-column/board-column.component";
import { ViewTaskModalComponent } from "../../../tasks/components/view-task-modal/view-task-modal.component";
import { AddTaskModalComponent } from "../../../tasks/components/add-task-modal/add-task-modal.component";
import { EditBoardModalComponent } from "../../components/edit-board-modal/edit-board-modal.component";
import { DeleteBoardModalComponent } from "../../components/delete-board-modal/delete-board-modal.component";


@Component({
  selector: 'app-board-page',
  standalone: true,
  imports: [CommonModule, BoardColumnComponent, ViewTaskModalComponent, AddTaskModalComponent, EditBoardModalComponent, DeleteBoardModalComponent],
  templateUrl: './board-page.component.html',
  styleUrls: ['./board-page.component.css']
})
export class BoardPageComponent {

}