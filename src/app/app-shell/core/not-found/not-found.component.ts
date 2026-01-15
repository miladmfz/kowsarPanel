import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './not-found.component.html',
})
export class NotFoundComponent {
  private readonly router = inject(Router);

  constructor() { }

  goHome(): void {
    this.router.navigate(['/dashboard']);
  }
}
