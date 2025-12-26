import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeviceService } from '../../services/device.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
      <div class="container-fluid">
        <div class="navbar-brand fw-bold" style="color: #34495e;">
          Control Hub
        </div>

        <div class="ms-auto d-flex align-items-center gap-3">
          <!-- Power consumption -->
          <div class="d-flex align-items-center gap-2">
            <i class="fas fa-plug text-danger"></i>
            <span class="badge bg-light text-dark">
              {{ totalPowerConsumption | number: '1.0-0' }}W
            </span>
          </div>

          <!-- Active devices -->
          <div class="d-flex align-items-center gap-2">
            <i class="fas fa-power-off text-success"></i>
            <span class="badge bg-light text-dark">
              {{ activeDevices }} Active
            </span>
          </div>

          <!-- User menu -->
          <div class="dropdown">
            <button
              class="btn btn-sm btn-light dropdown-toggle"
              type="button"
              id="userMenu"
              data-bs-toggle="dropdown"
            >
              <i class="fas fa-user-circle"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end">
              <li><a class="dropdown-item" href="#"><i class="fas fa-user"></i> Profile</a></li>
              <li><a class="dropdown-item" href="#"><i class="fas fa-cog"></i> Settings</a></li>
              <li><hr class="dropdown-divider"></li>
              <li><a class="dropdown-item" href="#"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [
    `
      .navbar {
        height: 80px;
        display: flex;
        align-items: center;
      }

      .navbar-brand {
        font-size: 1.5rem;
        color: #2c3e50;
      }

      .dropdown-menu {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        border-radius: 8px;
        border: none;
      }

      .dropdown-item {
        transition: all 0.3s ease;
      }

      .dropdown-item:hover {
        background-color: #f5f7fa;
        color: #3498db;
      }
    `,
  ],
})
export class NavbarComponent implements OnInit {
  totalPowerConsumption = 0;
  activeDevices = 0;

  constructor(private deviceService: DeviceService) {}

  ngOnInit(): void {
    this.deviceService.getTotalPowerConsumption().subscribe((consumption) => {
      this.totalPowerConsumption = consumption;
    });

    this.deviceService.getActiveDevicesCount().subscribe((count) => {
      this.activeDevices = count;
    });
  }
}
