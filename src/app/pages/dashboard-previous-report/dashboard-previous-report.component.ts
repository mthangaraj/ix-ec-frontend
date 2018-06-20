import {Component, ElementRef, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from './../../services/auth.service';
import {CompanyService} from './../../services';
import {ReportingService} from './../../services';
import {CommonService} from "../../services";
import {environment} from './../../../environments/environment';
import * as moment from 'moment';
import {AppConstants, ErrorCodes, ErrorMessage, LoadingMessage, NavigateToScreen} from '../../app.constants';
import {ScrollEvent} from "ngx-scroll-event";
import {AppComponent} from '../../app.component';
import {isNullOrUndefined} from "util";

@Component({
    selector: 'app-dashboard-previous-report',
    templateUrl: './dashboard-previous-report.component.html',
    styleUrls: ['./dashboard-previous-report.component.css'],
    providers: [ CompanyService, AuthService, ReportingService ]
})
export class DashboardPreviousReportComponent implements OnInit {
    showLoading: boolean = true;
    showContact: boolean = true;

    loadingMessage: any;
    date;
    reports;
    next_reporting_peroid;
    next_reporting_due: boolean = false;
    monthly_reporting_sync_method;
    reporting_in_progress: boolean = false;
    current_reporting_period;
    companyAccountingType;

    username;
    companyName;
    constructor(private company_service: CompanyService,
                private reporting_service: ReportingService,
                private auth_servcie: AuthService,
                private router: Router,
                private common: CommonService,
                private elRef: ElementRef,
                private appComponent: AppComponent) {
        this.username = this.common.getUserName();
        this.companyName = this.common.getCompanyName();
        this.companyAccountingType = this.common.getAccountingType();
        this.loadingMessage = {
            'message': '',
            'error':''
        }

        this.loadingMessage['message'] = LoadingMessage.LOADING_PREVIOUS_REPORT;

        //let params = {last_page: '/dashboard-prev-report'};
        //api call to set the metdata  last page
        this.company_service.getCompanyMetadata().
        then(
            data => {
                this.appComponent.session_warning();
                this.next_reporting_peroid = data.result.monthly_reporting_next_period;
                this.monthly_reporting_sync_method = data.result.monthly_reporting_sync_method;
                this.current_reporting_period = data.result.monthly_reporting_current_period;

                /*
                // #brad: we may not need a reporting in progress screen because the app always
                //        takes you back to where you left off, so if it was in the middle of a reporting
                //        you'll continue automatically the next time you login. In this version of the portal, this behaviour is good.
                */
                if (data.result.monthly_reporting_current_period_status == 'IN_PROGRESS') {
                    this.reporting_in_progress = true;
                }else {
                    // Compare next_reportin_period with today's date
                    // #brad #todo: this should think that reporting is in progress as well.
                    var report_due_date = new Date(this.next_reporting_peroid);
                    var todays_date = new Date();
                    if(report_due_date < todays_date) {
                        this.next_reporting_due = true;
                    }
                }
            }
        ).catch((error) => {
            let errBody = JSON.parse(error._body);
            if (this.common.sessionCheck(errBody.code)) {
                this.appComponent.session_warning();
                    this.loadingMessage['message'] = LoadingMessage.GET_COMPANY_META;
                    this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
                }
        });

        // get reporting_next_period from company meta
        //        this.company_service.getCompanyMetadata().subscribe(data => {
        //            this.common.debuglog(data)
        //            this.next_reporting_peroid = data.monthly_reporting_next_period;
        //        })

        // get monthly reports
        this.company_service.getMonthlyReport()
            .then(response => {
                this.appComponent.session_warning();
                if (response.length > 0) {
                    var field = 'period_ending';
                    response.sort((record1: any, record2: any) => {
                        let date1 = Number(new Date(record1[field]));
                        let date2 = Number(new Date(record2[field]));

                        return date2 - date1;
                    });
                    this.reports = response;
                    this.common.debuglog(this.reports);
                }else {
                    this.reports = [];
                }
                this.showLoading = false;
            })
            .catch((error) => {
                let errBody = JSON.parse(error._body);
                if (this.common.sessionCheck(errBody.code)) {
                    this.appComponent.session_warning();
                        this.loadingMessage['message'] = LoadingMessage.GET_MONTHLY_REPORT;
                        this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
                    }
            });
    }

    /*
    * Hide the contact us dropdown while scrolling event.
     */
    handleScroll(event: ScrollEvent) {
        let elements = this.elRef.nativeElement.querySelector('#contact-us');
        if (elements.classList.contains('open')) {
            elements.classList.remove('open');
        }
    }

    // Triggers the beginning of a monthly reporting
    startMonthlyReporting() {
        this.showLoading = true;
        this.loadingMessage['message'] = LoadingMessage.START_REPORT + moment(this.next_reporting_peroid).format('MMM DD, YYYY');
        // #brad: last_page isn't sync, monthly_reporting_sync_method will already be set, so need to remove this after testing.
        /*let params = {
            monthly_reporting_sync_method: type,
            last_page: '/sync'
        };

        var type = this.monthly_reporting_sync_method;*/

        let sync_type = this.common.getSyncMethod();
        if(isNullOrUndefined(sync_type)){
            this.showLoading = false;
            this.appComponent.addToast('error', 'Error',ErrorMessage.NO_SYNC_SETUP);
            return;
        }


        // Create the monthly report for the current period. This functio will not allow dupliacte montly report entries to be created.
        this.reporting_service.postMonthlyReportForCurrentPeriod(localStorage.getItem('company'), localStorage.getItem('token'))
            .then(
                (response) => {
                    this.appComponent.session_warning();
                this.common.debuglog('created a new monthly report if one didnt already exist '+response);
                // #brad postMonthlyReportForCurrentPeriod causes the next and current period in the meta to change, so we need to
                // refresh the localStorage before we move on.
                this.company_service.getCompanyMetadata()
                    .then(
                    meta => {
                        this.appComponent.session_warning();
                        // refresh localStorage version of meta and store from the result of response
                        localStorage.setItem('company_meta', JSON.stringify(meta.result));
                        var type = meta.result.monthly_reporting_sync_method;

                        if(isNullOrUndefined(type)){
                            this.showLoading = false;
                            this.appComponent.addToast('error', 'Error',ErrorMessage.NO_SYNC_SETUP);
                            return;
                        }

                        // #brad: don't move forward until the monthly report has been created
                        if (this.common.checkAccountSyncType(type)) {
                            //Redirect to the quick books link
                          let account_type = this.companyAccountingType.charAt(0).toUpperCase() + this.companyAccountingType.slice(1);
                          this.router.navigate([NavigateToScreen.coa_match, this.companyAccountingType.toLowerCase()]);
                        } else if (type == AppConstants.QBD_ACCOUNT_TYPE) {
                            //make a call to quick book desktop app
                            this.showLoading = false;
                            this.router.navigate([NavigateToScreen.qbd]);
                        } else if (type == AppConstants.CSV_ACCOUNT_TYPE) {
                            // this.company_service.putCompany({ accounting_type: 'Sage' }).subscribe(response => {
                            //Redirect to the CSV
                            this.showLoading = false;
                            this.router.navigate([NavigateToScreen.csv]);
                            // })
                        } else if (type == AppConstants.MANUAL_ACCOUNT_TYPE) {
                            //Redirect to the manual
                            this.showLoading = false;
                            this.router.navigate([NavigateToScreen.manual]);
                        }
                    }
                )
                .catch((error) => {
                    let errBody = JSON.parse(error._body);
                    if (this.common.sessionCheck(errBody.code)) {
                            this.appComponent.session_warning();
                            this.loadingMessage['message'] = LoadingMessage.GET_COMPANY_META;
                            this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
                        }
                });
            }
        ).catch((error) => {
            let errBody = JSON.parse(error._body);
            if (this.common.sessionCheck(errBody.code)) {
                this.appComponent.session_warning();
                    this.loadingMessage['message'] = LoadingMessage.CREATE_MONTHLY_REPORT_FOR_CURRENT_PERIOD;
                    this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
                }
        });
    }

    continueMonthlyReporting() {
        this.showLoading = true;
        this.loadingMessage['message'] = LoadingMessage.CONTINUE_REPORT + moment(this.next_reporting_peroid).format('MMM DD, YYYY');
        this.company_service.getCompanyMetadata()
        .then(
            meta => {
                this.appComponent.session_warning();
                // refresh localStorage version of meta and store from the result of response
                localStorage.setItem('company_meta', JSON.stringify(meta.result));
                var type = meta.result.monthly_reporting_sync_method;
                if(isNullOrUndefined(type)){
                    this.showLoading = false;
                    this.appComponent.addToast('error', 'Error',ErrorMessage.NO_SYNC_SETUP);
                    return;
                }
                var path = [meta.result.last_page];
                this.common.debuglog('#### redirecting to path '+path);
                // #brad: don't move forward until the monthly report has been created
                if (this.common.checkAccountSyncType(type)) {
                    this.showLoading = false;
                    this.router.navigate(path);
                } else if (type == AppConstants.QBD_ACCOUNT_TYPE) {
                    // make a call to quick book desktop app
                    this.showLoading = false;
                    this.router.navigate(path);
                } else if (type == AppConstants.CSV_ACCOUNT_TYPE) {
                    // this.company_service.putCompany({ accounting_type: 'Sage' }).subscribe(response => {
                    //Redirect to the CSV
                    this.showLoading = false;
                    this.router.navigate(path);
                    // })
                } else if (type == AppConstants.MANUAL_ACCOUNT_TYPE) {
                    //Redirect to the manual
                    this.showLoading = false;
                    this.router.navigate(path);
                }
            }
        )
        .catch((error) => {
            let errBody = JSON.parse(error._body);
            if (this.common.sessionCheck(errBody.code)) {
                this.appComponent.session_warning();
                    this.loadingMessage['message'] = LoadingMessage.GET_COMPANY_META;
                    this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
                }
        });
    }

    ngOnInit() {
    }

    /**
     * logout and clear local storage
     */
    logOut() {
        this.appComponent.reset();
        this.auth_servcie.logout();
        this.router.navigate(['/']);
    }

}
