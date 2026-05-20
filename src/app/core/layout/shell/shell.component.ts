import { Component, signal } from '@angular/core';

import { HeaderComponent } from "../header/header.component";
import { SidebarComponent } from "../sidebar/sidebar.component";
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, HeaderComponent, SidebarComponent],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.css'
})
export class ShellComponent {
  sidebarVisible = signal(true);

  toggleSidebar() {
    this.sidebarVisible.update(viewSidebar => !viewSidebar);
  }
}
