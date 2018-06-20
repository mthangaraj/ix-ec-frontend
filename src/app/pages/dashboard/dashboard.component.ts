import {Component, ElementRef, OnInit, Pipe, PipeTransform} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from './../../services/auth.service';
import {CompanyService} from './../../services';
import {ReportingService} from '../../services';
import {environment} from './../../../environments/environment';
import {CommonService} from "../../services";
import { CurrencyPipe } from '@angular/common';
import { DecimalPipe } from '@angular/common';
import * as moment from 'moment';
import {AppConstants, ErrorCodes, ErrorMessage, LoadingMessage, NavigateToScreen} from '../../app.constants';
import {ScrollEvent} from "ngx-scroll-event";
import {AppComponent} from '../../app.component';
import {isNull, isNullOrUndefined} from "util";

/**
 * pipe for searching value by name and date for balancesheet and incomestatement
*/

@Pipe({name: 'Search'})
export class Search implements PipeTransform {
    transform(value: Array<any>, field: string, date: string) {
        let searchText = field;
        if (value) {
            return value.filter(project => {
                if (project) {
                    if (project.fse_tag.name == searchText && project.period_ending == date) {
                        return project.value;
                    }
                    else {
                        return false;
                    }
                }
            });
        }
    }
}


@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css'],
    providers: [ CompanyService, AuthService, ReportingService ]
})

// need to add automatic logout when session expires. #brad #todo
export class DashboardComponent implements OnInit {
    showLoading: boolean = true;
    showContact: boolean = true;
    loadingMessageClass: string = 'msg_gen_fin_overview'; // once we fix the auto centering issue for these messages, this will no longer be needed. #todo #brad

    income_statement: any = [];
    balance_sheet: any = [];
    myjson: any = JSON;
    next_reporting_peroid;
    current_reporting_period;
    next_reporting_due: boolean = false;
    monthly_reporting_sync_method;
    reporting_in_progress: boolean = false;
    companyAccountingType: string;
    loadingMessage: any;
    username;
    companyName;
    negative_collection:any;
    constructor(private company_service: CompanyService,
                private reporting_service: ReportingService,
                private auth_servcie: AuthService,
                private router: Router,
                private common: CommonService,
                private elRef: ElementRef,
                private appComponent: AppComponent) {

        this.loadingMessage = {
            'message': '',
            'error': ''
        };
        this.companyAccountingType = this.common.getAccountingType();
        this.loadingMessage['message'] = LoadingMessage.FINANCIAL_OVERVIEW;

        let params = {}; // don't set last_page on dashboard because it overwrites the page that Save & Exit sets. The Thank You page will set the page for dashboard.
        //api call to set the metdata  last page
        this.company_service.updateCompanyMetadata(params)
            .then(
                data => {
                    if(data.status == AppConstants.SUCCESS_RESPONSE){
                        this.appComponent.session_warning();
                        this.next_reporting_peroid = data.result.monthly_reporting_next_period;
                        this.current_reporting_period = data.result.monthly_reporting_current_period;
                        this.monthly_reporting_sync_method = data.result.monthly_reporting_sync_method;

                        this.common.debuglog('DashboardComponent constructor with META '+data.result.monthly_reporting_current_period);
                        /*
                            brad: we may not need a reporting in progress screen because the app always
                                  takes you back to where you left off, so if it was in the middle of a reporting
                                  you'll continue automatically the next time you login. In this version of the portal, this behaviour is good.
                        */
                        if(data.result.monthly_reporting_current_period_status == AppConstants.SETUP_STATUS_IN_PROGRESS) {
                            this.reporting_in_progress = true;
                        }
                        else {
                            // Compare next_reportin_period with today's date
                            // #brad #todo: this should think that reporting is in progress as well.
                            var report_due_date = new Date(this.next_reporting_peroid);
                            var todays_date = new Date();
                            if(report_due_date < todays_date) {
                                this.next_reporting_due = true;
                            }
                        }
                        this.common.debuglog('dashboard comp MEAT'+JSON.stringify(data.result));


                        // get income and balance sheet of last 24 months and sort it by date.
                        // Only retrieve this info after the meta data has been update
                        this.company_service.getIncomeStatementOfLastMonths()
                            .then(data => {
                                if(data.status == AppConstants.SUCCESS_RESPONSE) {
                                    if(data.message){
                                        this.showLoading = false;
                                        data.result = [];
                                    }
                                    this.appComponent.session_warning();
                                    var feild = 'period_ending';
                                    data.result.sort((a: any, b: any) => {
                                        let left = Number(new Date(a[feild]));
                                        let right = Number(new Date(b[feild]));
                                        return right - left;
                                    });
                                    this.income_statement = data.result;
                                    this.company_service.getBalanceStatementOfLastMonths()
                                        .then(data => {
                                            if(data.status == AppConstants.SUCCESS_RESPONSE) {
                                                if(data.message){
                                                    this.showLoading = false;
                                                    data.result = [];
                                                }
                                                this.appComponent.session_warning();
                                                var feild = 'period_ending';
                                                data.result.sort((a: any, b: any) => {
                                                    let left = Number(new Date(a[feild]));
                                                    let right = Number(new Date(b[feild]));
                                                    return right - left;
                                                });
                                                this.balance_sheet = data.result;
                                                this.showLoading = false;
                                            }
                                        })
                                        .catch((error) => {
                                            let errBody = JSON.parse(error._body);
                                            if (this.common.sessionCheck(errBody.code)) {
                                                this.appComponent.session_warning();
                                                    this.loadingMessage['message'] = LoadingMessage.GET_BALANCE_SHEET;
                                                    this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
                                                }
                                        });
                                }
                            })
                            .catch((error) => {
                                let errBody = JSON.parse(error._body);
                                if (this.common.sessionCheck(errBody.code)) {
                                    this.appComponent.session_warning();
                                        this.loadingMessage['message'] = LoadingMessage.GET_INCOME_STATEMENT;
                                        this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
                                    }
                            });
                    }
                }
            )
            .catch((error) => {
                let errBody = JSON.parse(error._body);
                if (this.common.sessionCheck(errBody.code)) {
                    this.appComponent.session_warning();
                        this.loadingMessage['message'] = LoadingMessage.UPDATE_COMPANY_META;
                        this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
                    }
            });
    }

