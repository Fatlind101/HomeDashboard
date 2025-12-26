import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { SidebarComponent } from './shared/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, SidebarComponent],
  template: `
    <div class="app-container d-flex">
      <app-sidebar></app-sidebar>
      <div class="main-content flex-grow-1">
        <app-navbar></app-navbar>
        <main class="page-content p-4">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [
    `
      .app-container {
        min-height: 100vh;
        background-color: #f5f7fa;
      }

      .main-content {
        display: flex;
        flex-direction: column;
        width: 100%;
      }

      .page-content {
        flex-grow: 1;
        overflow-y: auto;
        max-height: calc(100vh - 80px);
      }

      @media (max-width: 768px) {
        .app-container {
          flex-direction: column;
        }
      }
    `,
  ],
})
export class AppComponent {
  title = 'Home Dashboard';
}
