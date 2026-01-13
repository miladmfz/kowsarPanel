import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-kowsar',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './auth-kowsar.component.html',
})
export class AuthKowsarComponent {
  currentYear = new Date().getFullYear();
}
