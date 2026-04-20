import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admins-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admins-footer.component.html',
})
export class AdminsFooterComponent {
  @Input({ required: true }) filteredCount = 0;
  @Input({ required: true }) total = 0;
  @Input({ required: true }) active = 0;
  @Input({ required: true }) inactive = 0;
}
