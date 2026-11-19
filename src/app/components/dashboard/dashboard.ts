import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CustomerService } from '../../services/customer.service';
import { I18nService } from '../../services/i18n.service';

@Component({
  imports: [RouterLink],
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  private readonly customerService = inject(CustomerService);
  protected readonly i18n = inject(I18nService);

  readonly totalCustomers = signal<number | null>(null);
  readonly loadError = signal(false);

  ngOnInit(): void {
    this.customerService.getCustomers(0, 1).subscribe({
      next: (response) => this.totalCustomers.set(response.data?.totalElements ?? 0),
      error: () => this.loadError.set(true),
    });
  }
}
