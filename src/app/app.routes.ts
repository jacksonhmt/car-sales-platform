import { Routes } from '@angular/router';
import { Dashboard } from './components/dashboard/dashboard';
import { CustomerList } from './components/customer/customer-list/customer-list';
import { CustomerRegistration } from './components/customer/customer-registration/customer-registration';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'dashboard', component: Dashboard },
  {
    path: 'customers',
    component: CustomerList,
    children: [
      { path: 'new', component: CustomerRegistration },
      { path: ':id', component: CustomerRegistration, data: { mode: 'view' } },
      { path: ':id/edit', component: CustomerRegistration }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
