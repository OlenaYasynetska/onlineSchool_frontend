import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admins-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admins-header.component.html',
})
export class AdminsHeaderComponent {
  @Input({ required: true }) search = '';

  @Output() readonly searchChange = new EventEmitter<Event>();
}
