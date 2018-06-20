import {BrowserModule} from '@angular/platform-browser';
import {NgModule, Injectable} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import { NgxQRCodeModule } from 'ngx-qrcode3';
import {RouterModule, Routes, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { FileUploadModule } from 'ng2-file-upload';
import { FileDropModule } from 'ngx-file-drop/lib/ngx-drop';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

import {ToastyModule} from 'ng2-toasty';
import { HttpClientModule } from '@angular/common/http';
import { NgIdleModule } from '@ng-idle/core';
import { MomentModule } from 'angular2-moment';
import { PushNotificationsModule } from 'angular2-notifications';


import {AuthService} from './services/auth.service';
import {CompanyService} from './services/company.service';
import {CommonService} from './services/common.service';
import {ReportingService} from './services/reporting.service';
import {SignoffService} from './services/signoff.service';

import {AppComponent} from './app.component';
import {LoginComponent} from './pages/login/login.component';
import {IntroComponent} from './pages/intro/intro.component';
import {ForgotPasswordComponent} from './pages/forgot-password/forgot-password.component';
import {HeaderComponent} from './header/header.component';
import {FooterComponent} from './footer/footer.component';
import {SyncComponent} from './pages/sync/sync.component';
import {QuickbookComponent} from './pages/quickbook/quickbook.component';
import {CsvUploadComponent} from './pages/csv-upload/csv-upload.component';
import {FormEntryComponent} from './pages/form-entry/form-entry.component';
import {CoaMatchComponent} from './pages/coa-match/coa-match.component';
import {ReportingComponent} from './pages/reporting/reporting.component';
import {SignoffComponent} from './pages/signoff/signoff.component';
import {ThanksComponent} from './pages/thanks/thanks.component';
import {DashboardComponent} from './pages/dashboard/dashboard.component';
import {DashboardPreviousReportComponent} from './pages/dashboard-previous-report/dashboard-previous-report.component';
import { DashbordSignoffPreviousReportComponent } from './pages/dashbord-signoff-previous-report/dashbord-signoff-previous-report.component';
import { DashbordSignoffPreviousReportEditComponent } from './pages/dashbord-signoff-previous-report/dashbord-signoff-previous-report-edit.component';
import { LogoutComponent } from './pages/logout/logout.component';
import { OrderbydatePipe } from './pipes/orderbydate.pipe';
import { KeysPipe} from './pipes/keys.pipe';
import {Search} from './pages/dashboard/dashboard.component';
import { GroupByPipe} from './pipes/group-by.pipe';
import { ValueByPipe } from './pipes/value-by.pipe';
import { NgPipesModule } from 'ngx-pipes';
import { QuickbookDesktopComponent } from './pages/quickbook-desktop/quickbook-desktop.component';
import { AdminCompanySerachComponent } from './pages/admin-company-serach/admin-company-serach.component';
import { Searchfilter } from './pages/admin-company-serach/admin-company-serach.component';
import { AdminPreviousReportComponent } from './pages/admin-previous-report/admin-previous-report.component';
import { AdminPreviousReportDetailComponent } from './pages/admin-previous-report-detail/admin-previous-report-detail.component';
import { AdminCompanyDashboardComponent } from './pages/admin-company-dashboard/admin-company-dashboard.component';
import { CoaMatchmakingConfirmComponent } from './pages/coa-matchmaking-confirm/coa-matchmaking-confirm.component';
import { ScrollEventModule } from 'ngx-scroll-event';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { CurrencyMaskConfig, CURRENCY_MASK_CONFIG } from 'ng2-currency-mask/src/currency-mask.config';
import { LoadingModule, ANIMATION_TYPES } from 'ngx-loading';
import { LoadingMessageDirective } from './directives/loading-message';
import { CommonHeaderDirective } from "./directives/common-header";
import { LoginInfoDirective } from "./directives/login-info";
import { AccountSecurityComponent } from './pages/account-security/account-security.component';
import { NumberFormatterDirective, NumbersOnlyDirective } from "./directives/number-formatter";
import { SessionExpiredComponent } from './pages/session-expired/session-expired.component';
import { SessionInactiveComponent } from './pages/session-inactive/session-inactive.component';
import { RecoverPasswordComponent } from './pages/recover-password/recover-password.component';
import { ContactUsDirective } from './directives/contact-us';
import { ToggleSignPipe } from './pipes/custom.pipe';
import { ScheduledMaintenanceComponent } from './pages/scheduled-maintenance/scheduled-maintenance.component';
import {AppConstants} from "./app.constants";
import {NumberFormatPipe} from "./pipes/numbers.pipe";
import { PasswordStrengthBarModule } from 'ng2-password-strength-bar';

export const CustomCurrencyMaskConfig: CurrencyMaskConfig = {
  align: "right",
  allowNegative: true,
  allowZero: true,
  decimal: ".",
  precision: 2,
  prefix: "",
  suffix: "",
  thousands: ","
};
@Injectable()
export class CanActivateViaAuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot) {

