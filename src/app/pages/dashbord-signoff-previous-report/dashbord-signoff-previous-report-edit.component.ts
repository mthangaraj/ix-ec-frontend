import {Component, ElementRef, OnInit, Pipe, PipeTransform} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {SignoffService} from './../../services';
import {AuthService} from './../../services/auth.service';
import {CompanyService} from './../../services';
import {CommonService} from "../../services";
import { ReportingService } from './../../services';
import {environment} from './../../../environments/environment';
import { NumberFormatPipe } from "../../pipes/numbers.pipe";
import * as moment from 'moment';
import { CurrencyPipe } from '@angular/common';
import { DecimalPipe } from '@angular/common';
import { ReportingComponent } from '../reporting/reporting.component';
import {AppConstants, ErrorCodes, ErrorMessage, LoadingMessage, NavigateToScreen} from '../../app.constants';
import {ScrollEvent} from "ngx-scroll-event";
import {BsDatepickerConfig} from 'ngx-bootstrap/datepicker';
import {AppComponent} from '../../app.component';
import {Observable} from "rxjs/Rx";
import {isNullOrUndefined} from "util";

@Component({
    selector: 'app-dashbord-signoff-previous-report-edit',
    templateUrl: './dashbord-signoff-previous-report-edit.component.html',
    styleUrls: ['./dashbord-signoff-previous-report.component.css'],
    providers: [ CompanyService, AuthService, ReportingService, SignoffService ]
})

export class DashbordSignoffPreviousReportEditComponent implements OnInit {
    date;
    income_statement: any = [];
    showLoading: boolean = true;
    showContact: boolean = true;
    balance_sheet: any[];
    balance_sheet_liab: any[]; // ...ilities temporary until phase 2 refactor. #brad #todo
    balance_sheet_ass: any[];  // ...ets :) temporary until phase 2 refactor. #brad
    form_changed: boolean;
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

    public setDefaultValue: string = parseFloat('0').toFixed(2);
    public balancesheet: any = [];
    public bscollection: any = [];
    public bsdata:any = {};
    public incomestatement: any = {};
    public iscollection:any = [];
    public isdata:any = {}
    public session: any;
    public class:string = "";
    public reportview:boolean = false;

