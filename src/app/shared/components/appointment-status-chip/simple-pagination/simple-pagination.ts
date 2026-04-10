import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PaginationMeta } from '../../../../core/models/paginated-response.model';

@Component({
  selector: 'app-simple-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './simple-pagination.html',
  styleUrl: './simple-pagination.scss',
})
export class SimplePaginationComponent {
  @Input({ required: true }) meta!: PaginationMeta | null;
  @Output() pageChange = new EventEmitter<number>();

  goToPrevious(): void {
    if (this.meta?.hasPreviousPage) {
      this.pageChange.emit(this.meta.page - 1);
    }
  }

  goToNext(): void {
    if (this.meta?.hasNextPage) {
      this.pageChange.emit(this.meta.page + 1);
    }
  }
}
