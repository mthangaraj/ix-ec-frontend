import {Component, ElementRef, OnDestroy, OnInit, Pipe, PipeTransform} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {CompanyService, SignoffService, AuthService} from './../../services';
// import {Observable} from 'rxjs/Observable';
import {CommonService} from "../../services";
import {AppConstants, ErrorCodes, ErrorMessage, LoadingMessage, NavigateToScreen} from '../../app.constants';
import {ScrollEvent} from "ngx-scroll-event";
import {first} from 'rxjs/operators';
import {AppComponent} from '../../app.component';
import {Observable} from 'rxjs/Rx';
import {Subscription} from 'rxjs/Subscription';
import {environment} from '../../../environments/environment';

declare var $:any;
@Component({
    selector: 'app-coa-match',
    templateUrl: './coa-match.component.html',
    styleUrls: ['./coa-match.component.css'],
    providers: [CompanyService, SignoffService, AuthService]
})
export class CoaMatchComponent implements OnInit , OnDestroy{
    showLoading: boolean = true;
    loadingMessage: any;
    showContact: boolean = true;
    fields: any = [];
    err:boolean;
    income_statement_assets: any = [];
    income_statement_liability: any = [];
    balance_sheet: any = [];
    isInitialSetup: boolean = false;
    type: string;
    sync_type: string;
    searchtext;
    ifError: boolean = false;
    ifSuccess: boolean = false;
    remap: boolean = false;
    field_index: number = 0;
    // for grouping the coa map data
    assets: any = [];
    liabilities: any = [];
    equity: any = [];
    income: any = [];
    expenses: any = [];
    username;
    companyName;
    companyAccountingType;
    company_metadate;
    session: Subscription;
    form_changed: boolean;
    params:  any;
    account_status: any;
    incrementFieldIndex() {
       this.field_index++;
       this.common.debuglog('### field index track is '+this.field_index);
       //return this.field_index;
    }

