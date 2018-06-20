import {Component, ElementRef, OnInit, Pipe, PipeTransform} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {SignoffService} from './../../services';
import {AuthService} from './../../services/auth.service';
import {CompanyService} from './../../services';
import {CommonService} from "../../services";
import { ReportingService } from './../../services';
import {environment} from './../../../environments/environment';
import * as moment from 'moment';
import { CurrencyPipe } from '@angular/common';
import { DecimalPipe } from '@angular/common';
import { ReportingComponent } from '../reporting/reporting.component';
import {AppConstants, ErrorCodes, ErrorMessage, LoadingMessage, NavigateToScreen} from '../../app.constants';
import {ScrollEvent} from "ngx-scroll-event";
import {BsDatepickerConfig} from 'ngx-bootstrap/datepicker';
import {AppComponent} from '../../app.component';
import {isNullOrUndefined} from "util";

@Component({
    selector: 'app-dashbord-signoff-previous-report',
    templateUrl: './dashbord-signoff-previous-report.component.html',
    styleUrls: ['./dashbord-signoff-previous-report.component.css'],
    providers: [ CompanyService, AuthService, ReportingService, SignoffService ]
})

export class DashbordSignoffPreviousReportComponent implements OnInit {
    date;
    income_statement: any = [];
    showLoading: boolean = true;
    showContact: boolean = true;
    balance_sheet: any[];
    balance_sheet_liab: any[]; // ...ilities temporary until phase 2 refactor. #brad #todo
    balance_sheet_ass: any[];  // ...ets :) temporary until phase 2 refactor. #brad
    currentMonth;
    dateParam;
    next_reporting_peroid;
    next_reporting_due: boolean = false;
    monthly_reporting_sync_method;
    reporting_in_progress: boolean = false;
    current_reporting_period;
    show_in_progress_msg = false;
    username;
    companyName;
    questions: any = [];

