import {Component, ElementRef, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {CompanyService, SignoffService, AuthService} from './../../services';
import * as moment from 'moment';
import { CurrencyPipe } from '@angular/common';
import { DecimalPipe } from '@angular/common';
import {CommonService} from "../../services";
import {AppConstants, ErrorCodes, LoadingMessage, NavigateToScreen} from '../../app.constants';
import {ScrollEvent} from "ngx-scroll-event";
import {AppComponent} from '../../app.component';

@Component({
    selector: 'app-coa-matchmaking-confirm',
    templateUrl: './coa-matchmaking-confirm.component.html',
    styleUrls: ['./coa-matchmaking-confirm.component.css'],
    providers: [ CompanyService, SignoffService, AuthService ]
})
export class CoaMatchmakingConfirmComponent implements OnInit {
    showLoading: boolean = true;
    showContact: boolean = true;
    income_statement: any = [];
    balance_sheet: any = [];
    balance_sheet_liab: any[]; // ...ilities temporary until phase 2 refactor. #brad #todo
    balance_sheet_ass: any[];  // ...ets :) temporary until phase 2 refactor. #brad
    loadingMessage: any;
    isActiveClass: boolean = false;
    date;
    credit_debit;
    type: string;
    username;
    companyName;
    companyAccountingType;
    params:  any;
    account_setup_status: any;
    negative_collection : any;
    constructor(private router: Router,
                private signoff_service: SignoffService,
                private company_service: CompanyService,
                private route: ActivatedRoute,
                private auth_service: AuthService,
                private common: CommonService,
                private elRef: ElementRef,
                private appComponent: AppComponent) {
        this.username = this.common.getUserName();
        this.companyName = this.common.getCompanyName();
        this.companyAccountingType = this.common.getAccountingType();
        // get type param from route
        this.route.params.subscribe(params => {
            this.type = params.type;
        });
        let company = JSON.parse(localStorage.getItem('company_meta'));
        this.account_setup_status = company['accounting_setup_status'];
        this.credit_debit = localStorage.getItem('credit_debit');
        this.loadingMessage = {
            'message' : '',
            'error' : ''
        }


        if (this.common.checkAccountType(this.type) && this.account_setup_status == AppConstants.SETUP_STATUS_IN_PROGRESS) {
            this.params = {accounting_setup_status: AppConstants.SETUP_STATUS_ACCOUNTING_TYPE_CHOSEN, last_page: '/coa-match-confirm/' + this.type};
        }else {
            this.params = { last_page: '/'+NavigateToScreen.coa_match_confimation+'/' + this.type};
        }
        //api call to set the metdata  last page
        this.company_service.updateCompanyMetadata(this.params)
            .then(data => {
                this.appComponent.session_warning();
                this.common.debuglog(data.result);
            })
            .catch((error) => {
                let errBody = JSON.parse(error._body);
                if (this.common.sessionCheck(errBody.code)) {
                    this.appComponent.session_warning();
                    this.showLoading = false;
                    return errBody.message;
                }

            });

        var company_meta = JSON.parse(localStorage.getItem('company_meta'));
        this.date = moment(company_meta.monthly_reporting_current_period).format('YYYY-MM-DD');

        // get income and balance sheet
        this.loadingMessage['message'] = LoadingMessage.LOAD_BALANCE_AND_INCOME_FOR_MOMENT + moment(company_meta.monthly_reporting_current_period).format('MMMM DD, YYYY');

        this.signoff_service.getBalanceSheet()
            .then(
                data => {
                    this.appComponent.session_warning();
                    this.common.debuglog(data);
                    this.common.debuglog('########## COA MATCH service balance sheet');
                    if (data.message) {
                        this.balance_sheet = [];
                    }else {
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
                    }

                    this.signoff_service.getIncomeCetificate()
                        .then(
                            data => {
                                this.appComponent.session_warning();
                                 if (data.message) {
                                this.income_statement = [];
                                } else {
                                    this.income_statement = data.result.sort(function(a,b) {
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

                                this.showLoading = false;
                            }
                        )
                        .catch((error) => {
                            let errBody = JSON.parse(error._body);
                            if (this.common.sessionCheck(errBody.code)) {
                                this.appComponent.session_warning();
                                this.loadingMessage['message'] = LoadingMessage.GET_INCOME_CERTIFICATE;
                                this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
                            }
                        });
                }
            )
            .catch((error) => {
                let errBody = JSON.parse(error._body);
                if (this.common.sessionCheck(errBody.code)) {
                    this.appComponent.session_warning();
                    this.loadingMessage['message'] = LoadingMessage.GET_INCOME_AND_BALANCE_SHEET;
                    this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
                }

                //return errBody.message;
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
    if(elements.classList.contains('open')) {
      elements.classList.remove("open");
    }
  }

    changeTab() {
        // active class for tabs
        this.isActiveClass = true;
        let income = this.elRef.nativeElement.querySelector('#show_income_statement_list');
        let balance = this.elRef.nativeElement.querySelector('#show_balance_sheet_list');
        income.classList.add('active');
        balance.classList.remove('active');
    }

    hideSheet() {
        this.isActiveClass = false;
    }

    /**
     * go back to coa-match
     */

    goBack(){
        // #todo: can we send another parameter here called remap a adding some more code
        localStorage.removeItem('credit_debit');
        this.router.navigate(['coa-match', this.type], /*{ queryParams: { remap: true } }*/);
    }

    /**
     * update company meta data
     */
    updateCompanyMetaData() {
        this.showLoading = true;
        let params = {accounting_setup_status: AppConstants.SETUP_STATUS_COMPLETE};
        //api call to set the metdata
        this.company_service.updateCompanyMetadata(params)
            .then(data => {
                if (data.status == AppConstants.SUCCESS_RESPONSE) {
                    this.appComponent.session_warning();
                    this.showLoading = false;
                    if (data.result.is_initial_setup == true) {
                        this.router.navigate([NavigateToScreen.thanks]);
                    } else {
                        this.router.navigate([NavigateToScreen.reporting, this.type]);
                    }
                }
            }).catch((error) => {
                let errBody = JSON.parse(error._body);
                if (this.common.sessionCheck(errBody.code)) {
                    this.appComponent.session_warning();
                    this.loadingMessage['message'] = LoadingMessage.UPDATE_COMPANY_META
                    this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
                }
            });
    }

     /**
     * Save Exit
     */
    saveExit(){
        let params = {last_page: '/'+NavigateToScreen.coa_match_confimation+'/' + this.type};
        //api call to set the metdata  last page
        this.company_service.updateCompanyMetadata(params)
            .then(
                data => {
                    this.appComponent.session_warning();
                    this.showLoading = false;
                    this.appComponent.reset();
                    localStorage.removeItem('credit_debit');
                    this.auth_service.logout();
                    this.router.navigate(['/']);
                }
            )
            .catch((error) => {
                let errBody = JSON.parse(error._body);
                if (this.common.sessionCheck(errBody.code)) {
                    this.appComponent.session_warning();
                    this.loadingMessage['message'] = LoadingMessage.UPDATE_COMPANY_META
                    this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
                }
            });
    }
}
