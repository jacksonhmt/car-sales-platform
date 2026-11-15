import { Component, ElementRef, OnDestroy, computed, effect, inject, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { NgTemplateOutlet } from '@angular/common';
import { filter, map } from 'rxjs';
import { CustomerService } from '../../../services/customer.service';
import { CustomerModalFooterService } from '../../../services/customer-modal-footer.service';
import { Customer } from '../../../models/customer';
import { formatPhone } from '../../../utils/formatters';

@Component({
  imports: [NgTemplateOutlet, RouterLink, RouterOutlet],
  selector: 'app-customer-list',
  styleUrl: './customer-list.css',
  templateUrl: './customer-list.html',
})
export class CustomerList implements OnDestroy {
  private readonly router = inject(Router);
  private readonly customerService = inject(CustomerService);
  readonly footerService = inject(CustomerModalFooterService);
  private alertTimer?: ReturnType<typeof setTimeout>;
  private readonly modal = viewChild<ElementRef<HTMLDialogElement>>('modal');

  readonly pageSize = 10;
  readonly page = signal(0);
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);
  readonly customers = signal<Customer[]>([]);
  readonly loading = signal(false);
  readonly successMessage = signal('');
  readonly errorMessage = signal('');

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );

  // Child routes (new, :id, :id/edit) are shown inside the modal above the table.
  readonly isModalRoute = computed(() => this.currentUrl().split('?')[0].startsWith('/customers/'));
  readonly modalTitle = computed(() => {
    const path = this.currentUrl().split('?')[0];
    if (path.endsWith('/new')) return 'New customer';
    if (path.endsWith('/edit')) return 'Edit customer';
    return 'Customer details';
  });
  readonly pageLabel = computed(() => `Page ${this.page() + 1} of ${Math.max(this.totalPages(), 1)}`);

  constructor() {
    // Reloads the table when the page changes or the modal closes and the list is shown again.
    effect(() => {
      const page = this.page();
      if (!this.isModalRoute()) {
        this.loadPage(page);
      }
    });

    effect(() => {
      const dialog = this.modal()?.nativeElement;
      if (!dialog) return;

      if (this.isModalRoute()) {
        if (!dialog.open) dialog.showModal();
      } else if (dialog.open) {
        dialog.close();
      }
    });
  }

  ngOnDestroy(): void {
    clearTimeout(this.alertTimer);
  }

  closeModal(): void {
    this.modal()?.nativeElement.close();
  }

  onModalClose(): void {
    if (this.isModalRoute()) {
      this.router.navigate(['/customers']);
    }
  }

  formatPhone(value: string): string {
    return formatPhone(value);
  }

  goToPage(page: number): void {
    this.page.set(page);
  }

  deleteCustomer(customer: Customer): void {
    if (customer.id === undefined || !confirm(`Delete ${customer.fullName}? This cannot be undone.`)) {
      return;
    }

    this.customerService.deleteCustomer(customer.id).subscribe({
      next: (response) => {
        this.showMessage(response.message || 'Customer deleted successfully.', true);
        this.loadPage(this.page());
      },
      error: (error) => {
        this.showMessage(error.error?.message || 'Could not delete the customer.', false);
      }
    });
  }

  private loadPage(page: number): void {
    this.loading.set(true);
    this.customerService.getCustomers(page, this.pageSize).subscribe({
      next: (response) => {
        this.loading.set(false);
        const data = response.data;
        if (!data) return;
        this.customers.set(data.content);
        this.totalPages.set(data.totalPages);
        this.totalElements.set(data.totalElements);
        if (data.content.length === 0 && page > 0) {
          this.page.set(page - 1);
        }
      },
      error: (error) => {
        this.loading.set(false);
        this.showMessage(error.error?.message || 'Could not load customers.', false);
      }
    });
  }

  private showMessage(message: string, success: boolean): void {
    this.successMessage.set(success ? message : '');
    this.errorMessage.set(success ? '' : message);
    clearTimeout(this.alertTimer);
    this.alertTimer = setTimeout(() => {
      this.successMessage.set('');
      this.errorMessage.set('');
    }, 5000);
  }
}
