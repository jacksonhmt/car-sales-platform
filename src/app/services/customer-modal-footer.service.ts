import { Injectable, TemplateRef, signal } from '@angular/core';

/** Lets the active modal route provide its action buttons to the modal footer. */
@Injectable({ providedIn: 'root' })
export class CustomerModalFooterService {
  readonly template = signal<TemplateRef<unknown> | null>(null);
}
