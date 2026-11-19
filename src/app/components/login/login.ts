import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { I18nService } from '../../services/i18n.service';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);
  protected readonly i18n = inject(I18nService);

  readonly form = this.fb.nonNullable.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  readonly submitted = signal(false);
  readonly errorMessage = signal('');

  get f() {
    return this.form.controls;
  }

  onSubmit(): void {
    this.submitted.set(true);
    this.errorMessage.set('');

    if (this.form.invalid) {
      return;
    }

    const { username, password } = this.form.getRawValue();
    if (this.auth.login(username, password)) {
      this.router.navigateByUrl(this.returnUrl());
      return;
    }

    this.errorMessage.set(this.i18n.t('login.invalidCredentials'));
  }

  // Only internal paths are accepted, so the parameter cannot redirect to another site.
  private returnUrl(): string {
    const url = this.route.snapshot.queryParamMap.get('returnUrl');
    const isInternal = !!url && url.startsWith('/') && !url.startsWith('//');
    return isInternal && !url.startsWith('/login') ? url : '/dashboard';
  }
}
