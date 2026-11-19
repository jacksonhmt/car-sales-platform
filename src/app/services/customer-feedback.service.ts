import { Injectable, signal } from '@angular/core';

/** Carries a success message from the registration modal to the customer list, which shows it. */
@Injectable({ providedIn: 'root' })
export class CustomerFeedbackService {
  readonly pendingSuccessMessage = signal<string | null>(null);
}
