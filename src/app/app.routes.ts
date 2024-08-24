import { Routes } from '@angular/router';
import { DefaultComponent } from './layout/default/default.component';
import { DashboardComponent } from './shared/dashboard/dashboard.component';
import { HomeComponent } from './home/home.component';
import { PortifolioComponent } from './portifolio/portifolio.component';
import { BrokerageHistoryComponent } from './brokerage/brokerage-history/brokerage-history.component';
import { Error404Component } from './errors/404/404.component';
import { PortifolioResolverService } from './portifolio/portifolio-resolver.service';
import { AnalisysComponent } from './analisys/analisys.component';

export const routes: Routes = [
    { 
        path: '', component: HomeComponent,
        children: [
            { path: 'dashboard', component: DashboardComponent},
            { path: 'portifolio', component: PortifolioComponent, /*resolve: { portifolio: PortifolioResolverService }*/},
            { path: 'brokerage-history', component: BrokerageHistoryComponent},
            { path: 'analysis', component: AnalisysComponent},
            { path: '', redirectTo: 'dashboard', pathMatch: 'full'},
        ]
    },
    { path: 'default', component: DefaultComponent},
    { path: '404', component: Error404Component},
    { path: '**', redirectTo: '404', pathMatch: 'full'}
];
