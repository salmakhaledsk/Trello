import { Routes } from '@angular/router';
import { ShellComponent } from './core/layout/shell/shell.component';
import { BoardPageComponent } from './features/boards/pages/board-page/board-page.component';


export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      {
        path: '',
        component: BoardPageComponent
      }
    ]
  }
];