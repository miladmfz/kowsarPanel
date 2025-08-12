import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  constructor(
    private readonly router: Router,

  ) { }

  ngOnInit(): void {
    //document.body.classList.remove('loading');

    if (sessionStorage.getItem("ActiveDate") == null) {
      this.router.navigate(['/auth/login']);
    }


  }
}
