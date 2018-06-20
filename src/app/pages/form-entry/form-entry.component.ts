import {Component, OnInit, ElementRef, OnDestroy} from '@angular/core';
import { ScrollEvent } from 'ngx-scroll-event';
import {Router, ActivatedRoute} from '@angular/router';
import {CompanyService, AuthService, SignoffService} from './../../services';
import * as moment from 'moment';
import {CommonService} from "../../services";
import {AppConstants, ErrorCodes, ErrorMessage, LoadingMessage, NavigateToScreen} from '../../app.constants';
import {containsElement} from "@angular/animations/browser/src/render/shared";
import {AppComponent} from '../../app.component';
import {Observable} from 'rxjs/Rx';
import { DecimalPipe } from '@angular/common';
import {isNull, isNullOrUndefined} from "util";


@Component({
    selector: 'app-form-entry',
    templateUrl: './form-entry.component.html',
    styleUrls: ['./form-entry.component.css'],
    providers: [ CompanyService, AuthService, SignoffService ]
})
export class FormEntryComponent implements OnInit, OnDestroy {
    balancesheet: any = {};
    incomestatement: any = {};
    date;
    company_meta;
    username;
    companyName;

    loadingMessage: any;
    session: any;
    form_changed: boolean;
    showLoading: boolean = true;
    showContact: boolean = true;
    account_status: any;
    setDefaultValue: string = parseFloat('0').toFixed(2);