    // this block is required for all
    if (this.authService.isLoggedIn()) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}



/**
 * Define route with the associated components
 */
export const appRoutes: Routes = [
    {path: 'login', component: LoginComponent, resolve: {loginPage: AuthService}},
    {path: 'change_password/:id', component: ForgotPasswordComponent},
    {path: 'change_password', component: ForgotPasswordComponent},
    {path: 'account-security', component: AccountSecurityComponent},
    {path: 'forgotpassword', component: RecoverPasswordComponent},
    {path: 'session_expired', component: SessionExpiredComponent},
    {path: 'session_inactive', component: SessionInactiveComponent},
    {
        path: 'intro',
        component: IntroComponent,
        canActivate: [
            CanActivateViaAuthGuard
        ]
    },
    {
        path: 'sync',
        pathMatch : 'full',
        component: SyncComponent,
        canActivate: [
            CanActivateViaAuthGuard
        ]
    },
    {
      path: 'sync/error',
      pathMatch : 'full',
      component: SyncComponent,
      canActivate: [
        CanActivateViaAuthGuard
      ]
    },
    {
        path: 'qbook',
        component: QuickbookComponent,
        canActivate: [
            CanActivateViaAuthGuard
        ]
    },
    {
        path: 'csv-upload',
        component: CsvUploadComponent,
        canActivate: [
            CanActivateViaAuthGuard
        ]
    },
    {
        path: 'form-entry',
        component: FormEntryComponent,
        canActivate: [
            CanActivateViaAuthGuard
        ]
    },
    {
        path: 'coa-match/:type',
        component: CoaMatchComponent,
        canActivate: [
            CanActivateViaAuthGuard
        ]
    },
    {
        path: 'reporting/:type',
        component: ReportingComponent,
        canActivate: [
            CanActivateViaAuthGuard
        ]
    },
    {
        path: 'signoff/:type',
        component: SignoffComponent,
        canActivate: [
            CanActivateViaAuthGuard
        ]
    },
    {
        path: 'thanks',
        component: ThanksComponent,
        canActivate: [
            CanActivateViaAuthGuard
        ]
    },
    {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [
            CanActivateViaAuthGuard
        ]
    },
    {
        path: 'dashboard-prev-report',
        component: DashboardPreviousReportComponent,
        canActivate: [
            CanActivateViaAuthGuard
        ]
    },
    {
        path: 'dashboard-signoff-prev-report/:date',
        component: DashbordSignoffPreviousReportComponent,
        canActivate: [
            CanActivateViaAuthGuard
        ]
    },
    {
        path: 'dashboard-signoff-prev-report/:date/:action',
        component: DashbordSignoffPreviousReportEditComponent,
        canActivate: [
            CanActivateViaAuthGuard
        ]
    },
    {
        path: 'quickbook-desktop',
        component: QuickbookDesktopComponent,
        canActivate: [
            CanActivateViaAuthGuard
        ]
    },
    {
        path: 'admin-company-search',
        component: AdminCompanySerachComponent,
        canActivate: [
            CanActivateViaAuthGuard
        ]
    },
    {
        path: 'admin-previous-report/:company_id/:name',
        component: AdminPreviousReportComponent,
        canActivate: [
            CanActivateViaAuthGuard
        ]
    },
    {
        path: 'admin-previous-report-detail/:company_id/:name/:date',
        component: AdminPreviousReportDetailComponent,
        canActivate: [
            CanActivateViaAuthGuard
        ]
    },
    {
        path: 'admin-company-dashboard/:company_id/:name',
        component: AdminCompanyDashboardComponent,
        canActivate: [
            CanActivateViaAuthGuard
        ]
    },
    {
        path: 'coa-match-confirm/:type',
        component: CoaMatchmakingConfirmComponent,
        canActivate: [
            CanActivateViaAuthGuard
        ]
    },
    {
        path: 'logout',
        component: LogoutComponent,
        canActivate: [
          CanActivateViaAuthGuard
        ]
    },
    {path: '**', component: LoginComponent, resolve: {loginPage: AuthService}}
];


