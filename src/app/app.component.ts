import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoadingService } from './app-shell/framework-services/ui/loading.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
})
export class AppComponent {


  constructor(
    private readonly router: Router,
    public loadingService: LoadingService
  ) { }

  ngOnInit(): void {

    if (!sessionStorage.getItem('ActiveSession')) {
      this.router.navigate(['/auth/login']);
    }

    setTimeout(() => this.loadingService.hide(), 1500);
  }
}