    // need to set input length limits on the form and make all fields required #todo #brad
    constructor(private company_service: CompanyService,
                private signoff_service: SignoffService,
                private router: Router,
                private auth_service: AuthService,
                private common: CommonService,
                private elRef: ElementRef,
                private appComponent: AppComponent) {
        this.username = this.common.getUserName();
        this.companyName = this.common.getCompanyName();
        this.loadingMessage = {
            'message' : '',
            'error' : ''
        }
        this.session = Observable.interval(1000 * 60 * AppConstants.DATA_INTERVAL).subscribe(x => {
            if (this.form_changed) {
                this.submit();
                this.form_changed = false;
            }
        });
        let params = {last_page: NavigateToScreen.manual};
        //api call to set the metdata last page
        this.company_service.updateCompanyMetadata(params)
            .then(data => {
                this.appComponent.session_warning();
                this.account_status = data.result.accounting_setup_status;
                this.showLoading = false;
            })
            .catch((error) => {
                let errBody = JSON.parse(error._body);
                if (this.common.sessionCheck(errBody.code)) {
                    this.appComponent.session_warning();
                    this.loadingMessage['message'] = LoadingMessage.UPDATE_COMPANY_META;
                    this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
                }
            });

        this.common.debuglog('form entry constructor meta is');
        this.company_meta = JSON.parse(localStorage.getItem('company_meta'));
        this.common.debuglog(this.company_meta);
        this.date = moment(this.company_meta.monthly_reporting_current_period).format('YYYY-MM-DD');
        var period = moment(this.company_meta.monthly_reporting_current_period).format('YYYY-MM');
        this.common.debuglog('MANUAL REPORTING for '+this.date+' '+period);

        /*
        var dateObj = this.date;
        VvX4W7NP7oUgRAXBa4USLABDu
        var month = dateObj.getUTCMonth() + 1; //months from 1-12
        var day = dateObj.getUTCDate();
        var year = dateObj.getUTCFullYear();
        if (month.toString().length == 1) {
            var end_date = year + "-0" + month;
        } else {
            var end_date = year + "-" + month;
        }
        */

        // #todo SourceKey and SourceName are not needed
        // #todo We should be able to get these objects dynamically from the server
        this.balancesheet = {
            "Period": period,
            "TotalCurrentAssets": this.setDefaultValue,
            "TotalAssets": this.setDefaultValue,
            "TotalCurrentLiabilities": this.setDefaultValue,
            "TotalLiabilities": this.setDefaultValue,
            "TotalEquity": this.setDefaultValue,
            "TotalLiabilityAndEquity": this.setDefaultValue,
            "Cash": this.setDefaultValue,
            "AccountReceivables": this.setDefaultValue,
            "SREDReceivable": this.setDefaultValue,
            "OtherCurrentAssets": this.setDefaultValue,
            "FixedAssets": this.setDefaultValue,
            "PatentsAndIntangibleAssets": this.setDefaultValue,
            "OtherAssets": this.setDefaultValue,
            "AccountsPayableAndAccruedLiabilities": this.setDefaultValue,
            "BankDebt": this.setDefaultValue,
            "OtherCurrentLiabilities": this.setDefaultValue,
            "EspressoDebtOutstanding": this.setDefaultValue,
            "SeniorSecuredDebt": this.setDefaultValue,
            "SubordinatedDebt": this.setDefaultValue,
            "ShareholderLoans": this.setDefaultValue,
            "DeferredRevenue": this.setDefaultValue,
            "OtherLiabilities": this.setDefaultValue,
            "ShareAndContributedCapital": this.setDefaultValue,
            "MinorityEquityPosition": this.setDefaultValue,
            "EquityPositionOfLTDebt": this.setDefaultValue,
            "RetainedEarningsLoss": this.setDefaultValue,
            "NetIncomeYTD": this.setDefaultValue,
            "CreatedTimestamp": new Date(),
            "LastUpdatedTimestamp": new Date(),
            "SourceName": "CustomerProfile",
            "SourceKey": "Prabhu5"
        };
        /* //#brad: removed these because they aren't needed. delete after testing is done.
        "*/

        this.incomestatement = {
            "Ebitda": this.setDefaultValue,
            "NetIncome": this.setDefaultValue,
            "Period": period,
            "TotalRevenue": this.setDefaultValue,
            "GrossProfit": this.setDefaultValue,
            "NonRecurringRevenues": this.setDefaultValue,
            "RecurringRevenues": this.setDefaultValue,
            "CostOfGoodsSold": this.setDefaultValue,
            "SalesAndMarketingExpenses": this.setDefaultValue,
            "RDGrossMinusExcludingSRED": this.setDefaultValue,
            "GA": this.setDefaultValue,
            "InterestIncomeExpense": this.setDefaultValue,
            "SREDAccrual": this.setDefaultValue,
            "IRAPGrantsReceived": this.setDefaultValue,
            "DepreciationAndAmortization": this.setDefaultValue,
            "OtherIncomeExpenses": this.setDefaultValue,
            "CreatedTimestamp": new Date(),
            "LastUpdatedTimestamp": new Date(),
            "SourceName": "CustomerProfile",
            "SourceKey": "Prabhu5"
        }

        // reload the saved values
        // todo: back-end should just send expected format so we can do: this.incomestatement = data;
        if(this.company_meta.monthly_reporting_current_period_status == AppConstants.SETUP_STATUS_IN_PROGRESS) {
            this.common.debuglog('IN PROGRESS MR');
            this.signoff_service.getIncomeCetificateForParticularMonth(this.date)
                .then(
                    data => {
                        this.appComponent.session_warning();
                        if (!data.message) {
                            for (var i = 0; i < data.result.length; i++) {
                                this.incomestatement[data.result[i].fse_tag.all_sight_name] = data.result[i].value;
                            }
                        }
                    })
                .catch((error) => {
                    let errBody = JSON.parse(error._body);
                    if (this.common.sessionCheck(errBody.code)) {
                        this.appComponent.session_warning();
                        this.loadingMessage['message'] = LoadingMessage.INCOME_CERTIFICATE_FOR_PARTICULAR_MONTH
                        this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
                    }
                });

            this.signoff_service.getBalanceSheetForParticularMonth(this.date)
                .then(
                    data => {
                        this.appComponent.session_warning();
                        if (!data.message) {
                            for(var i = 0; i < data.result.length; i++) {
                                this.balancesheet[data.result[i].fse_tag.all_sight_name] = data.result[i].value;
                            }
                        }
                    }
                )
                .catch((error) => {
                    let errBody = JSON.parse(error._body);
                    if (this.common.sessionCheck(errBody.code)) {
                        this.appComponent.session_warning();
                        this.loadingMessage['message'] = LoadingMessage.BALANCE_SHEET_CERTIFICATE_FOR_PARTICULAR_MONTH
                        this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
                    }
                });
        }
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
     * submit form entry IncomeStatement and BalanceSheet details
     */
    submitForm() {
      this.getTotalAssets();
      this.getTotalEquity();
      if (this.balancesheet.TotalAssets !== this.balancesheet.TotalLiabilityAndEquity) {
        this.appComponent.addToast('error', 'Error', ErrorMessage.DEBIT_CREDIT_UNEQUAL);
        return;
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

        this.company_service.sendBalanceSheet(balancesheet)
            .then(data => {
                this.company_service.sendIncomeStatement(incomestatement)
                    .then(res => {
                        this.showLoading = false;
                        this.common.debuglog('redirecting to /reporting/formentry');
                        this.router.navigate([NavigateToScreen.reporting, NavigateToScreen.manual]);
                })
                .catch((error) => {
                    let errBody = JSON.parse(error._body);
                    if (this.common.sessionCheck(errBody.code)) {
                        this.appComponent.session_warning();
                        this.loadingMessage['message'] = LoadingMessage.SEND_INCOME_STATEMENT;
                        this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
                      setInterval(() => { this.showLoading = false;
                      }, 5000);
                    }
                });
            })
            .catch((error) => {
                let errBody = JSON.parse(error._body);
                if (this.common.sessionCheck(errBody.code)) {
                    this.appComponent.session_warning();
                    this.loadingMessage['message'] = LoadingMessage.SEND_BALANCE_SHEET;
                    this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
                  setInterval(() => { this.showLoading = false;
                  }, 5000);
                }
            });

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
        this.balancesheet.TotalCurrentAssets = 
        this.convertStrToFloat((this.convertStrToFloat(this.balancesheet.Cash) + 
        this.convertStrToFloat(this.balancesheet.AccountReceivables) + 
        this.convertStrToFloat(this.balancesheet.SREDReceivable) + 
        this.convertStrToFloat(this.balancesheet.OtherCurrentAssets))).toFixed(2);
        
        this.balancesheet.TotalAssets = 
        this.convertStrToFloat((this.convertStrToFloat(this.balancesheet.TotalCurrentAssets) + 
        this.convertStrToFloat(this.balancesheet.PatentsAndIntangibleAssets) + 
        this.convertStrToFloat(this.balancesheet.FixedAssets) + 
        this.convertStrToFloat(this.balancesheet.OtherAssets))).toFixed(2);
    }

    getTotalAssets() {
        this.balancesheet.TotalAssets = 
        this.convertStrToFloat((this.convertStrToFloat(this.balancesheet.TotalCurrentAssets) + 
        this.convertStrToFloat(this.balancesheet.PatentsAndIntangibleAssets) + 
        this.convertStrToFloat(this.balancesheet.FixedAssets) + 
        this.convertStrToFloat(this.balancesheet.OtherAssets))).toFixed(2);
    }

    getTotalCurrentLiabilities() {
        this.balancesheet.TotalCurrentLiabilities = 
        this.convertStrToFloat((this.convertStrToFloat(this.balancesheet.AccountsPayableAndAccruedLiabilities) + 
        this.convertStrToFloat(this.balancesheet.BankDebt) + 
        this.convertStrToFloat(this.balancesheet.OtherCurrentLiabilities) + 
        this.convertStrToFloat(this.balancesheet.DeferredRevenue))).toFixed(2);

        this.balancesheet.TotalLiabilities =
        this.convertStrToFloat((this.convertStrToFloat(this.balancesheet.TotalCurrentLiabilities) +
    	this.convertStrToFloat(this.balancesheet.EspressoDebtOutstanding) +
        this.convertStrToFloat(this.balancesheet.SeniorSecuredDebt) +
        this.convertStrToFloat(this.balancesheet.SubordinatedDebt) +
        this.convertStrToFloat(this.balancesheet.ShareholderLoans) +
        this.convertStrToFloat(this.balancesheet.OtherLiabilities))).toFixed(2);

        this.balancesheet.TotalLiabilityAndEquity =
        this.convertStrToFloat((this.convertStrToFloat(this.balancesheet.TotalEquity) +
        this.convertStrToFloat(this.balancesheet.TotalLiabilities))).toFixed(2);
    }

    getTotalLiabilities() {
        this.balancesheet.TotalLiabilities =        
        this.convertStrToFloat((this.convertStrToFloat(this.balancesheet.TotalCurrentLiabilities) +
        this.convertStrToFloat(this.balancesheet.EspressoDebtOutstanding) + 
        this.convertStrToFloat(this.balancesheet.SeniorSecuredDebt) + 
        this.convertStrToFloat(this.balancesheet.SubordinatedDebt) + 
        this.convertStrToFloat(this.balancesheet.ShareholderLoans) + 
        this.convertStrToFloat(this.balancesheet.OtherLiabilities))).toFixed(2);
        
        this.balancesheet.TotalLiabilityAndEquity = 
        this.convertStrToFloat((this.convertStrToFloat(this.balancesheet.TotalEquity) + 
        this.convertStrToFloat(this.balancesheet.TotalLiabilities))).toFixed(2);
    }

    getTotalEquity() {
        this.balancesheet.TotalEquity = 
        this.convertStrToFloat((this.convertStrToFloat(this.balancesheet.ShareAndContributedCapital) + 
        this.convertStrToFloat(this.balancesheet.MinorityEquityPosition) + 
        this.convertStrToFloat(this.balancesheet.EquityPositionOfLTDebt) + 
        this.convertStrToFloat(this.balancesheet.RetainedEarningsLoss) + 
        this.convertStrToFloat(this.balancesheet.NetIncomeYTD))).toFixed(2);
        
        this.balancesheet.TotalLiabilityAndEquity = 
        this.convertStrToFloat((this.convertStrToFloat(this.balancesheet.TotalEquity) + 
        this.convertStrToFloat(this.balancesheet.TotalLiabilities))).toFixed(2);
    }

    getTotalRevenue() {
        this.incomestatement.TotalRevenue = 
        this.convertStrToFloat((this.convertStrToFloat(this.incomestatement.NonRecurringRevenues) + 
        this.convertStrToFloat(this.incomestatement.RecurringRevenues))).toFixed(2);
        
        this.incomestatement.GrossProfit = 
        this.convertStrToFloat((this.convertStrToFloat(this.incomestatement.TotalRevenue) - 
        this.convertStrToFloat(this.incomestatement.CostOfGoodsSold))).toFixed(2);
        
        this.incomestatement.Ebitda = 
        this.convertStrToFloat((this.convertStrToFloat(this.incomestatement.GrossProfit) - 
        (this.convertStrToFloat(this.incomestatement.SalesAndMarketingExpenses) + 
        this.convertStrToFloat(this.incomestatement.RDGrossMinusExcludingSRED) + 
        this.convertStrToFloat(this.incomestatement.GA)))).toFixed(2);
        
        this.incomestatement.NetIncome = 
        this.convertStrToFloat((this.convertStrToFloat(this.incomestatement.Ebitda) +
        this.convertStrToFloat(this.incomestatement.InterestIncomeExpense) + 
        this.convertStrToFloat(this.incomestatement.SREDAccrual) + 
        this.convertStrToFloat(this.incomestatement.IRAPGrantsReceived) + 
        this.convertStrToFloat(this.incomestatement.DepreciationAndAmortization) + 
        this.convertStrToFloat(this.incomestatement.OtherIncomeExpenses))).toFixed(2);
    }

    getGrossProfit() {
        this.incomestatement.GrossProfit = 
        this.convertStrToFloat((this.convertStrToFloat(this.incomestatement.TotalRevenue) - 
        this.convertStrToFloat(this.incomestatement.CostOfGoodsSold))).toFixed(2);
        
        this.incomestatement.Ebitda = 
        this.convertStrToFloat((this.convertStrToFloat(this.incomestatement.GrossProfit) - 
        (this.convertStrToFloat(this.incomestatement.SalesAndMarketingExpenses) + 
        this.convertStrToFloat(this.incomestatement.RDGrossMinusExcludingSRED) + 
        this.convertStrToFloat(this.incomestatement.GA)))).toFixed(2);
        
        this.incomestatement.NetIncome = 
        this.convertStrToFloat((this.convertStrToFloat(this.incomestatement.Ebitda) + 
        this.convertStrToFloat(this.incomestatement.InterestIncomeExpense) + 
        this.convertStrToFloat(this.incomestatement.SREDAccrual) + 
        this.convertStrToFloat(this.incomestatement.IRAPGrantsReceived) + 
        this.convertStrToFloat(this.incomestatement.DepreciationAndAmortization) + 
        this.convertStrToFloat(this.incomestatement.OtherIncomeExpenses))).toFixed(2);
    }

    getEbitda() {
        this.incomestatement.Ebitda = 
        this.convertStrToFloat((this.convertStrToFloat(this.incomestatement.GrossProfit) - 
        (this.convertStrToFloat(this.incomestatement.SalesAndMarketingExpenses) + 
        this.convertStrToFloat(this.incomestatement.RDGrossMinusExcludingSRED) + 
        this.convertStrToFloat(this.incomestatement.GA)))).toFixed(2);
        
        this.incomestatement.NetIncome = 
        this.convertStrToFloat((this.convertStrToFloat(this.incomestatement.Ebitda) + 
        this.convertStrToFloat(this.incomestatement.InterestIncomeExpense) + 
        this.convertStrToFloat(this.incomestatement.SREDAccrual) + 
        this.convertStrToFloat(this.incomestatement.IRAPGrantsReceived) + 
        this.convertStrToFloat(this.incomestatement.DepreciationAndAmortization) + 
        this.convertStrToFloat(this.incomestatement.OtherIncomeExpenses))).toFixed(2);
    }

    getNetIncome() {
        this.incomestatement.NetIncome = 
        this.convertStrToFloat((this.convertStrToFloat(this.incomestatement.Ebitda) + 
        this.convertStrToFloat(this.incomestatement.InterestIncomeExpense) + 
        this.convertStrToFloat(this.incomestatement.SREDAccrual) + 
        this.convertStrToFloat(this.incomestatement.IRAPGrantsReceived) + 
        this.convertStrToFloat(this.incomestatement.DepreciationAndAmortization) + 
        this.convertStrToFloat(this.incomestatement.OtherIncomeExpenses))).toFixed(2);
    }

    /**
     * Save Exit
     */
    saveExit(){
        this.showLoading = true;
        this.form_changed = false;
        var balancesheet = {
            "BalanceSheet": [this.balancesheet]
        }

        var incomestatement = {
            "IncomeStatement": [this.incomestatement]
        }

        let params = {monthly_reporting_current_period_status: 'IN_PROGRESS'};
        //api call to set the metdata last page
        this.company_service.updateCompanyMetadata(params)
            .then(data => {
                this.showLoading = false;
            })
            .catch((error) => {
                let errBody = JSON.parse(error._body);
                if (this.common.sessionCheck(errBody.code)) {
                    this.loadingMessage['message'] = LoadingMessage.UPDATE_COMPANY_META;
                    this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
                }
        });

        this.common.debuglog('A BALANCE SHEET sheet is ');
        this.common.debuglog(JSON.stringify(balancesheet));

        this.company_service.sendBalanceSheet(balancesheet)
            .then(data => {
                this.company_service.sendIncomeStatement(incomestatement)
                    .then(res => {
                        this.appComponent.reset();
                    this.auth_service.logout();
                    this.showLoading = false;
                    this.router.navigate(['/']);
                })
                .catch((error) => {
                    let errBody = JSON.parse(error._body);
                    if (this.common.sessionCheck(errBody.code)) {
                        this.loadingMessage['message'] = LoadingMessage.SEND_INCOME_STATEMENT;
                        this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
                    }
                });
            })
            .catch((error) => {
                let errBody = JSON.parse(error._body);
                if (this.common.sessionCheck(errBody.code)) {
                    this.loadingMessage['message'] = LoadingMessage.SEND_BALANCE_SHEET;
                        this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
                }
            });
    }
  submit() {
      var balancesheet = {
          "BalanceSheet": [this.balancesheet]
      };
      var incomestatement = {
          "IncomeStatement": [this.incomestatement]
      };

      this.company_service.sendBalanceSheet(balancesheet)
          .then(data => {
              this.company_service.sendIncomeStatement(incomestatement)
                  .then(res => {
                      this.appComponent.addToast(AppConstants.SUCCESS_RESPONSE, '', LoadingMessage.SAVE_CHANGES_SUCCESS);
                      this.showLoading = false;
                  })
                  .catch((error) => {
                      let errBody = JSON.parse(error._body);
                      if (this.common.sessionCheck(errBody.code)) {
                          this.appComponent.session_warning();
                          this.loadingMessage['message'] = LoadingMessage.SEND_INCOME_STATEMENT;
                          this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
                      }
                  });
          })
          .catch((error) => {
              let errBody = JSON.parse(error._body);
              if (this.common.sessionCheck(errBody.code)) {
                  this.appComponent.session_warning();
                      this.loadingMessage['message'] = LoadingMessage.SEND_BALANCE_SHEET;
                      this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
                  }
              });
  }
  ngOnInit() {
      this.common.disableBrowseBackButton();
  }

  goBack() {
        if (this.account_status === AppConstants.SETUP_STATUS_COMPLETE) {
            this.router.navigate([NavigateToScreen.dashboard]);
        }else {
            this.router.navigate([NavigateToScreen.sync]);
        }
  }

  ngOnDestroy() {
   this.session.unsubscribe();
  }
  formChanged() {
      this.form_changed = true;
  }

}