    constructor(private company_service: CompanyService,
                private router: Router,
                private signoff_service: SignoffService,
                private route: ActivatedRoute,
                private auth_service: AuthService,
                private common: CommonService,
                private elRef: ElementRef,
                private appComponent: AppComponent) {
        this.session = Observable.interval( 1000 * 60 * AppConstants.DATA_INTERVAL ).subscribe(x => {
            if (this.form_changed) {
                this.submit();
                this.form_changed = false;
            }
        });
        this.username = this.common.getUserName();
        this.companyName = this.common.getCompanyName();
        this.companyAccountingType = this.common.getAccountingType();
        this.loadingMessage = {
            'message': '',
            'error': ''
        }

        this.loadingMessage['message'] = LoadingMessage.MATCH_COA;

        this.field_index = 0;
        // get date param from route
        this.route.params.subscribe( params => {
	    	//this.isInitialSetup = params.is_initial_setup;
            this.type = params.type;
        });

        // this will be coming from the coa-matching-confirm page if the user needs to remap the
        // chart of accounts
        this.route.queryParams.subscribe(
            params => {
                if (params['remap'] === 'false') {
                    this.remap = true;
                    this.common.debuglog('params remap ' + this.remap);
                }
            }
        );

        this.company_service.getCompanyMetadata()
            .then(
                data => {
                    this.common.debuglog('META');
                    this.common.debuglog(data);
                    this.appComponent.session_warning();
                    this.sync_type = data.result['monthly_reporting_sync_method'];
                    this.company_metadate = data.result['monthly_reporting_current_period'];
                    this.account_status = data.result['accounting_setup_status'];
                    this.accountChose();
                }
            )
            .catch((error) => {
                let errBody = JSON.parse(error._body);
                this.common.debuglog(error);
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
    if(elements.classList.contains('open')){
      elements.classList.remove("open");
    }
  }
  accountChose() {
      // api call to set the metdata  last page and account status

      if (this.type === 'upload' && this.account_status == AppConstants.SETUP_STATUS_IN_PROGRESS) {
          this.params = {accounting_setup_status: AppConstants.SETUP_STATUS_ACCOUNTING_TYPE_CHOSEN, last_page: '/coa-match/' + this.type};
      }else {
          this.params = {last_page: '/coa-match/' + this.type};
      }
      this.company_service.updateCompanyMetadata(this.params)
          .then(
              data => {
                  this.appComponent.session_warning();
                  this.common.debuglog('updateCompanyMetadata '+ data.result)

                  // we need the updated meta data to get the sync type to check to see if it's CSV or not.
                  if(!this.remap) {
                      // if type is quickbooks and sync method is QBO, call get api of ChartOfAccounts and TrialBalance
                      // this is specific to quickbooks online
                      if (this.common.checkAccountType(this.type) && this.common.checkAccountSyncType(data.result.monthly_reporting_sync_method)) {
                          // IF  companymeta.chartofaccounts_last_refresh_date < today's date then do this:
                          this.company_service.getChartOfAccounts()
                              .then(data => {
                                  this.appComponent.session_warning();
                                  this.company_service.getCoAMap()
                                      .then(data => {
                                          this.appComponent.session_warning();
                                          if (data.message == ErrorMessage.NO_DATA_CHANGES) {
                                              this.loadingMessage['message'] = LoadingMessage.NOCHANAGE_IN_COA_TB_IS_LOADING;

                                              this.company_service.getTrialBalance()
                                                  .then(
                                                      response => {
                                                          this.appComponent.session_warning();
                                                          this.loadingMessage['message'] = LoadingMessage.PROCESSING_FINANCIALS;
                                                          // this.common.debuglog(response)
                                                          this.company_service.getGenerateStatements()
                                                              .then(response => {
                                                                  this.appComponent.session_warning();
                                                                  this.common.debuglog('AS RESPONSE');
                                                                  this.common.debuglog(response);
                                                                  this.showLoading = false;
                                                                  let credit_debit= response.result['credit_debit_unequals'] ? response.result['credit_debit_unequals'] : [];
                                                                  if (credit_debit.length > 0) {
                                                                      for (let i = 0; i < credit_debit.length; i++){
                                                                          if (this.company_metadate == credit_debit[i]){
                                                                              localStorage.setItem('credit_debit', 'yes');
                                                                          }
                                                                      }
                                                                  }
                                                                  // redirect to report page
                                                                  this.router.navigate([NavigateToScreen.reporting, this.type]);
                                                              })
                                                              .catch((error) => {
                                                                  let errBody = JSON.parse(error._body);
                                                                  if (this.common.sessionCheck(errBody.code)) {
                                                                      this.appComponent.session_warning();
                                                                      this.loadingMessage['message'] = LoadingMessage.LOADING_GENERATE_STATEMENTS;
                                                                      this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
                                                                  }

                                                              });
                                                      }
                                                  )
                                                  .catch((error) => {
                                                      let errBody = JSON.parse(error._body);
                                                      if (this.common.sessionCheck(errBody.code)) {
                                                        if (errBody.message === ErrorMessage.NO_CONNECTION) {
                                                          window.location.href = environment.api.url + NavigateToScreen.qbo + localStorage.getItem('company');
                                                        } else {
                                                          this.appComponent.session_warning();
                                                          this.loadingMessage['message'] = LoadingMessage.NOCHANAGE_IN_COA_TB_IS_LOADING;
                                                          this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
                                                        }
                                                      }
                                                  });
                                          } else {
                                              this.prepareMapData(data.result);
                                              this.showLoading = false;
                                          }
                                      })
                                      .catch((error) => {
                                          let errBody = JSON.parse(error._body);
                                          if (this.common.sessionCheck(errBody.code)) {
                                              this.appComponent.session_warning();
                                              this.loadingMessage['message'] = LoadingMessage.NOCHANAGE_IN_COA_AND_MAPPIN_IS_LOADING;
                                              this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
                                          }
                                      });
                              })
                              .catch((error) => {
                                  let errBody = JSON.parse(error._body);
                                  if (this.common.sessionCheck(errBody.code)) {
                                      if (errBody.message === ErrorMessage.NO_CONNECTION) {
                                              window.location.href = environment.api.url + NavigateToScreen.qbo + localStorage.getItem('company');
                                          } else {
                                              this.appComponent.session_warning();
                                              this.loadingMessage['message'] = LoadingMessage.NOCHANAGE_IN_COA_TB_IS_LOADING;
                                              this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
                                          }
                                  }
                              });
                      } else {
                          // using something other than quickbooks online, and we expect the trial balance and coa to already be in the system. (CSV, QBD)
                          this.company_service.getCoAMap()
                              .then(data => {
                                  this.appComponent.session_warning();
                                  if (data.message == ErrorMessage.NO_DATA_CHANGES) {
                                      this.loadingMessage['message'] = LoadingMessage.PROCESSING_FINANCIALS;
                                      this.company_service.getGenerateStatements()
                                          .then(response => {
                                              this.appComponent.session_warning();
                                              this.common.debuglog('AS RESPONSE');
                                              this.common.debuglog(response);
                                              this.showLoading = false;
                                              let credit_debit= response.result['credit_debit_unequals'] ? response.result['credit_debit_unequals'] : [];
                                              if (credit_debit.length > 0) {
                                                  for (let i = 0; i < credit_debit.length; i++){
                                                      if (this.company_metadate == credit_debit[i]){
                                                          localStorage.setItem('credit_debit', 'yes');
                                                      }
                                                  }
                                              }
                                              // redirect to report page
                                              this.router.navigate(['reporting', this.type]);

                                          })
                                          .catch((error) => {
                                              let errBody = JSON.parse(error._body);
                                              if (this.common.sessionCheck(errBody.code)) {
                                                  this.appComponent.session_warning();
                                                  this.loadingMessage['message'] = LoadingMessage.LOADING_GENERATE_STATEMENTS;
                                                  this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
                                              }
                                          });
                                  } else {
                                      this.prepareMapData(data.result);
                                      this.showLoading = false;
                                  }
                              })
                              .catch((error) => {
                                  let errBody = JSON.parse(error._body);
                                  if (this.common.sessionCheck(errBody.code)) {
                                      this.appComponent.session_warning();
                                      this.loadingMessage['message'] = LoadingMessage.COA_MAPPIN_IS_LOADING;
                                      this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
                                  }
                              });
                      }
                  }
                  else {
                      // we're re-mapping so no need to make the other API calls
                      this.company_service.getCoAMap()
                          .then(
                              data => {
                                  this.appComponent.session_warning();
                                  // assign all data into the array
                                  this.prepareMapData(data.result);
                                  this.showLoading = false;
                              }
                          )
                          .catch((error) => {
                              let errBody = JSON.parse(error._body);
                              if (this.common.sessionCheck(errBody.code)) {
                                  this.appComponent.session_warning();
                                  this.loadingMessage['message'] = LoadingMessage.COA_MAPPIN_IS_LOADING;
                                  this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
                              }
                          });
                  }
              }
          ).catch((error) => {
          let errBody = JSON.parse(error._body);
          if (this.common.sessionCheck(errBody.code)) {
              this.appComponent.session_warning();
              this.loadingMessage['message'] = LoadingMessage.UPDATE_COMPANY_META;
              this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
          }
      });
  }
  goBack() {
      if((this.account_status === AppConstants.SETUP_STATUS_COMPLETE) && this.common.checkAccountType(this.type)){
          this.router.navigate([NavigateToScreen.dashboard]);
      } else {
          if (this.type == "upload") {
              this.router.navigate([NavigateToScreen.csv]);
          }else{
              this.router.navigate([NavigateToScreen.sync]);
          }
      }

  }
    /**
     * Map the selected values
     *
     * @param index
     * @param event
     * @param options
     */
    changeMap(index, event, options) {
        let tag_id = event;

        for (let i = 0; i < options.length; i++) {
            if (options[i].tag_id == tag_id) {
                this.fields[index].espresso_account_id = tag_id;
                this.fields[index].espresso_account_name = options[i].description;
            }
        }
    }

    // prepares the data the comes back from the server for display. This is a quick and dirty fix to workaround an issue we ran into on the backend.
    // we will resolve in phase 2. #todo
    prepareMapData(data) {
        // sort
        this.fields = data.sort(function(a, b) {
                        if(a.cust_account_name == b.cust_account_name)
                            return 0;
                        if(a.cust_account_name < b.cust_account_name)
                            return -1;
                        if(a.cust_account_name > b.cust_account_name)
                            return 1;
                    });

        // add original index so when we group them we still know where to update in the orginal fields array.
        for(var i = 0; i < this.fields.length; i++) {
            this.fields[i]["model_index"] = i;
        }

        // group by tag_group
        for(var i = 0; i < this.fields.length; i++) {
            if(this.fields[i].tag_group == 'asset') {
                this.assets.push(this.fields[i]);
            }
            else if(this.fields[i].tag_group == 'liability') {
                this.liabilities.push(this.fields[i]);
            }
            else if(this.fields[i].tag_group == 'equity') {
                this.equity.push(this.fields[i]);
            }
            else if(this.fields[i].tag_group == 'income') {
                this.income.push(this.fields[i]);
            }
            else if(this.fields[i].tag_group == 'expense') {
                this.expenses.push(this.fields[i]);
            }
        }
    }

    /**
     * Submit entery and folow next step
     */
    submitEntry() {
        this.showLoading = true;
        this.form_changed = false;
        //remove unwanted fields
        let params = [];
        for (let i of this.fields) {
            //push into the parameters
            params.push({
                "company": i.company,
                "cust_account_id": i.cust_account_id,
                "cust_account_name": i.cust_account_name,
                "espresso_account_id": i.espresso_account_id,
                "espresso_account_name": i.espresso_account_name
            });
        }

        //Post request to the CoAMaP api
        this.loadingMessage['message'] = LoadingMessage.SAVE_COA_MATCHINGS;
        this.company_service.postCoAMap(params)
            .then(data => {
                if (data) {
                    this.ifSuccess = true;
                    // if we're not remapping, and if we're dealing with QBO sync type, then we need to get the trial balance. In all other cases, we expect the TB to be uploaded via CSV, or from QBD sync app.
                    if(!this.remap && this.common.checkAccountType(this.type) && this.common.checkAccountSyncType(this.sync_type)) {
                        this.loadingMessage['message'] = LoadingMessage.LOADING_TB;
                        this.company_service.getTrialBalance()
                            .then(
                                response => {
                                    this.appComponent.session_warning();
                                    // this.common.debuglog(response)
                                    this.loadingMessage['message'] = LoadingMessage.PROCESSING_FINANCIALS;
                                    this.company_service.getGenerateStatements()
                                        .then(response => {
                                            this.appComponent.session_warning();
                                            this.common.debuglog('########### AS RESPONSE');
                                            this.common.debuglog(response.result);
                                            let credit_debit= response.result['credit_debit_unequals'] ? response.result['credit_debit_unequals'] : [];
                                            if (credit_debit.length > 0) {
                                                for (let i = 0; i < credit_debit.length; i++){
                                                    if (this.company_metadate == credit_debit[i]){
                                                        localStorage.setItem('credit_debit', 'yes');
                                                    }
                                                }
                                            }
                                           // redirect to report page
                                           this.router.navigate([NavigateToScreen.coa_match_confimation, this.type]);
                                           this.showLoading = false;
                                        })
                                        .catch((error) => {
                                            let errBody = JSON.parse(error._body);
                                            if (this.common.sessionCheck(errBody.code)) {
                                                this.appComponent.session_warning();
                                                this.loadingMessage['message'] = LoadingMessage.LOADING_GENERATE_STATEMENTS;
                                                this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
                                            }
                                        });
                                }
                            )
                            .catch((error) => {
                                let errBody = JSON.parse(error._body);
                                if (this.common.sessionCheck(errBody.code)) {
                                  if (errBody.message === ErrorMessage.NO_CONNECTION) {
                                    window.location.href = environment.api.url + NavigateToScreen.qbo + localStorage.getItem('company');
                                  } else {
                                    this.appComponent.session_warning();
                                    this.loadingMessage['message'] = LoadingMessage.LOADING_TB;
                                    this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
                                  }
                                }
                            });
                    } else {
                        // generate statement and go to confirmation form
                        this.company_service.getGenerateStatements()
                            .then(response => {
                                this.appComponent.session_warning();
                                this.common.debuglog('AS RESPONSE');
                                this.common.debuglog(response.result);
                                let credit_debit= response.result['credit_debit_unequals'] ? response.result['credit_debit_unequals'] : [];
                                if (credit_debit.length > 0) {
                                    for (let i = 0; i < credit_debit.length; i++){
                                        if (this.company_metadate == credit_debit[i]){
                                            localStorage.setItem('credit_debit', 'yes');
                                        }
                                    }
                                }
                                // show the confirmation form
                                this.showLoading = false;
                                this.common.debuglog('generating from submit entry statements');
                                this.router.navigate(['coa-match-confirm', this.type]);
                            })
                            .catch((error) => {
                                let errBody = JSON.parse(error._body);
                                if (this.common.sessionCheck(errBody.code)) {
                                    this.appComponent.session_warning();
                                    this.loadingMessage['message'] = LoadingMessage.LOADING_GENERATE_STATEMENTS;
                                    this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
                                }

                            });
                    }
                } else {
                    this.ifError = true;
                    this.showLoading = false;
                }
            })
            .catch((error) => {
                let errBody = JSON.parse(error._body);
                if (this.common.sessionCheck(errBody.code)) {
                    this.appComponent.session_warning();
                    this.loadingMessage['message'] = LoadingMessage.SAVE_COA_MATCHINGS;
                    this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
                }
            });

    }

    /**
     * Save Exit
     */
    submit() {
        let params = [];
        for (let i of this.fields) {
            params.push({
                "company": i.company,
                "cust_account_id": i.cust_account_id,
                "cust_account_name": i.cust_account_name,
                "espresso_account_id": i.espresso_account_id,
                "espresso_account_name": i.espresso_account_name
            });
        }

        this.company_service.postCoAMap(params)
            .then(data => {
                this.appComponent.addToast(AppConstants.SUCCESS_RESPONSE, '', LoadingMessage.SAVE_CHANGES_SUCCESS);
            })
            .catch((error) => {
                let errBody = JSON.parse(error._body);
                if (this.common.sessionCheck(errBody.code)) {
                    this.appComponent.session_warning();
                    this.loadingMessage['message'] = LoadingMessage.SAVE_COA_MATCHINGS;
                    this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
                }

            });

    }

    saveExit(){
        let coamap = [];
        for (let i of this.fields) {
            coamap.push({
                "company": i.company,
                "cust_account_id": i.cust_account_id,
                "cust_account_name": i.cust_account_name,
                "espresso_account_id": i.espresso_account_id,
                "espresso_account_name": i.espresso_account_name
            });
        }
        
        this.showLoading = true;
        this.loadingMessage['message'] = LoadingMessage.SAVE_COA_MATCHINGS;
        this.company_service.postCoAMap(coamap)
            .then(data => {
                this.appComponent.addToast(AppConstants.SUCCESS_RESPONSE, '', LoadingMessage.SAVE_CHANGES_SUCCESS);
                
                let params = {last_page: '/'+NavigateToScreen.coa_match+'/' + this.type};
                this.company_service.updateCompanyMetadata(params)
                    .then(
                        data => {
                            this.auth_service.logout();
                            this.router.navigate(['/']);
                            this.appComponent.reset();
                        }
                    )
                    .catch((error) => {
                        let errBody = JSON.parse(error._body);
                        if (this.common.sessionCheck(errBody.code)) {
                            this.appComponent.session_warning();
                            this.showLoading = false;
                            return errBody.message;
                        }

                    });
            })
            .catch((error) => {
                let errBody = JSON.parse(error._body);
                if (this.common.sessionCheck(errBody.code)) {
                    this.appComponent.session_warning();
                    this.loadingMessage['message'] = LoadingMessage.SAVE_COA_MATCHINGS;
                    this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
                }

            });            
    }

    search() {
        this.common.debuglog(this.searchtext);
        if (!this.searchtext) {
            this.err = false;
        }
        $.expr[':'].contains = function(a, i, m) {
            return $(a).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
        };
        var pos = $("div>label:contains("+this.searchtext+")").offset() || $("div>select:contains("+this.searchtext+")").offset();
        if (pos) {
             $("div>select option:contains("+this.searchtext+"):first()").prop("selected","selected");
            this.err = false;
            $('html, body').animate({scrollTop: pos.top - 160}, 'slow');
        }else {
            this.err = true;
        }
    }
    ngOnDestroy() {
        this.session.unsubscribe();
    }
    formChanged() {
        this.form_changed = true;
    }
}
