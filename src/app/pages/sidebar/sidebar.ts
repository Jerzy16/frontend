import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class Sidebar {
  @Input() active: 'dashboard' | 'productos' | 'categorias' = 'dashboard';
  @Output() selection = new EventEmitter<'dashboard' | 'productos' | 'categorias'>();

  changePage(page: 'dashboard' | 'productos' | 'categorias') {
    this.selection.emit(page);
  }
}