    /*
    * Hide the contact us dropdown while scrolling event.
     */
    handleScroll(event: ScrollEvent) {
        let elements = this.elRef.nativeElement.querySelector('#contact-us');
        if(elements.classList.contains('open')) {
          elements.classList.remove('open');
        }
    }


    // Triggers the beginning of a monthly reporting
    // we need to create a common dashboard service to deal with the functionality
    // around the side bar for all 3 dashboard related views. a separate sidebar
    // template / component would also be good. #brad #todo
    startMonthlyReporting() {
        this.showLoading = true;
        var monthly_reporting_date = moment(this.next_reporting_peroid).format('MMM DD, YYYY');
        this.loadingMessage['message'] = LoadingMessage.START_REPORT + monthly_reporting_date;

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

                        // #brad: don't move forward until the monthly report has been created
                        if (this.common.checkAccountSyncType(type)) {
                            this.showLoading = false;
                            this.router.navigate([NavigateToScreen.coa_match, this.companyAccountingType.toLowerCase()]);
                        } else if (type == AppConstants.QBD_ACCOUNT_TYPE) {
                            // make a call to quick book desktop app
                            this.showLoading = false;
                            this.router.navigate([NavigateToScreen.qbd]);
                        } else if (type == AppConstants.CSV_ACCOUNT_TYPE) {
                            // this.company_service.putCompany({ accounting_type: 'Sage' }).subscribe(response => {
                            // Redirect to the CSV
                            this.showLoading = false;
                            this.router.navigate([NavigateToScreen.csv]);
                            // })
                        } else if (type == AppConstants.MANUAL_ACCOUNT_TYPE) {
                            // Redirect to the manual
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
            });
    }

    continueMonthlyReporting() {
        this.showLoading = true;
        var monthly_reporting_date = moment(this.next_reporting_peroid).format('MMM DD, YYYY');
        this.loadingMessage['message'] = LoadingMessage.CONTINUE_REPORT + monthly_reporting_date;
        this.company_service.getCompanyMetadata()
            .then(
            meta => {
                this.appComponent.session_warning();
                // refresh localStorage version of meta and store from the result of response
                localStorage.setItem('company_meta', JSON.stringify(meta.result));
                var type = meta.result.monthly_reporting_sync_method;
                var path = [meta.result.last_page];
                this.common.debuglog('redirecting to path '+path);
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
                    // Redirect to the CSV
                    this.showLoading = false;
                    this.router.navigate(path);
                    // })
                } else if (type == AppConstants.MANUAL_ACCOUNT_TYPE) {
                    // Redirect to the manual
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
        this.username = this.common.getUserName();
        this.companyName = this.common.getCompanyName();
        this.common.disableBrowseBackButton();
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


