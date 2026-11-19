import { Component, ElementRef, HostListener, OnDestroy, computed, inject, signal, viewChild } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ThemeMode, ThemeService } from '../../services/theme.service';
import { I18nService } from '../../services/i18n.service';
import { CustomerService } from '../../services/customer.service';
import { TranslationKey } from '../../i18n';
import { Customer } from '../../models/customer';
import { formatCpf } from '../../utils/formatters';

const MIN_SEARCH_LENGTH = 3;
const MAX_SEARCH_RESULTS = 20;

@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-navbar',
  styleUrl: './navbar.css',
  templateUrl: './navbar.html',
})
export class Navbar implements OnDestroy {
  protected readonly theme = inject(ThemeService);
  protected readonly auth = inject(AuthService);
  protected readonly i18n = inject(I18nService);
  private readonly customerService = inject(CustomerService);
  private readonly searchDialog = viewChild.required<ElementRef<HTMLDialogElement>>('searchDialog');
  protected readonly formatCpf = formatCpf;
  protected readonly themeOptions: { value: ThemeMode; labelKey: TranslationKey; icon: string }[] = [
    { value: 'light', labelKey: 'theme.light', icon: 'bi-sun-fill' },
    { value: 'dark', labelKey: 'theme.dark', icon: 'bi-moon-stars-fill' },
    { value: 'auto', labelKey: 'theme.auto', icon: 'bi-circle-half' },
  ];
  protected readonly currentTheme = computed(
    () => this.themeOptions.find((option) => option.value === this.theme.mode()) ?? this.themeOptions[2],
  );
  protected readonly searchQuery = signal('');
  protected readonly canSearch = computed(() => this.searchQuery().trim().length >= MIN_SEARCH_LENGTH);
  protected readonly searchResults = signal<Customer[]>([]);
  protected readonly searchLoading = signal(false);
  protected readonly searchError = signal(false);
  private customers: Customer[] | null = null;
  private loadSubscription?: Subscription;

  @HostListener('document:keydown', ['$event'])
  onDocumentKeydown(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.openSearch();
    }
  }

  ngOnDestroy(): void {
    this.loadSubscription?.unsubscribe();
  }

  protected openSearch(): void {
    const dialog = this.searchDialog().nativeElement;
    if (!dialog.open) dialog.showModal();
  }

  protected closeSearch(): void {
    this.searchDialog().nativeElement.close();
  }

  protected onSearchClose(): void {
    this.loadSubscription?.unsubscribe();
    this.customers = null;
    this.searchQuery.set('');
    this.searchResults.set([]);
    this.searchLoading.set(false);
    this.searchError.set(false);
  }

  protected onSearchInput(value: string): void {
    this.searchQuery.set(value);
    this.searchError.set(false);
    if (!this.canSearch()) {
      this.loadSubscription?.unsubscribe();
      this.searchLoading.set(false);
      this.searchResults.set([]);
      return;
    }
    if (this.customers) {
      this.searchResults.set(this.filterCustomers(this.customers, value));
      return;
    }
    if (this.searchLoading()) return;

    this.searchLoading.set(true);
    this.loadSubscription = this.customerService.getAllCustomers().subscribe({
      next: (customers) => {
        this.customers = customers;
        this.searchLoading.set(false);
        this.searchResults.set(this.filterCustomers(customers, this.searchQuery()));
      },
      error: () => {
        this.searchLoading.set(false);
        this.searchError.set(true);
      },
    });
  }

  private filterCustomers(customers: Customer[], value: string): Customer[] {
    const trimmed = value.trim();
    const isCpfQuery = /^[\d.\-\s]+$/.test(trimmed);
    const digits = trimmed.replace(/\D/g, '');
    const normalizedName = this.normalizeText(trimmed);
    return customers
      .filter((customer) => isCpfQuery
        ? !!customer.cpf?.replace(/\D/g, '').includes(digits)
        : this.normalizeText(customer.fullName).includes(normalizedName))
      .slice(0, MAX_SEARCH_RESULTS);
  }

  private normalizeText(value: string): string {
    return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('pt-BR');
  }
}