@NgModule({
    declarations: [
        AppComponent,
        LoginComponent,
        HeaderComponent,
        FooterComponent,
        LoadingMessageDirective,
        CommonHeaderDirective,
        LoginInfoDirective,
        AccountSecurityComponent,
        ContactUsDirective,
        NumberFormatterDirective,
        NumbersOnlyDirective,
        IntroComponent,
        SyncComponent,
        QuickbookComponent,
        CsvUploadComponent,
        FormEntryComponent,
        CoaMatchComponent,
        ReportingComponent,
        SignoffComponent,
        ThanksComponent,
        DashboardComponent,
        DashboardPreviousReportComponent,
        DashbordSignoffPreviousReportComponent,
        DashbordSignoffPreviousReportEditComponent,
        LogoutComponent,
        OrderbydatePipe,
        KeysPipe,
        GroupByPipe,
        ValueByPipe,
        NumberFormatPipe,
        Search,
        Searchfilter,
        QuickbookDesktopComponent,
        AdminCompanySerachComponent,
        AdminPreviousReportComponent,
        AdminPreviousReportDetailComponent,
        AdminCompanyDashboardComponent,
        CoaMatchmakingConfirmComponent,
        ForgotPasswordComponent,
        SessionExpiredComponent,
        SessionInactiveComponent,
        RecoverPasswordComponent,
        ToggleSignPipe,
        ScheduledMaintenanceComponent,
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        BrowserAnimationsModule,
        NgxQRCodeModule,
        CurrencyMaskModule,
        ScrollEventModule,
        PasswordStrengthBarModule,
        FileUploadModule,
        FileDropModule,
        NgPipesModule,
        MomentModule,
        HttpClientModule,
        PushNotificationsModule,
        NgIdleModule.forRoot(),
        RouterModule.forRoot(
            appRoutes,
                {enableTracing: true, useHash:false}
        ),
        BsDatepickerModule.forRoot(),
        ToastyModule.forRoot(),
        LoadingModule.forRoot({
            // animationType: ANIMATION_TYPES.wanderingCubes,
            backdropBackgroundColour: 'rgba(255,255,255,0.9)',
            backdropBorderRadius: '4px',
            primaryColour: '#0085CA',
            secondaryColour: '#0085CA',
            tertiaryColour: '#0085CA'
        })
    ],
    providers: [
        AuthService,
        CommonService,
        CompanyService,
        ReportingService,
        SignoffService,
        CanActivateViaAuthGuard,
        { provide: CURRENCY_MASK_CONFIG, useValue: CustomCurrencyMaskConfig },
        NumberFormatPipe
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
