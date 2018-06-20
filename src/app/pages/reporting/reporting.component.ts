import {Component, ElementRef, OnDestroy, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {BsDatepickerConfig} from 'ngx-bootstrap/datepicker';

import {ReportingService} from './../../services';
import {CompanyService, AuthService} from './../../services';
import {AppConstants, ErrorCodes, ErrorMessage, LoadingMessage, NavigateToScreen} from '../../app.constants';
import {CommonService} from "../../services";
import {ScrollEvent} from "ngx-scroll-event";
import {AppComponent} from '../../app.component';
import {Observable} from 'rxjs/Rx';
import {isNullOrUndefined} from "util";

@Component({
  selector: 'app-reporting',
  templateUrl: './reporting.component.html',
  styleUrls: ['./reporting.component.css'],
  providers: [CompanyService, AuthService, ReportingService]
})
export class ReportingComponent implements OnInit, OnDestroy {
  questions: any = [];
  showLoading: boolean = true;
  showContact: boolean = true;
  type: string;
  bsConfig: Partial<BsDatepickerConfig>;
  report: any = [];
  company_meta;

  loadingMessage: any;
  username;
  companyName;
  companyAccountingType;
  quest: any = [];
  text_disp: any = [];
  show: boolean[] = [];
  text_short_tag: any;
  session: any;
  form_changed: boolean;
  params: any;
  maxdate: any;
  account_setup_status: any;

  constructor(private reporting_service: ReportingService,
              private router: Router,
              private route: ActivatedRoute,
              private company_service: CompanyService,
              private auth_service: AuthService,
              private common: CommonService,
              private elRef: ElementRef,
              private _bsDatepickerConfig: BsDatepickerConfig,
              private appComponent: AppComponent) {
    this.username = this.common.getUserName();
    this.companyName = this.common.getCompanyName();
    this.companyAccountingType = this.common.getAccountingType();
    this.maxdate = new Date();
    // get date param from route
    this.route.params.subscribe(params => {
      this.type = params.type;
    });
    this._bsDatepickerConfig.dateInputFormat = 'YYYY-MM-DD';
    //    this.bsConfig = Object.assign({},{dateInputFormat:'YYYY-MM-DD'});
    this.loadingMessage = {
      'message': '',
      'error': ''
    };
    let company = JSON.parse(localStorage.getItem('company_meta'));
    this.account_setup_status = company['accounting_setup_status'];
    this.session = Observable.interval(1000 * 60 * AppConstants.DATA_INTERVAL).subscribe(x => {
      if (this.form_changed) {
        this.submit();
        this.form_changed = false;
      }
    });

    if (this.type === 'form-entry' && this.account_setup_status == AppConstants.SETUP_STATUS_IN_PROGRESS) {
      this.params = {
        accounting_setup_status: AppConstants.SETUP_STATUS_ACCOUNTING_TYPE_CHOSEN,
        last_page: '/reporting/' + this.type
      };
    } else {
      this.params = {last_page: '/reporting/' + this.type};
    }

    // api call to set the metdata
    this.company_service.updateCompanyMetadata(this.params)
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


    this.company_meta = JSON.parse(localStorage.getItem('company_meta'));

    // check to see if report for current period exists. If it does, the user is returning to a Saved session, so we need to load their previous answers
    this.reporting_service.getMonthlyReportAnswersByPeriod(this.company_meta.monthly_reporting_current_period)
      .then(
        data => {
          this.appComponent.session_warning();
          // preload the data fo
          this.common.debuglog('got answers by period ' + this.company_meta.monthly_reporting_current_period);
          this.common.debuglog(data);
          //if (data.result) {

          //}
          //},
          if (data.message == ErrorMessage.DATA_NOT_FOUND) {
            // if there are no answers for the current period, then load the answers from the last period for convenience.
            // #todo: per a suggestion from one of our clients, prepopulating this makes it too easy to skip. Should provider
            //        some sort of read only or copy/paste version showing last months answers but still require that they be filled in.
            this.common.debuglog('no saved answers. Loading last months.');
            // get answers from last month and prepopulate for user convenience, answers typically don't change too much from month to month
            this.reporting_service.getLastMonthlyReportAnswers()
              .then(
                data => {
                  this.appComponent.session_warning();
                  if (data.message == ErrorMessage.DATA_NOT_FOUND) {
                    this.common.debuglog('### no question data found, need to ask for blank question list');
                    this.reporting_service.getQuestionListOnly()
                      .then(
                        data => {
                          this.prepareForDisplay(data.result);
                        }
                      )
                      .catch((error) => {
                        let errBody = JSON.parse(error._body);
                        if (this.common.sessionCheck(errBody.code)) {
                          this.loadingMessage['message'] = LoadingMessage.GET_QUESTION_LIST;
                          this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
                        }

                      });
                  } else {
                    if (data.status === "ERROR") {
                      this.questions = [];
                      this.showLoading = false;
                    } else {
                      this.prepareForDisplay(data.result);
                    }
                  }
                }
              )
              .catch((error) => {
                let errBody = JSON.parse(error._body);
                if (this.common.sessionCheck(errBody.code)) {
                  this.appComponent.session_warning();
                  this.loadingMessage['message'] = LoadingMessage.GET_LAST_MONTH_REPORT_ANSWER;
                  this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
                }
              });
          } else {
            this.prepareForDisplay(data.result);

          }
        }
      )
      .catch((error) => {
        let errBody = JSON.parse(error._body);
        if (this.common.sessionCheck(errBody.code)) {
          this.appComponent.session_warning();
          this.loadingMessage['message'] = LoadingMessage.GET_MONTHLY_REPORT_ANSWERS_BY_PERIOD;
          this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
        }
      });
  }

  goBack() {
    if (this.type == 'form-entry') {
      this.router.navigate([NavigateToScreen.form_entry]);
    } else {
      this.router.navigate([NavigateToScreen.coa_match_confimation, this.type]);
    }

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

  prepareForDisplay(data) {
    if(isNullOrUndefined(data)){
      this.questions = [];
    }
    else{
      this.questions = data;
    }
    this.formatQuestionsForDisplay();
    this.showLoading = false;
  }

  formatQuestionsForDisplay() {
    let j = 0;
    let k = 0;
    for (var i = 0; i < this.questions.length; i++) {
      if (this.questions[i].answer_data_type == 'enum') {
        var result = this.questions[i].answer_validation_regex.split('|');
        this.questions[i].enumvalues = result;
      }
      // if answer is null set this as default value
      if (this.questions[i].answer == null) {
        this.questions[i].answer = {
          'id': '',
          'answer': null
        };
      }
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
          } else {
            this.show[i + 1] = false;
          }
        } else {
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
        } else {
          this.questions[i].answer.answer = '';
        }
      }
    }
  }

  /**
   * submit reporting
   */
  submitReporting() {
    let is_valid = this.prepareReportData();
    if (!is_valid) {
      return;
    }
    this.showLoading = true;
    this.form_changed = false;


    // Post request to submit reporting answers
    this.reporting_service.postReportingAnswers(this.report)
      .then(data => {
        if (data.result.answer !== undefined) {
          this.showLoading = false;
        }
        else {
          this.showLoading = false;
          this.router.navigate(['signoff', this.type]);
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
  }

  submit() {
    let is_valid = this.prepareReportData();
    if (!is_valid) {
      return;
    }
    // Post request to submit reporting answers
    this.reporting_service.postReportingAnswers(this.report)
      .then(data => {
        this.appComponent.addToast('success', '', LoadingMessage.CHANGE_SAVED_TEXT);
      })
      .catch((error) => {
        let errBody = JSON.parse(error._body);
        if (this.common.sessionCheck(errBody.code)) {
          this.appComponent.session_warning();
          this.showLoading = true;
          this.loadingMessage['message'] = LoadingMessage.GET_MONTHLY_REPORT_ANSWERS_BY_PERIOD;
          this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
        }
      });
  }

  prepareReportData(skipValidation=false) {
    // creating an array param for post api
    //this.appComponent.addToast(this.questions[0].question_text);

    //return;

    for (var i = 0; i < this.questions.length; i++) {
      let nxt = i + 1;
      let prev = i - 1;
      if (i == 0) {
        prev = i;
      }

      if(!skipValidation) {
        if (this.questions[i].answer_data_type === 'boolean') {
          if (this.show[nxt] && !this.questions[nxt].answer.answer) {
            this.appComponent.addToast('error', 'Error', "Answer required: " + this.questions[nxt].question_text);
            var element = document.getElementById("child_answer_"+this.questions[nxt].id);
            element.classList.add("required-field");
            element.focus();
            return false;
          }

          if (!this.questions[i].answer.answer) {
            this.appComponent.addToast('error', 'Error', "Answer required: " + this.questions[i].question_text);
            var element_yes = document.getElementById("answer_"+this.questions[i].id+"_yes");
            var element_no = document.getElementById("answer_"+this.questions[i].id+"_no");
            element_yes.classList.add("radio-required-field");
            element_no.classList.add("radio-required-field");
            return false;
          }
        }
        if ((this.questions[i].answer_data_type == 'integer' || this.questions[i].answer_data_type == 'decimal')  && this.questions[i].answer.answer == null) {
          this.appComponent.addToast('error', 'Error', "Answer required: " + this.questions[i].question_text);
          let element = document.getElementById("answer_"+this.questions[i].id);
          element.classList.add("required-field");
          element.focus();
          return false;
        }
        const regex = /^(varchar\([0-9]+\))$/;
        if ((this.questions[i].answer_data_type.match(regex) && this.questions[i].answer_data_type !== 'varchar(255)' && this.questions[i].answer_data_type !== 'varchar(511)') && (this.questions[i].answer.answer == null || this.questions[i].answer.answer == '') ) {
          this.appComponent.addToast('error', 'Error', "Answer required: " + this.questions[i].question_text);
          let element = document.getElementById("answer_"+this.questions[i].id);
          element.classList.add("required-field");
          element.focus();
          return false;
        }

        if (this.questions[i].answer_data_type == 'enum' && this.questions[i].answer.answer == null) {

          this.appComponent.addToast('error', 'Error', "Answer required: " + this.questions[i].question_text);
          let element = document.getElementById("answer_"+this.questions[i].id+"_dropdown");

          element.classList.add("required-field");
          element.focus();
          return false;
        }

        if (this.questions[i].answer_data_type == 'date' && (this.questions[i].answer.answer == null || this.questions[i].answer.answer == '')) {

          this.appComponent.addToast('error', 'Error', "Answer required: " + this.questions[i].question_text);
          let element = document.getElementById("answer_"+this.questions[i].id+"_date");
          element.classList.add("required-field");
          element.focus();
          return false;
        }
      }

      if (this.questions[i].answer_data_type == 'date') {

        if (this.questions[i].answer.answer) {
          var d = new Date(this.questions[i].answer.answer);
          //var day = d.getDate();
          //var month = d.getMonth();
          //month += 1;
          var day = ("0" + (d.getDate())).slice(-2);
          var month = ("0" + (d.getMonth() + 1)).slice(-2);
          var year = d.getFullYear();

          this.questions[i].answer.answer = year + '-' + month + '-' + day;
        } else {
          this.questions[i].answer.answer = '';
        }

        var res = {
          "question": this.questions[i].id,
          "answer": this.questions[i].answer.answer
        }
      }
      else {
        var res = {
          "question": this.questions[i].id,
          "answer": (this.questions[i].answer.answer) ? this.questions[i].answer.answer : null
        }
      }

      this.report.push(res);
    }
    return true;
  }

  /**
   * Save Exit
   */
  saveExit() {
    // need to save the answers before logging them out.
    let is_valid = this.prepareReportData(true);

    if (!is_valid) {
      return;
    }
    this.reporting_service.postReportingAnswers(this.report)
      .then(
        data => {
          this.appComponent.reset();
          this.showLoading = false;
          this.auth_service.logout();
          this.router.navigate(['/']);
        }
      )
      .catch((error) => {
        let errBody = JSON.parse(error._body);
        if (this.common.sessionCheck(errBody.code)) {
          this.loadingMessage['message'] = LoadingMessage.GET_MONTHLY_REPORT_ANSWERS_BY_PERIOD;
          this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
        }
      });
  }

  ngOnInit() {
    this.common.disableBrowseBackButton();
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

  ngOnDestroy() {
    this.session.unsubscribe();
  }

  formChanged() {
    this.form_changed = true;
  }
}