    loadingMessage:any;
    quest: any = [];
    text_disp: any = [];
    show: boolean[] = [];
    text_short_tag: any ;
    negative_collection: any;
    constructor(private signoff_service: SignoffService,
                private route: ActivatedRoute,
                private reporting_service: ReportingService,
                private company_service: CompanyService,
                private auth_servcie: AuthService, private router: Router,
                private common: CommonService,
                private elRef: ElementRef,
                private _bsDatepickerConfig: BsDatepickerConfig,
                private appComponent: AppComponent) {
        this.username = this.common.getUserName();
        this.companyName = this.common.getCompanyName();
        this.loadingMessage = {
            'message':'',
            'error':''
        };
        this._bsDatepickerConfig.dateInputFormat = AppConstants.DATE_FORMAT;


        // get date param from route
        this.route.params.subscribe(params => {
            this.dateParam = params.date;
        });

        //let params = {last_page: '/dashboard-signoff-prev-report/' + this.dateParam};
        //api call to set the metdata  last page
        this.company_service.getCompanyMetadata().then(
            data => {
                if(data.status == AppConstants.SUCCESS_RESPONSE) {
                    this.appComponent.session_warning();
                    this.next_reporting_peroid = data.result.monthly_reporting_next_period;
                    this.monthly_reporting_sync_method = data.result.monthly_reporting_sync_method;

                    this.current_reporting_period = data.result.monthly_reporting_current_period;

                    /*
                    // #brad: we may not need a reporting in progress screen because the app always
                    //        takes you back to where you left off, so if it was in the middle of a reporting
                    //        you'll continue automatically the next time you login. In this version of the portal, this behaviour is good.
                    */
                    if (data.monthly_reporting_current_period_status == AppConstants.SETUP_STATUS_IN_PROGRESS) {
                        this.reporting_in_progress = true;
                    }
                    else {
                        // Compare next_reportin_period with today's date
                        // #brad #todo: this should think that reporting is in progress as well.
                        var report_due_date = new Date(this.next_reporting_peroid);
                        var todays_date = new Date();
                        if (report_due_date < todays_date) {
                            this.next_reporting_due = true;
                        }
                    }

                    // if the user tries to access the report summary of a month that is in progress, show an in progress message instead of the data.
                    if (moment(this.dateParam).endOf('month').isSame(moment(this.current_reporting_period).endOf('month')) && this.reporting_in_progress) {
                        this.common.debuglog('show in progress');
                        this.show_in_progress_msg = true;
                    }
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

        this.common.debuglog('date param '+this.dateParam);
        // #todo: this.date, this.dateParams should be consolidated into this.period
        this.date = moment(this.dateParam).endOf('month').format('YYYY-MM-DD');
        this.common.debuglog('date '+this.date);
        this.currentMonth = moment(this.dateParam).format('MMM. YYYY');

        // get answers from last month and prepopulate for user convenience, answers typically don't change too much from month to month
        this.reporting_service.getMonthlyReportAnswersByPeriod(this.date)
            .then(data => {
                this.appComponent.session_warning();
                console.log(data.message);
                if (data.message) {
                    this.questions = [];
                }
                else {
                    this.questions = data.result;
                    // for question type enum, we split the string by '|' and convert it into array
                    for (var i = 0; i < this.questions.length; i++) {
                        if (this.questions[i].answer_data_type == 'enum') {
                            var result = this.questions[i].answer_validation_regex.split('|');
                            this.questions[i].enumvalues = result;
                        }
                        // if answer is null set this as default value
                        if (this.questions[i].answer == null) {
                            this.questions[i].answer = {
                                "id": '',
                                "answer": null
                            }
                        }
                        let j = 0;
                        if (this.questions[i].answer_data_type === 'boolean') {
                            if (this.questions[i + 1].answer_data_type === 'varchar(511)' || this.questions[i + 1].answer_data_type === 'varchar(255)') {
                                this.text_short_tag = this.questions[i + 1].short_tag;
                                this.quest = this.questions[i + 1].question_text.split(' ');
                                this.text_disp[j] = this.quest[1].substring(0, this.quest[1].length - 1);
                            }
                            if (this.questions[i].answer.answer) {
                                let ans = this.questions[i].answer.answer.toLowerCase();
                                if (ans === this.text_disp[j]) {
                                    j = j + 1;
                                    this.show[i + 1] = true;
                                }else {
                                    this.show[i + 1] = false;
                                }
                            }else {
                                this.show[i + 1] = false;
                            }
                        }
                        // setting date format for date picker
                        if (this.questions[i].answer_data_type == 'date') {
                            var monthNames = [
                                "January", "February", "March",
                                "April", "May", "June", "July",
                                "August", "September", "October",
                                "November", "December"
                            ];
                            if (this.questions[i].answer.answer) {
                                var d = new Date(this.questions[i].answer.answer);
                                var day = d.getDate();
                                var monthIndex = d.getMonth();
                                var year = d.getFullYear();

                                var gotdate = monthNames[monthIndex] + ' ' + day + ',' + ' ' + year;
                                this.questions[i].answer.answer = gotdate;
                            }else {
                                this.questions[i].answer.answer = '';
                            }
                        }
                    }
                }
            })
            .catch((error) => {
                let errBody = JSON.parse(error._body);
                if (this.common.sessionCheck(errBody.code)) {
                    this.appComponent.session_warning();
                        this.loadingMessage['message'] = LoadingMessage.GET_MONTHLY_REPORT_ANSWERS_BY_PERIOD;
                        this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
                    }
            });

        // get income and balance sheet by particular date
        this.signoff_service.getIncomeCetificateForParticularMonth(this.date)
            .then(data => {
                this.appComponent.session_warning();
                if (data.message) {
                    this.income_statement = [];
                } else {

                    this.income_statement = data.result.sort(function(a, b) {
                                                        if(a.fse_tag.sort_order == b.fse_tag.sort_order)
                                                            return 0;
                                                        if(a.fse_tag.sort_order < b.fse_tag.sort_order)
                                                            return -1;
                                                        if(a.fse_tag.sort_order > b.fse_tag.sort_order)
                                                            return 1;
                                                    });
                  this.income_statement.forEach((element) => {
                    if (element.fse_tag.name == 'net_income') {
                      this.negative_collection += element.fse_tag.formula.match(/[\w]+/g);
                    }
                  });


                }
            })
            .catch((error) => {
                let errBody = JSON.parse(error._body);
                if (this.common.sessionCheck(errBody.code)) {
                    this.appComponent.session_warning();
                        this.loadingMessage['message'] = LoadingMessage.INCOME_CERTIFICATE_FOR_PARTICULAR_MONTH;
                        this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
                    }
            });

        this.signoff_service.getBalanceSheetForParticularMonth(this.date)
            .then(data => {
                this.appComponent.session_warning();
                if (data.message) {
                    this.showLoading = false;
                    this.balance_sheet = [];
                } else {
                    this.balance_sheet = data.result.sort(function(a,b) {
                                                    if(a.fse_tag.sort_order == b.fse_tag.sort_order)
                                                        return 0;
                                                    if(a.fse_tag.sort_order < b.fse_tag.sort_order)
                                                        return -1;
                                                    if(a.fse_tag.sort_order > b.fse_tag.sort_order)
                                                        return 1;
                                                });

                    // split up the balance sheet into assets and liabilities to match the fin overview
                    var active_array = [];
                    var active_index = 0;
                    for(var i = 0; i < this.balance_sheet.length; i++) {
                        active_array[active_index] = this.balance_sheet[i];

                        if(this.balance_sheet[i].fse_tag.name == 'asset_total') {
                            this.balance_sheet_ass = active_array;
                            active_array = [];
                            active_index = 0;
                            continue;
                        }

                        active_index++;
                    }

                    this.balance_sheet_liab = active_array;
                    this.showLoading = false;
                }
            })
            .catch((error) => {
                let errBody = JSON.parse(error._body);
                if (this.common.sessionCheck(errBody.code)) {
                    this.appComponent.session_warning();
                        this.loadingMessage['message'] = LoadingMessage.BALANCE_SHEET_CERTIFICATE_FOR_PARTICULAR_MONTH;
                        this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
                    }
            });
    }

    // Triggers the beginning of a monthly reporting
    startMonthlyReporting() {
        this.showLoading = true;
        // #brad: last_page isn't sync, monthly_reporting_sync_method will already be set, so need to remove this after testing.
        /*let params = {
            monthly_reporting_sync_method: type,
            last_page: '/sync'
        };

        var type = this.monthly_reporting_sync_method;*/

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
                            // Redirect to the quick books link
                            window.location.href = environment.api.url + NavigateToScreen.qbo + localStorage.getItem('company');
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
                    })
                .catch((error) => {
                    let errBody = JSON.parse(error._body);
                    if (this.common.sessionCheck(errBody.code)) {
                        this.appComponent.session_warning();
                            this.loadingMessage['message'] = LoadingMessage.GET_COMPANY_META;
                            this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
                        }
                });
                })
        .catch((error) => {
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
        this.company_service.getCompanyMetadata()
            .then(
            meta => {
                this.appComponent.session_warning();
                // refresh localStorage version of metaand store from the result of response
                localStorage.setItem('company_meta', JSON.stringify(meta.result));
                var type = meta.result.monthly_reporting_sync_method;
                var path = [meta.result.last_page];
                this.common.debuglog('redirecting to path '+path);
                // #brad: don't move forward until the monthly report has been created
                if (this.common.checkAccountSyncType(type)) {
                    this.showLoading = false;
                    this.router.navigate(path);
                } else if (type == AppConstants.QBD_ACCOUNT_TYPE) {
                    //make a call to quick book desktop app
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
        this.common.disableBrowseBackButton();
    }

    /*
    * Hide the contact us dropdown while scrolling event.
     */
    handleScroll(event: ScrollEvent) {
        let elements = this.elRef.nativeElement.querySelector('#contact-us');
        if (elements.classList.contains('open')) {
          elements.classList.remove("open");
        }
    }

    /**
     * logout and clear local storage
     */
    logOut() {
        this.appComponent.reset();
        this.auth_servcie.logout();
        this.router.navigate(['/']);
    }
    /**
     * go Back to dashboard previous report
     */
    goBack() {
        //this.router.navigate([NavigateToScreen.dashboard_previous_report, this.dateParam]);
        this.router.navigate([NavigateToScreen.dashboard_previous_report]);
    }

}
