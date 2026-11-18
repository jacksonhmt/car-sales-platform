import { Component, DestroyRef, ElementRef, HostListener, OnDestroy, afterEveryRender, computed, effect, inject, signal, untracked, viewChild } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { NgTemplateOutlet } from '@angular/common';
import { EMPTY, Observable, Subscription, expand, filter, map, reduce } from 'rxjs';
import { CustomerService } from '../../../services/customer.service';
import { CustomerModalFooterService } from '../../../services/customer-modal-footer.service';
import { Customer } from '../../../models/customer';
import { PaginatedResponse } from '../../../models/api-response';
import { formatCpf, formatPhone } from '../../../utils/formatters';

interface CustomerFilters {
  name: string;
  cpf: string;
}

@Component({
  imports: [NgTemplateOutlet, RouterLink, RouterOutlet],
  selector: 'app-customer-list',
  styleUrl: './customer-list.css',
  templateUrl: './customer-list.html',
})
export class CustomerList implements OnDestroy {
  private readonly router = inject(Router);
  private readonly customerService = inject(CustomerService);
  private readonly destroyRef = inject(DestroyRef);
  readonly footerService = inject(CustomerModalFooterService);
  private alertTimer?: ReturnType<typeof setTimeout>;
  private readonly modal = viewChild<ElementRef<HTMLDialogElement>>('modal');
  private readonly deleteModal = viewChild<ElementRef<HTMLDialogElement>>('deleteModal');
  private readonly tableBody = viewChild<ElementRef<HTMLTableSectionElement>>('tableBody');
  private readonly pagination = viewChild<ElementRef<HTMLElement>>('pagination');
  private readonly nameCollator = new Intl.Collator('pt-BR', { sensitivity: 'base', numeric: true });
  private loadSubscription?: Subscription;
  private resizeObserver?: ResizeObserver;
  private allCustomers: Customer[] | null = null;

