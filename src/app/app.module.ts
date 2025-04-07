/* eslint-disable @typescript-eslint/no-unused-vars */
import { NgModule } from '@angular/core';

import { MatSliderModule } from '@angular/material/slider';
import { MatDialogModule } from '@angular/material/dialog';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
// import { MatPaginator } from '@angular/material/paginator';
// import { MatTableDataSource } from '@angular/material/table';

import { A11yModule } from '@angular/cdk/a11y';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { PortalModule } from '@angular/cdk/portal';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { CdkTableModule } from '@angular/cdk/table';
import { CdkTreeModule } from '@angular/cdk/tree';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatMenuModule } from '@angular/material/menu';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
// import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTreeModule } from '@angular/material/tree';
import { OverlayModule } from '@angular/cdk/overlay';

import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { InMemoryDataService } from './in-memory-data.service';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { MessagesComponent } from './messages/messages.component';
import { SmpConfigComponent } from './smp-config/smp-config.component';
import { SmpATListComponent } from './smp-config/smp-at-list.component';

import { SmpConfigListComponent } from './smp-config-list/smp-config-list.component';
import { AppconfigComponent } from './appconfig/appconfig.component';
import { AppconfigListComponent } from './appconfig-list/appconfig-list.component';
import { AppconfigSelectComponent } from './appconfig/appconfig-select.component';
import { ATSelectComponent } from './at-select/at-select.component';
import { ATMapComponent } from './at-map/at-map.component';
import { SmpshareComponent } from './smpshare/smpshare.component';
import { PublicshareComponent } from './publicshare/publicshare.component';
import { ContentSelectComponent } from './content-select/content-select.component';
import { ContentPreviewComponent } from './content-preview/content-preview.component';
import { ContentPreviewDialogComponent } from './content-preview/content-preview-dialog.component';
import { PreviewComponent } from './content-preview/preview.component';
import { PreviewWeiBoComponent } from './content-preview/preview-weibo.component';
import { PreviewWeChatComponent } from './content-preview/preview-wechat.component';
import { PreviewWeComComponent } from './content-preview/preview-wecom.component';
import { PreviewFacebookComponent } from './content-preview/preview-facebook.component';

import { CommonParent } from './util/index';
import { ConfirmComponent } from './util/confirm/confirm.component';

import { TITLE, TITLE_VALUE } from './di/DI';
import { HomeComponent } from './home/home.component';
import { PreferenceComponent } from './preference/preference.component';
import { PreferenceScopedComponent } from './preference/preference-scoped.component';
import { NewATMapDialogComponent } from './preference/new-at-map-dialog.component';
import { AtconfigsComponent } from './atconfigs/atconfigs.component';
import { AtconfigComponent } from './atconfig/atconfig.component';

import { ShareConfigComponent } from './share-config/share-config.component';
import { WeiBoConfigComponent } from './share-config/weibo-config.component';
import { WeChatConfigComponent } from './share-config/wechat-config.component';
import { WeComConfigComponent } from './share-config/wecom-config.component';
import { FacebookConfigComponent } from './share-config/facebook-config.component';

import { SafeHtmlPipe } from './pipe/safehtml.pipe';
/* eslint-enable @typescript-eslint/no-unused-vars */

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,

    // The HttpClientInMemoryWebApiModule module intercepts HTTP requests
    // and returns simulated server responses.
    // Remove it when a real server is ready to receive requests.
//  HttpClientInMemoryWebApiModule.forRoot(
//    InMemoryDataService, { dataEncapsulation: false, delay: 100 }
//  )
    HttpClientModule,

    BrowserAnimationsModule,
    ReactiveFormsModule,

    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSliderModule,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatStepperModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    //  MatPaginator,
    //  MatTableDataSource,

    A11yModule,
    ClipboardModule,
    CdkStepperModule,
    CdkTableModule,
    CdkTreeModule,
    DragDropModule,
    MatAutocompleteModule,
    MatBadgeModule,
    MatBottomSheetModule,
    MatButtonToggleModule,
    MatCardModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDividerModule,
    MatExpansionModule,
    MatGridListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRippleModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTreeModule,
    OverlayModule,
    PortalModule,
    ScrollingModule,
  ],
  declarations: [
    AppComponent,
    SafeHtmlPipe,
    MessagesComponent,
    SmpConfigComponent,
    SmpConfigListComponent,
    AppconfigComponent,
    AppconfigListComponent,
    AppconfigSelectComponent,
    ATSelectComponent,
    ATMapComponent,
    SmpshareComponent,
    PublicshareComponent,
    ContentSelectComponent,
    ContentPreviewComponent,
    ContentPreviewDialogComponent,
    PreviewComponent,
    PreviewWeiBoComponent,
    PreviewWeChatComponent,
    PreviewWeComComponent,
    PreviewFacebookComponent,
    CommonParent,
    ConfirmComponent,
    SmpATListComponent,
    HomeComponent,
    PreferenceComponent,
    PreferenceScopedComponent,
    NewATMapDialogComponent,
    AtconfigsComponent,
    AtconfigComponent,
    ShareConfigComponent,
    WeiBoConfigComponent,
    WeChatConfigComponent,
    WeComConfigComponent,
    FacebookConfigComponent,

  ],
  providers: [
    //  { provide: Hero,          useValue:    someHero },
    { provide: TITLE, useValue: TITLE_VALUE },
    //  { provide: MinimalLogger, useExisting: WCMService },
    //  { provide: HeroService,   useClass:    HeroService },
    //  { provide: LoggerService, useClass:    DateLoggerService },
    //  { provide: MinimalLogger, useExisting: LoggerService },
    //  { provide: RUNNERS_UP,    useFactory:  runnersUpFactory(2), deps: [Hero, HeroService] }
  ],
  bootstrap: [AppComponent],
})
export class AppModule { } // eslint-disable-line import/prefer-default-export
