import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DataGridComponent } from './data-grid/data-grid.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, DataGridComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'my-app';
}
