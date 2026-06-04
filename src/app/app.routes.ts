import { Routes } from '@angular/router';
import { ShellComponent } from './core/layout/shell/shell.component';
import { BoardPageComponent } from './features/boards/pages/board-page/board-page.component';
import { MarketingPlanPageComponent } from './features/boards/pages/marketing-plan-page/marketing-plan-page.component';
import { RoadmapPageComponent } from './features/boards/pages/roadmap-page/roadmap-page.component';

export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      {
        path: '',
        component: BoardPageComponent,
      },
      {
        path: 'marketing-plan',
        component: MarketingPlanPageComponent,
      },
      {
        path: 'roadmap',
        component: RoadmapPageComponent,
      },
    ],
  },
];