  readonly pageSize = signal(10);
  readonly page = signal(0);
  readonly nameSort = signal<'asc' | 'desc' | null>(null);
  readonly filters = signal<CustomerFilters>({ name: '', cpf: '' });
  readonly hasFilters = computed(() => !!(this.filters().name || this.filters().cpf));
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);
  readonly customers = signal<Customer[]>([]);
  readonly loading = signal(false);
  readonly loadError = signal(false);
  readonly nameFilterError = signal('');
  readonly successMessage = signal('');
  readonly errorMessage = signal('');
  readonly customerToDelete = signal<Customer | null>(null);
  readonly deleting = signal(false);
  readonly deleteError = signal('');

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
    effect(() => {
      const page = this.page();
      const sort = this.nameSort();
      const pageSize = this.pageSize();
      const filters = this.filters();
      if (this.isModalRoute()) {
        this.loadSubscription?.unsubscribe();
        this.loading.set(false);
        this.allCustomers = null;
      } else {
        untracked(() => this.loadPage(page, sort, pageSize, filters));
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

    afterEveryRender({
      read: () => {
        const body = this.tableBody()?.nativeElement;
        const pagination = this.pagination()?.nativeElement;
        if (!this.resizeObserver && body && pagination && typeof ResizeObserver !== 'undefined') {
          this.resizeObserver = new ResizeObserver(() => this.updatePageSize());
          this.resizeObserver.observe(body);
          this.resizeObserver.observe(pagination);
        }
        this.updatePageSize();
      }
    });
  }

  ngOnDestroy(): void {
    this.loadSubscription?.unsubscribe();
    this.resizeObserver?.disconnect();
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

  formatCpf(value: string): string {
    return formatCpf(value);
  }

  maskCpf(value: string | null | undefined): string {
    const match = value?.match(/^(\d{3})(?:\d{6}|\.\d{3}\.\d{3}-)(\d{2})$/);
    return match ? `${match[1]}.***.***-${match[2]}` : 'Unavailable';
  }

  goToPage(page: number): void {
    this.page.set(page);
  }

  @HostListener('window:resize')
  updatePageSize(): void {
    const body = this.tableBody()?.nativeElement;
    const pagination = this.pagination()?.nativeElement;
    const row = body?.querySelector<HTMLTableRowElement>('.customer-row');
    if (!body || !pagination || !row) return;

    const rowHeight = row.getBoundingClientRect().height;
    if (!rowHeight) return;

    const bodyRect = body.getBoundingClientRect();
    const paginationRect = pagination.getBoundingClientRect();
    const availableHeight = window.innerHeight - (bodyRect.top + window.scrollY)
      - (paginationRect.bottom - bodyRect.bottom) - 16;
    const size = Math.max(1, Math.min(100, Math.floor(availableHeight / rowHeight)));
    const previousSize = this.pageSize();
    if (size !== previousSize) {
      this.page.set(Math.floor(this.page() * previousSize / size));
      this.pageSize.set(size);
    }
  }

  toggleNameSort(): void {
    this.page.set(0);
    this.nameSort.update((sort) => sort === 'asc' ? 'desc' : 'asc');
  }

  searchCustomers(name: string, cpf: string): void {
    const trimmedName = name.trim();
    if (trimmedName.length < 3 || name.length > 150) {
      this.nameFilterError.set('Enter a name between 3 and 150 characters.');
      return;
    }
    this.nameFilterError.set('');
    this.allCustomers = null;
    this.page.set(0);
    this.filters.set({
      name: this.normalizeName(trimmedName),
      cpf: cpf.replace(/\D/g, '')
    });
  }

  clearFilters(): void {
    this.nameFilterError.set('');
    this.allCustomers = null;
    this.page.set(0);
    this.filters.set({ name: '', cpf: '' });
  }

  openDeleteModal(customer: Customer): void {
    if (customer.id === undefined) {
      this.showMessage('Cannot delete a customer without an ID.', false);
      return;
    }
    this.customerToDelete.set(customer);
    this.deleteError.set('');
    this.deleteModal()?.nativeElement.showModal();
  }

  closeDeleteModal(): void {
    if (!this.deleting()) this.deleteModal()?.nativeElement.close();
  }

  onDeleteCancel(event: Event): void {
    if (this.deleting()) event.preventDefault();
  }

  onDeleteClose(): void {
    this.customerToDelete.set(null);
    this.deleteError.set('');
  }

  confirmDelete(): void {
    const customer = this.customerToDelete();
    if (this.deleting()) return;
    if (!customer || customer.id === undefined) {
      this.deleteError.set('Select a customer to delete.');
      return;
    }

    this.deleting.set(true);
    this.deleteError.set('');
    this.customerService.deleteCustomer(customer.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.deleting.set(false);
        if (!response.success) {
          this.deleteError.set(response.message || 'Could not delete the customer.');
          return;
        }
        this.closeDeleteModal();
        this.showMessage(response.message || 'Customer deleted successfully.', true);
        this.allCustomers = null;
        this.loadPage(this.page(), this.nameSort(), this.pageSize(), this.filters());
      },
      error: (error) => {
        this.deleting.set(false);
        this.deleteError.set(error.error?.message || 'Could not delete the customer.');
      }
    });
  }

  private loadPage(page: number, sort: 'asc' | 'desc' | null, pageSize: number, filters: CustomerFilters): void {
    this.loadSubscription?.unsubscribe();
    const needsAllCustomers = !!(sort || filters.name || filters.cpf);
    if (needsAllCustomers && this.allCustomers) {
      this.loading.set(false);
      this.showLocalPage(page, sort, pageSize, filters, this.allCustomers);
      return;
    }

    this.loading.set(true);
    if (this.loadError()) this.errorMessage.set('');
    this.loadError.set(false);
    if (needsAllCustomers) {
      this.customers.set([]);
      this.totalElements.set(0);
      this.totalPages.set(0);
      this.loadSubscription = this.getAllCustomers().subscribe({
        next: (customers) => {
          this.loading.set(false);
          this.allCustomers = customers;
          this.showLocalPage(page, sort, pageSize, filters, customers);
        },
        error: (error) => this.handleLoadError(error)
      });
      return;
    }

    this.loadSubscription = this.customerService.getCustomers(page, pageSize).subscribe({
      next: (response) => {
        this.loading.set(false);
        const data = response.data;
        if (!response.success || !data) {
          this.loadError.set(true);
          this.showMessage(response.message || 'Could not load customers.', false);
          return;
        }
        this.customers.set(data.content);
        this.totalPages.set(data.totalPages);
        this.totalElements.set(data.totalElements);
        if (data.content.length === 0 && page > 0) {
          this.page.set(page - 1);
        }
      },
      error: (error) => this.handleLoadError(error)
    });
  }

  private getAllCustomers(): Observable<Customer[]> {
    const getPage = (page: number): Observable<PaginatedResponse<Customer>> =>
      this.customerService.getCustomers(page, 100).pipe(
        map((response) => {
          if (!response.success || !response.data) {
            throw new Error(response.message || 'Could not load customers.');
          }
          return response.data;
        })
      );

    return getPage(0).pipe(
      expand((data) => data.page + 1 < data.totalPages ? getPage(data.page + 1) : EMPTY),
      reduce((customers, data) => customers.concat(data.content), [] as Customer[])
    );
  }

  private normalizeName(value: string): string {
    return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('pt-BR');
  }

  private showLocalPage(page: number, sort: 'asc' | 'desc' | null, pageSize: number, filters: CustomerFilters, customers: Customer[]): void {
    const matching = customers.filter((customer) => {
      const nameMatches = !filters.name || this.normalizeName(customer.fullName).includes(filters.name);
      const cpfMatches = !filters.cpf || !!customer.cpf?.replace(/\D/g, '').includes(filters.cpf);
      return nameMatches && cpfMatches;
    });
    if (sort) {
      matching.sort((a, b) => {
        const comparison = this.nameCollator.compare(a.fullName, b.fullName);
        return (sort === 'asc' ? comparison : -comparison) || (a.id ?? '').localeCompare(b.id ?? '');
      });
    }
    const totalPages = Math.ceil(matching.length / pageSize);
    const currentPage = Math.min(page, Math.max(totalPages - 1, 0));
    this.totalElements.set(matching.length);
    this.totalPages.set(totalPages);
    this.customers.set(matching.slice(currentPage * pageSize, (currentPage + 1) * pageSize));
    if (currentPage !== page) this.page.set(currentPage);
  }

  private handleLoadError(error: { error?: { message?: string }; message?: string }): void {
    this.loading.set(false);
    this.loadError.set(true);
    this.showMessage(error.error?.message || error.message || 'Could not load customers.', false);
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
