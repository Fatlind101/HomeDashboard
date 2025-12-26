import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar bg-dark text-white">
      <div class="sidebar-header">
        <i class="fas fa-home me-2"></i>
        <span>SmartHome</span>
      </div>

      <nav class="sidebar-nav">
        <a
          *ngFor="let item of menuItems"
          [routerLink]="item.route"
          routerLinkActive="active"
          class="nav-item"
        >
          <i [class]="'fas ' + item.icon"></i>
          <span class="nav-label">{{ item.label }}</span>
        </a>
      </nav>

      <div class="sidebar-footer">
        <div class="status-info">
          <p class="small mb-2">
            <i class="fas fa-circle text-success me-1"></i> System Online
          </p>
          <small class="text-muted">Last sync: just now</small>
        </div>
      </div>
    </aside>
  `,
  styles: [
    `
      .sidebar {
        width: 250px;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        position: sticky;
        top: 0;
        background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
        box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
      }

      .sidebar-header {
        padding: 2rem 1.5rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        font-size: 1.3rem;
        font-weight: bold;
        display: flex;
        align-items: center;
      }

      .sidebar-nav {
        padding: 1rem 0;
        flex-grow: 1;
      }

      .nav-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem 1.5rem;
        color: rgba(255, 255, 255, 0.7);
        text-decoration: none;
        transition: all 0.3s ease;
        border-left: 4px solid transparent;
        cursor: pointer;
      }

      .nav-item:hover {
        background-color: rgba(255, 255, 255, 0.1);
        color: #fff;
        border-left-color: #3498db;
      }

      .nav-item.active {
        background-color: #3498db;
        color: #fff;
        border-left-color: #fff;
      }

      .nav-item i {
        width: 20px;
        text-align: center;
      }

      .sidebar-footer {
        padding: 1.5rem;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }

      .status-info {
        text-align: center;
        color: rgba(255, 255, 255, 0.7);
      }

      @media (max-width: 768px) {
        .sidebar {
          position: fixed;
          left: -250px;
          height: 100%;
          z-index: 1000;
          transition: left 0.3s ease;
        }

        .sidebar.show {
          left: 0;
        }

        .nav-label {
          display: none;
        }

        .sidebar-header {
          flex-direction: column;
          text-align: center;
        }
      }
    `,
  ],
})
export class SidebarComponent implements OnInit {
  menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'fa-chart-line', route: '/dashboard' },
    { label: 'Devices', icon: 'fa-lightbulb', route: '/devices' },
    { label: 'Sensors', icon: 'fa-thermometer-half', route: '/sensors' },
    { label: 'Rooms', icon: 'fa-door-open', route: '/rooms' },
    { label: 'Energy', icon: 'fa-bolt', route: '/energy' },
    { label: 'Settings', icon: 'fa-cog', route: '/settings' },
  ];

  ngOnInit(): void {}
}