    constructor(private signoff_service: SignoffService,
                private route: ActivatedRoute,
                private reporting_service: ReportingService,
                private company_service: CompanyService,
                private auth_servcie: AuthService, private router: Router,
                private common: CommonService,
                private elRef: ElementRef,
                private _bsDatepickerConfig: BsDatepickerConfig,
                private appComponent: AppComponent,
                private formatter: NumberFormatPipe) {
        this.username = this.common.getUserName();
        this.companyName = this.common.getCompanyName();
        this.loadingMessage = {
            'message':'',
            'error':''
        };
        this._bsDatepickerConfig.dateInputFormat = AppConstants.DATE_FORMAT;

        this.bsdata["TotalCurrentAssets"] = this.setDefaultValue;
        this.bsdata["TotalAssets"] = this.setDefaultValue;
        this.bsdata["TotalCurrentLiabilities"] =  this.setDefaultValue;
        this.bsdata["TotalLiabilities"] = this.setDefaultValue;
        this.bsdata["TotalEquity"] = this.setDefaultValue;
        this.bsdata["TotalLiabilityAndEquity"] = this.setDefaultValue;
        this.bsdata["Cash"] = this.setDefaultValue;
        this.bsdata["AccountReceivables"] = this.setDefaultValue;
        this.bsdata["SREDReceivable"] = this.setDefaultValue;
        this.bsdata["OtherCurrentAssets"] = this.setDefaultValue;
        this.bsdata["FixedAssets"] = this.setDefaultValue;
        this.bsdata["PatentsAndIntangibleAssets"] = this.setDefaultValue;
        this.bsdata["OtherAssets"] = this.setDefaultValue;
        this.bsdata["AccountsPayableAndAccruedLiabilities"] = this.setDefaultValue;
        this.bsdata["BankDebt"] = this.setDefaultValue;
        this.bsdata["OtherCurrentLiabilities"] = this.setDefaultValue;
        this.bsdata["EspressoDebtOutstanding"] = this.setDefaultValue;
        this.bsdata["SeniorSecuredDebt"] = this.setDefaultValue;
        this.bsdata["SubordinatedDebt"] = this.setDefaultValue;
        this.bsdata["ShareholderLoans"] = this.setDefaultValue;
        this.bsdata["DeferredRevenue"] = this.setDefaultValue;
        this.bsdata["OtherLiabilities"] = this.setDefaultValue;
        this.bsdata["ShareAndContributedCapital"] = this.setDefaultValue;
        this.bsdata["MinorityEquityPosition"] = this.setDefaultValue;
        this.bsdata["EquityPositionOfLTDebt"] = this.setDefaultValue;
        this.bsdata["RetainedEarningsLoss"] = this.setDefaultValue;
        this.bsdata["NetIncomeYTD"] = this.setDefaultValue;

        this.bscollection.push({"data":this.bsdata});

        this.balancesheet = this.bscollection[0];

        // Income statement ladger
        this.isdata["Ebitda"] = this.setDefaultValue;
        this.isdata["NetIncome"] = this.setDefaultValue;
        this.isdata["TotalRevenue"] =  this.setDefaultValue;
        this.isdata["GrossProfit"] = this.setDefaultValue;
        this.isdata["NonRecurringRevenues"] = this.setDefaultValue;
        this.isdata["RecurringRevenues"] = this.setDefaultValue;
        this.isdata["CostOfGoodsSold"] = this.setDefaultValue;
        this.isdata["SalesAndMarketingExpenses"] = this.setDefaultValue;
        this.isdata["RDGrossMinusExcludingSRED"] = this.setDefaultValue;
        this.isdata["GA"] = this.setDefaultValue;
        this.isdata["InterestIncomeExpense"] = this.setDefaultValue;
        this.isdata["SREDAccrual"] = this.setDefaultValue;
        this.isdata["IRAPGrantsReceived"] = this.setDefaultValue;
        this.isdata["DepreciationAndAmortization"] = this.setDefaultValue;
        this.isdata["OtherIncomeExpenses"] = this.setDefaultValue;

        this.iscollection.push({"data":this.isdata});

        this.incomestatement = this.iscollection[0];

        this.session = Observable.interval(1000 * 60 * AppConstants.DATA_INTERVAL).subscribe(x => {
            if (this.form_changed) {
                this.submit();
                this.form_changed = false;
            }
        });


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

                    if(this.monthly_reporting_sync_method == AppConstants.MANUAL_ACCOUNT_TYPE
                        || this.monthly_reporting_sync_method == AppConstants.CSV_ACCOUNT_TYPE){
                        this.class = "entry-form";
                        this.reportview = true;
                    }

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

                  for(var i = 0; i < this.income_statement.length; i++) {
                  //this.income_statement.forEach((element) => {
                        if (this.income_statement[i].fse_tag.name == 'net_income') {
                        this.negative_collection += this.income_statement[i].fse_tag.formula.match(/[\w]+/g);
                        }

                        let all_sight_name = this.income_statement[i].fse_tag.all_sight_name;
                        let value =  this.formatter.transform(this.income_statement[i].data[all_sight_name]);
                        this.incomestatement.data[all_sight_name] = value;
                  };
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
                        let all_sight_name = this.balance_sheet[i].fse_tag.all_sight_name;
                        let value =  this.formatter.transform(this.balance_sheet[i].data[all_sight_name]);
                        this.balancesheet.data[all_sight_name] = value;

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
                if(isNullOrUndefined(type)){
                    this.showLoading = false;
                    this.appComponent.addToast('error', 'Error',ErrorMessage.NO_SYNC_SETUP);
                    return;
                }
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

    goBack() {
        this.router.navigate([NavigateToScreen.dashboard_signoff_prev_report, this.dateParam]);
    }

    formChanged() {
        this.form_changed = true;
    }

    /**
     * overall calculations performed
     */
    convertStrToFloat(value){
       if(Number.isNaN(value) || value == 0){
            value = 0;
       }
       return parseFloat(value);
    }
    getTotalCurrentassets() {
        this.balancesheet.data['TotalCurrentAssets'] =
            this.convertStrToFloat((this.convertStrToFloat(this.balancesheet.data['Cash']) +
                this.convertStrToFloat(this.balancesheet.data['AccountReceivables']) +
                this.convertStrToFloat(this.balancesheet.data['SREDReceivable']) +
                this.convertStrToFloat(this.balancesheet.data['OtherCurrentAssets']))).toFixed(2);

        this.balancesheet.data['TotalAssets'] =
            this.convertStrToFloat((this.convertStrToFloat(this.balancesheet.data['TotalCurrentAssets']) +
                this.convertStrToFloat(this.balancesheet.data['PatentsAndIntangibleAssets']) +
                this.convertStrToFloat(this.balancesheet.data['FixedAssets']) +
                this.convertStrToFloat(this.balancesheet.data['OtherAssets']))).toFixed(2);
    }

    getTotalAssets() {
        this.balancesheet.data['TotalAssets'] =
            this.convertStrToFloat((this.convertStrToFloat(this.balancesheet.data['TotalCurrentAssets']) +
                this.convertStrToFloat(this.balancesheet.data['PatentsAndIntangibleAssets']) +
                this.convertStrToFloat(this.balancesheet.data['FixedAssets']) +
                this.convertStrToFloat(this.balancesheet.data['OtherAssets']))).toFixed(2);
    }

    getTotalCurrentLiabilities() {
        this.balancesheet.data['TotalCurrentLiabilities'] =
            this.convertStrToFloat((this.convertStrToFloat(this.balancesheet.data['AccountsPayableAndAccruedLiabilities']) +
                this.convertStrToFloat(this.balancesheet.data['BankDebt']) +
                this.convertStrToFloat(this.balancesheet.data['OtherCurrentLiabilities']) +
                this.convertStrToFloat(this.balancesheet.data['DeferredRevenue']))).toFixed(2);

        this.balancesheet.data['TotalLiabilities'] =
            this.convertStrToFloat((this.convertStrToFloat(this.balancesheet.data['TotalCurrentLiabilities']) +
                this.convertStrToFloat(this.balancesheet.data['EspressoDebtOutstanding']) +
                this.convertStrToFloat(this.balancesheet.data['SeniorSecuredDebt']) +
                this.convertStrToFloat(this.balancesheet.data['SubordinatedDebt']) +
                this.convertStrToFloat(this.balancesheet.data['ShareholderLoans']) +
                this.convertStrToFloat(this.balancesheet.data['OtherLiabilities']))).toFixed(2);

        this.balancesheet.data['TotalLiabilityAndEquity'] =
            this.convertStrToFloat((this.convertStrToFloat(this.balancesheet.data['TotalEquity']) +
                this.convertStrToFloat(this.balancesheet.data['TotalLiabilities']))).toFixed(2);
    }

    getTotalLiabilities() {
        this.balancesheet.data['TotalLiabilities'] =
            this.convertStrToFloat((this.convertStrToFloat(this.balancesheet.data['TotalCurrentLiabilities']) +
                this.convertStrToFloat(this.balancesheet.data['EspressoDebtOutstanding']) +
                this.convertStrToFloat(this.balancesheet.data['SeniorSecuredDebt']) +
                this.convertStrToFloat(this.balancesheet.data['SubordinatedDebt']) +
                this.convertStrToFloat(this.balancesheet.data['ShareholderLoans']) +
                this.convertStrToFloat(this.balancesheet.data['OtherLiabilities']))).toFixed(2);

        this.balancesheet.data['TotalLiabilityAndEquity'] =
            this.convertStrToFloat((this.convertStrToFloat(this.balancesheet.data['TotalEquity']) +
                this.convertStrToFloat(this.balancesheet.data['TotalLiabilities']))).toFixed(2);
    }

    getTotalEquity() {
        this.balancesheet.data['TotalEquity'] =
            this.convertStrToFloat((this.convertStrToFloat(this.balancesheet.data['ShareAndContributedCapital']) +
                this.convertStrToFloat(this.balancesheet.data['MinorityEquityPosition']) +
                this.convertStrToFloat(this.balancesheet.data['EquityPositionOfLTDebt']) +
                this.convertStrToFloat(this.balancesheet.data['RetainedEarningsLoss']) +
                this.convertStrToFloat(this.balancesheet.data['NetIncomeYTD']))).toFixed(2);

        this.balancesheet.data['TotalLiabilityAndEquity'] =
            this.convertStrToFloat((this.convertStrToFloat(this.balancesheet.data['TotalEquity']) +
                this.convertStrToFloat(this.balancesheet.data['TotalLiabilities']))).toFixed(2);
    }

    getTotalRevenue() {
        this.incomestatement.data['TotalRevenue'] =
            this.convertStrToFloat((this.convertStrToFloat(this.incomestatement.data['NonRecurringRevenues']) +
                this.convertStrToFloat(this.incomestatement.data['RecurringRevenues']))).toFixed(2);

        this.incomestatement.data['GrossProfit'] =
            this.convertStrToFloat((this.convertStrToFloat(this.incomestatement.data['TotalRevenue']) -
                this.convertStrToFloat(this.incomestatement.data['CostOfGoodsSold']))).toFixed(2);

        this.incomestatement.data['Ebitda'] =
            this.convertStrToFloat((this.convertStrToFloat(this.incomestatement.data['GrossProfit']) -
                (this.convertStrToFloat(this.incomestatement.data['SalesAndMarketingExpenses']) +
                    this.convertStrToFloat(this.incomestatement.data['RDGrossMinusExcludingSRED']) +
                    this.convertStrToFloat(this.incomestatement.data['GA'])))).toFixed(2);

        this.incomestatement.data['NetIncome'] =
            this.convertStrToFloat((this.convertStrToFloat(this.incomestatement.data['Ebitda']) +
                this.convertStrToFloat(this.incomestatement.data['InterestIncomeExpense']) +
                this.convertStrToFloat(this.incomestatement.data['SREDAccrual']) +
                this.convertStrToFloat(this.incomestatement.data['IRAPGrantsReceived']) +
                this.convertStrToFloat(this.incomestatement.data['DepreciationAndAmortization']) +
                this.convertStrToFloat(this.incomestatement.data['OtherIncomeExpenses']))).toFixed(2);
    }

    getGrossProfit() {
        this.incomestatement.data['GrossProfit'] =
            this.convertStrToFloat((this.convertStrToFloat(this.incomestatement.data['TotalRevenue']) -
                this.convertStrToFloat(this.incomestatement.data['CostOfGoodsSold']))).toFixed(2);

        this.incomestatement.data['Ebitda'] =
            this.convertStrToFloat((this.convertStrToFloat(this.incomestatement.data['GrossProfit']) -
                (this.convertStrToFloat(this.incomestatement.data['SalesAndMarketingExpenses']) +
                    this.convertStrToFloat(this.incomestatement.data['RDGrossMinusExcludingSRED']) +
                    this.convertStrToFloat(this.incomestatement.data['GA'])))).toFixed(2);

        this.incomestatement.data['NetIncome'] =
            this.convertStrToFloat((this.convertStrToFloat(this.incomestatement.data['Ebitda']) +
                this.convertStrToFloat(this.incomestatement.data['InterestIncomeExpense']) +
                this.convertStrToFloat(this.incomestatement.data['SREDAccrual']) +
                this.convertStrToFloat(this.incomestatement.data['IRAPGrantsReceived']) +
                this.convertStrToFloat(this.incomestatement.data['DepreciationAndAmortization']) +
                this.convertStrToFloat(this.incomestatement.data['OtherIncomeExpenses']))).toFixed(2);
    }

    getEbitda() {
        this.incomestatement.data['Ebitda'] =
            this.convertStrToFloat((this.convertStrToFloat(this.incomestatement.data['GrossProfit']) -
                (this.convertStrToFloat(this.incomestatement.data['SalesAndMarketingExpenses']) +
                    this.convertStrToFloat(this.incomestatement.data['RDGrossMinusExcludingSRED']) +
                    this.convertStrToFloat(this.incomestatement.data['GA'])))).toFixed(2);

        this.incomestatement.data['NetIncome'] =
            this.convertStrToFloat((this.convertStrToFloat(this.incomestatement.data['Ebitda']) +
                this.convertStrToFloat(this.incomestatement.data['InterestIncomeExpense']) +
                this.convertStrToFloat(this.incomestatement.data['SREDAccrual']) +
                this.convertStrToFloat(this.incomestatement.data['IRAPGrantsReceived']) +
                this.convertStrToFloat(this.incomestatement.data['DepreciationAndAmortization']) +
                this.convertStrToFloat(this.incomestatement.data['OtherIncomeExpenses']))).toFixed(2);
    }

    getNetIncome() {
        this.incomestatement.data['NetIncome'] =
            this.convertStrToFloat((this.convertStrToFloat(this.incomestatement.data['Ebitda']) +
                this.convertStrToFloat(this.incomestatement.data['InterestIncomeExpense']) +
                this.convertStrToFloat(this.incomestatement.data['SREDAccrual']) +
                this.convertStrToFloat(this.incomestatement.data['IRAPGrantsReceived']) +
                this.convertStrToFloat(this.incomestatement.data['DepreciationAndAmortization']) +
                this.convertStrToFloat(this.incomestatement.data['OtherIncomeExpenses']))).toFixed(2);
    }

    /**
     * submit form entry IncomeStatement and BalanceSheet details
     */
    submitForm() {
      this.getTotalAssets();
      this.getTotalEquity();
      if (this.balancesheet.data['TotalAssets'] !== this.balancesheet.data['TotalLiabilityAndEquity']) {
        this.appComponent.addToast('error', 'Error', ErrorMessage.DEBIT_CREDIT_UNEQUAL);
        return false;
      }
      this.showLoading = true;
      var balancesheet = {
        "BalanceSheet": [this.balancesheet]
      }

      var incomestatement = {
        "IncomeStatement": [this.incomestatement]
      }

      this.common.debuglog('A BALANCE SHEET sheet is ');
      this.common.debuglog(JSON.stringify(balancesheet));

      let data = {
        "Balancesheet": this.balancesheet,
        "Incomestatement": this.incomestatement,
        "Answers": this.questions
      };

        var curr_period = moment(this.date);
        var yearmonth = curr_period.format('YYYY-MM');

      this.reporting_service.updatePreviousReports(data, this.date)
        .then((data) => {
          this.showLoading = false;
          this.router.navigate([NavigateToScreen.dashboard_signoff_prev_report,yearmonth])
          this.appComponent.addToast('success','',LoadingMessage.SAVE_CHANGES_SUCCESS);

        }).catch((error) => {
          this.showLoading = false;
        console.log(error);
      })
    }



    submit() {
        /*this.signoff_service.postForSigningOff(this.signoff_by)
            .then(data => {
                this.appComponent.addToast('success', '', LoadingMessage.CHANGE_SAVED_TEXT);
            })
            .catch((error) => {
                let errBody = JSON.parse(error._body);
                if (this.common.sessionCheck(errBody.code)) {
                    this.appComponent.session_warning();
                    this.loadingMessage['message'] = LoadingMessage.SIGNING_OFF;
                    this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
                }
            });*/
    }

    show_text_area(i, val) {
        let text = 0;
        if (this.questions[i].answer_data_type === 'boolean') {
            document.getElementById("answer_"+this.questions[i].id+"_yes").classList.remove("radio-required-field");
            document.getElementById("answer_"+this.questions[i].id+"_no").classList.remove("radio-required-field");

            if (this.questions[i + 1].answer_data_type === 'varchar(511)' || this.questions[i + 1].answer_data_type === 'varchar(255)') {
                this.text_short_tag = this.questions[i + 1].short_tag;
                this.quest = this.questions[i + 1].question_text.split(' ');
                text = this.quest[1].substring(0, this.quest[1].length - 1);
            }
            let ans = val.toLowerCase();
            if (ans === text) {
                this.show[i + 1] = true;
            } else {
                this.show[i + 1] = false;
            }
        }
    }

}
