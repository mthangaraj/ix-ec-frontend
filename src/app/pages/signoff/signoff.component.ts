import {Component, ElementRef, OnDestroy, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {SignoffService, CompanyService, AuthService, ReportingService} from './../../services';
import * as moment from 'moment';
import { CurrencyPipe } from '@angular/common';
import { DecimalPipe } from '@angular/common';
import {AppConstants, ErrorCodes, ErrorMessage, LoadingMessage, NavigateToScreen} from '../../app.constants';
import {CommonService} from "../../services";
import {ScrollEvent} from "ngx-scroll-event";
import {BsDatepickerConfig} from 'ngx-bootstrap/datepicker';
import {AppComponent} from '../../app.component';
import {Observable} from 'rxjs/Rx';
import {isNullOrUndefined} from "util";
import * as jsPDF from 'jspdf';

@Component({
    selector: 'app-signoff',
    templateUrl: './signoff.component.html',
    styleUrls: ['./signoff.component.css'],
    providers: [ SignoffService, CompanyService, AuthService, ReportingService ]
})
export class SignoffComponent implements OnInit, OnDestroy {
    bsConfig: Partial<BsDatepickerConfig>;
    income_statement: any = [];
    balance_sheet: any = [];
    balance_sheet_liab: any[]; // ...ilities temporary until phase 2 refactor. #brad #todo
    balance_sheet_ass: any[];  // ...ets :) temporary until phase 2 refactor. #brad
    showLoading = true;
    showContact = true;
    date;
    today;
    type: string;
    signoff_by: any = [];
    questions: any = [];

    loadingMessage:any;
    quest: any = [];
    text_disp: any = [];
    show: boolean[] = [];
    text_short_tag: any ;
    session: any;
    form_changed: boolean;
    username;
    companyName;
    companyAccountingType;
    editEnabled = 1;
    negative_collection:any;
    constructor(private signoff_service: SignoffService,
                private reporting_service: ReportingService,
                private router: Router, private route: ActivatedRoute,
                private company_service: CompanyService,
                private auth_service: AuthService,
                private common: CommonService,
                private elRef: ElementRef,
                private appComponent: AppComponent) {
        this.username = this.common.getUserName();
        this.companyName = this.common.getCompanyName();
        this.companyAccountingType = this.common.getAccountingType();
        // get date param from route
        this.route.params.subscribe(params => {
            this.type = params.type;
        });
        // this.bsConfig = Object.assign({},{dateInputFormat:'YYYY-MM-DD'});
        this.session = Observable.interval(1000 * 60 * AppConstants.DATA_INTERVAL).subscribe(x => {
            if (this.form_changed) {
                this.submit();
                this.form_changed = false;
            }
        });
        this.loadingMessage = {
            'message':'',
            'error': ''
        }

        if(this.type === 'form-entry'){
          this.editEnabled = 0;
        }

        const params = {last_page: '/signoff/' + this.type};
        // api call to set the metdata  last page
        this.company_service.updateCompanyMetadata(params)
            .then(data => {
                this.appComponent.session_warning();
            })
            .catch((error) => {
                let errBody = JSON.parse(error._body);
                if (this.common.sessionCheck(errBody.code)) {
                    this.appComponent.session_warning();
                    this.loadingMessage['message'] = LoadingMessage.UPDATE_COMPANY_META;
                    this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
                }
            });

        // model to support signoff form
        this.signoff_by = {
            'signoff_by_name': '',
            'signoff_by_title': ''
        };

        const company_meta = JSON.parse(localStorage.getItem('company_meta'));
        this.date = moment(company_meta.monthly_reporting_current_period).format('YYYY-MM-DD');
        this.today = moment().format('MMMM Do, YYYY');

        this.reporting_service.getSignOffInfo(this.date)
            .then(data => {

                this.appComponent.session_warning();
                this.signoff_by.signoff_by_name = data.result.signoff_by_name;
                this.signoff_by.signoff_by_title = data.result.signoff_by_title;

            })
            .catch((error) => {
                let errBody = JSON.parse(error._body);
                if (this.common.sessionCheck(errBody.code)) {
                    this.appComponent.session_warning();
                    this.loadingMessage['message'] = LoadingMessage.SIGNING_OFF_INFO;
                    this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
                }
            });

        // get answers from last month and prepopulate for user convenience, answers typically don't change too much from month to month
        this.reporting_service.getMonthlyReportAnswersByPeriod(this.date)
            .then(data => {
                this.appComponent.session_warning();
                if (data.status == ErrorMessage.DATA_NOT_FOUND) {
                    this.questions = [];
                }
                else {
                    this.questions = data.result;
                    // for question type enum, we split the string by '|' and convert it into array
                    for (let i = 0; i < this.questions.length; i++) {
                        if (this.questions[i].answer_data_type == 'enum') {
                            const result = this.questions[i].answer_validation_regex.split('|');
                            this.questions[i].enumvalues = result;
                        }
                        // if answer is null set this as default value
                        if (this.questions[i].answer == null) {
                            this.questions[i].answer = {
                                'id': '',
                                'answer': null
                            };
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
                            const monthNames = [
                                'January', 'February', 'March',
                                'April', 'May', 'June', 'July',
                                'August', 'September', 'October',
                                'November', 'December'
                            ];
                            if (this.questions[i].answer.answer) {
                                const d = new Date(this.questions[i].answer.answer);
                                const day = d.getDate();
                                const monthIndex = d.getMonth();
                                const year = d.getFullYear();

                                const gotdate = monthNames[monthIndex] + ' ' + day + ',' + ' ' + year;
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

        // get income and balance sheet
        this.signoff_service.getIncomeCetificate()
            .then(data => {
                this.appComponent.session_warning();
                if (data.message == ErrorMessage.NO_DATA_CHANGES || data.message === ErrorMessage.DATA_NOT_FOUND) {
                    this.income_statement = [];
                }
                else {
                    this.income_statement = data.result.sort(function(a, b) {
                                                        if (a.fse_tag.sort_order == b.fse_tag.sort_order)
                                                            return 0;
                                                        if (a.fse_tag.sort_order < b.fse_tag.sort_order)
                                                            return -1;
                                                        if (a.fse_tag.sort_order > b.fse_tag.sort_order)
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
                    this.loadingMessage['message'] = LoadingMessage.GET_INCOME_STATEMENT;
                    this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
                }
        });

        this.signoff_service.getBalanceSheet()
            .then(data => {
                this.appComponent.session_warning();
                this.common.debuglog('########## SIGNOFF service balance sheet');
                if (data.message == ErrorMessage.NO_DATA_CHANGES || data.message === ErrorMessage.DATA_NOT_FOUND) {
                    this.balance_sheet = [];
                }
                else {
                    this.balance_sheet = data.result.sort(function(a, b) {
                                                    if (a.fse_tag.sort_order == b.fse_tag.sort_order)
                                                        return 0;
                                                    if (a.fse_tag.sort_order < b.fse_tag.sort_order)
                                                        return -1;
                                                    if (a.fse_tag.sort_order > b.fse_tag.sort_order)
                                                        return 1;
                                                });

                    // split up the balance sheet into assets and liabilities to match the fin overview
                    let active_array = [];
                    let active_index = 0;
                    for (let i = 0; i < this.balance_sheet.length; i++) {
                        active_array[active_index] = this.balance_sheet[i];

                        if (this.balance_sheet[i].fse_tag.name == 'asset_total') {
                            this.balance_sheet_ass = active_array;
                            active_array = [];
                            active_index = 0;
                            continue;
                        }

                        active_index++;
                    }

                    this.balance_sheet_liab = active_array;
                }
                this.showLoading = false;
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

    /*
    * Hide the contact us dropdown while scrolling event.
     */
    handleScroll(event: ScrollEvent) {
        let elements = this.elRef.nativeElement.querySelector('#contact-us');
        if(elements.classList.contains('open')){
          elements.classList.remove("open");
        }
    }

    /**
     * signoff post call
     */

    signOff() {

        if (this.signoff_by.signoff_by_name == '' || isNullOrUndefined(this.signoff_by.signoff_by_name)){
          let element = document.getElementById('name');
          element.classList.add('required-field');
          element.focus();
          this.appComponent.addToast('error', 'Error', ErrorMessage.SIGNOFF_NAME_EMPTY_VALIDATION);
          return ;
        }
        if (this.signoff_by.signoff_by_title == '' || isNullOrUndefined(this.signoff_by.signoff_by_title)){
          let element = document.getElementById('position');
          element.classList.add('required-field');
          element.focus();
          this.appComponent.addToast('error', 'Error', ErrorMessage.SIGNOFF_POSITION_EMPTY_VALIDATION);
          return ;
        }


        this.showLoading = true;
        this.form_changed = false;
        this.common.debuglog('signinf off with BY data: ' + JSON.stringify(this.signoff_by));
        this.signoff_service.postForSigningOff(this.signoff_by)
            .then(data => {
                this.router.navigate(['thanks']);
            })
            .catch((error) => {
                let errBody = JSON.parse(error._body);
                if (this.common.sessionCheck(errBody.code)) {
                    this.appComponent.session_warning();
                    this.loadingMessage['message'] = LoadingMessage.SIGNING_OFF;
                    this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
                }
            });
    }

    submit() {
        this.signoff_service.postForSigningOff(this.signoff_by)
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
            });
    }
    goBack() {
         this.router.navigate([NavigateToScreen.reporting, this.type]);
    }

    /**
     * Save Exit
     */
    saveExit() {
        const params = {last_page: '/signoff/' + this.type};
        //api call to set the metdata  last page
        this.company_service.updateCompanyMetadata(params)
            .then(
                data => {
                    this.submit();
                    this.appComponent.reset();
                    this.auth_service.logout();
                    this.router.navigate(['/']);
                }
            ).catch((error) => {
                let errBody = JSON.parse(error._body);
            if (this.common.sessionCheck(errBody.code)) {
                this.loadingMessage['message'] = LoadingMessage.SIGNING_OFF;
                this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
            }
            });
    }

    ngOnInit() {
        this.common.disableBrowseBackButton();
    }
    ngOnDestroy() {
        this.session.unsubscribe();
    }
    formChanged() {
        this.form_changed = true;
    }
  resetReports() {
    this.loadingMessage['message'] = '';
    this.showLoading = true;
    this.company_service.putCoAMap()
      .then(
        data => {
          if(data.status === AppConstants.SUCCESS_RESPONSE){
            this.company_service.getCompanyMetadata()
              .then(
                meta => {
                  this.appComponent.session_warning();
                  // refresh localStorage version of meta and store from the result of response
                  localStorage.setItem('company_meta', JSON.stringify(meta.result));
                  var type = meta.result.monthly_reporting_sync_method;
                  var path = [meta.result.last_page];
                  if(isNullOrUndefined(type)){
                    this.showLoading = false;
                    this.appComponent.addToast('error', 'Error',ErrorMessage.NO_SYNC_SETUP);
                    return;
                  }
                  this.common.debuglog(type);
                  this.common.debuglog(path);
                  this.common.debuglog('redirecting to path ' + path);
                  // #brad: don't move forward until the monthly report has been created
                  if (this.common.checkAccountSyncType(type)) {
                    this.showLoading = false;
                    this.router.navigate([NavigateToScreen.coa_match, this.companyAccountingType.toLowerCase()]);
                  } else if (type == AppConstants.QBD_ACCOUNT_TYPE) {
                    // make a call to quick book desktop app
                    this.showLoading = false;
                    this.router.navigate([NavigateToScreen.coa_match, NavigateToScreen.qbd]);
                  } else if (type == AppConstants.CSV_ACCOUNT_TYPE) {
                    // this.company_service.putCompany({ accounting_type: 'Sage' }).subscribe(response => {
                    // Redirect to the CSV
                    this.showLoading = false;
                    this.router.navigate([NavigateToScreen.coa_match, NavigateToScreen.upload]);
                    // })
                  } else if (type == AppConstants.MANUAL_ACCOUNT_TYPE) {
                    // Redirect to the manual
                    this.showLoading = false;
                    this.router.navigate([NavigateToScreen.reporting, NavigateToScreen.form_entry]);
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
        }
      )
      .catch((error) => {
        let errBody = JSON.parse(error._body);
        this.common.sessionCheck(errBody.code);
      });
  }

    downloadpdf(){
        var doc = new jsPDF();
        doc.text(20, 20, 'Hello world!');
        doc.text(20, 30, 'This is client-side Javascript, pumping out a PDF.');
        doc.addPage();
        doc.text(20, 20, 'Do you like that?');

        // Save the PDF
        doc.save('Test.pdf');
    };

}
