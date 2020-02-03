import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { AuthComponent } from './components/auth/auth.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule } from '@angular/material/dialog';

import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { StashListComponent } from './components/stash-list/stash-list.component';
import { TitleBarComponent } from './components/title-bar/title-bar.component';
import { StashContainerComponent } from './components/stash-container/stash-container.component';
import { StashDetailsComponent } from './components/stash-details/stash-details.component';
import { ItemFilterPipe } from './pipes/item-filter.pipe';
import { ItemDetailsComponent } from './components/item-details/item-details.component';
import { ItemPriceComponent } from './components/item-price/item-price.component';

const appRoutes: Routes = [
  {
    path: 'stashes',
    component: StashContainerComponent
  },
  {
    path: '',
    redirectTo: '/stashes',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/stashes',
    pathMatch: 'full'
  }
];


@NgModule({
  declarations: [
    AppComponent,
    AuthComponent,
    StashListComponent,
    TitleBarComponent,
    StashContainerComponent,
    StashDetailsComponent,
    ItemFilterPipe,
    ItemDetailsComponent,
    ItemPriceComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    FormsModule,
    MatIconModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatGridListModule,
    MatDividerModule,
    MatProgressBarModule,
    MatDialogModule,

    RouterModule.forRoot(
      appRoutes,
      { enableTracing: false } // <-- debugging purposes only
    )
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [
    ItemDetailsComponent
  ]
})
export class AppModule { }
