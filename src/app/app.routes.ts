import { Routes } from '@angular/router';
import { Dashboard } from './components/dashboard/dashboard';
import { CustomerList } from './components/customer/customer-list/customer-list';
import { CustomerRegistration } from './components/customer/customer-registration/customer-registration';
import { Login } from './components/login/login';
import { Settings } from './components/settings/settings';
import { authGuard, guestGuard } from './guards/auth.guard';


export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'login', component: Login, canActivate: [guestGuard] },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  {
    path: 'customers',
    component: CustomerList,
    canActivate: [authGuard],
    children: [
      { path: 'new', component: CustomerRegistration },
      { path: ':id', component: CustomerRegistration, data: { mode: 'view' } },
      { path: ':id/edit', component: CustomerRegistration }
    ]
  },
  { path: 'settings', component: Settings, canActivate: [authGuard] },
  { path: '**', redirectTo: 'dashboard' }
];
