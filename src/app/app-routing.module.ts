/* eslint-disable @typescript-eslint/no-unused-vars */
import { NgModule } from '@angular/core';
// First, the app-routing.module.ts file imports RouterModule and Routes so the application can have routing functionality.
import { RouterModule, Routes } from '@angular/router';

// import { DashboardComponent } from './dashboard/dashboard.component';
// // HeroesComponent, will give the Router somewhere to go once you configure the routes.
// import { HeroesComponent } from './heroes/heroes.component';
// import { HeroDetailComponent } from './hero-detail/hero-detail.component';
//
// import { CustomerHomeComponent } from './customer-home/customer-home.component';
// import { CustomerTransactionsComponent } from './customer-transactions/customer-transactions.component';
// import { AtmSimulatorComponent } from './atm-simulator/atm-simulator.component';
// import { CustomerCreditRequestComponent } from './customer-credit-request/customer-credit-request.component';

import { HomeComponent } from './home/home.component';
import { PreferenceComponent } from './preference/preference.component';

import { SmpConfigComponent } from './smp-config/smp-config.component';
import { SmpConfigListComponent } from './smp-config-list/smp-config-list.component';
import { AppconfigComponent } from './appconfig/appconfig.component';
import { AppconfigListComponent } from './appconfig-list/appconfig-list.component';
import { SmpshareComponent } from './smpshare/smpshare.component';
import { PublicshareComponent } from './publicshare/publicshare.component';

import { getFromWPS } from '../utils/utils';
/* eslint-enable @typescript-eslint/no-unused-vars */

const tmpVal = getFromWPS('isApproveOnly');
const isApproveOnly: boolean = tmpVal === 'true';
// console.warn(`isApproveOnly: ${tmpVal}`);

const defaultPage = isApproveOnly ? '/publicshare' : '/home';
const routes: Routes = [
  { path: '', redirectTo: defaultPage, pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'preference', component: PreferenceComponent },
  { path: 'smp-config', component: SmpConfigComponent },
  { path: 'smp-config-list', component: SmpConfigListComponent },
  { path: 'appconfig', component: AppconfigComponent },
  { path: 'appconfig-list', component: AppconfigListComponent },
  { path: 'smpshare', component: SmpshareComponent },
  { path: 'publicshare', component: PublicshareComponent },
  // disable those bank-demo path
// { path: '', redirectTo: '/custome-home', pathMatch: 'full' },
// { path: 'custome-home', component: CustomerHomeComponent },
// { path: 'custome-transactions', component: CustomerTransactionsComponent },
// { path: 'atm-simulator', component: AtmSimulatorComponent },
// { path: 'customer-credit-request', component: CustomerCreditRequestComponent },
];

@NgModule({
  // RouterModule.forRoot() The @NgModule metadata initializes the router and starts it listening for browser location changes.
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  // AppRoutingModule exports RouterModule so it will be available throughout the application.
  exports: [RouterModule],
})
export class AppRoutingModule {} // eslint-disable-line import/prefer-default-export
