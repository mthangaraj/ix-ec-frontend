import {Component, OnInit} from '@angular/core';
import {NavigationEnd, NavigationStart, RouteConfigLoadEnd, Router} from '@angular/router';
import {environment} from './../../../environments/environment';
import {CompanyService} from './../../services/company.service';
import * as moment from 'moment';
import {AppConstants, ErrorCodes, ErrorMessage, LoadingMessage, NavigateToScreen} from '../../app.constants';
import {CommonService} from "../../services";
import {AuthService} from '../../services/auth.service';
import {AppComponent} from '../../app.component';

@Component({
    selector: 'app-sync',
    templateUrl: './sync.component.html',
    styleUrls: ['./sync.component.css'],
    providers: [CompanyService]
})
export class SyncComponent implements OnInit {
    showLoading: boolean = false;
    loadingMessage: any;
    username;
    companyName;
    companyAccountingType;
    user = false;
    account_log: string = 'qb-logo.svg'
    desktop_enabled = true;
    csv_enabled = true;
    online_enabled = true;
    online_sync_account = 'QBO';
    loadingMessageClass: string; // once we fix the auto centering issue for these messages, this will no longer be needed. #todo #brad
    constructor(public router: Router,
                private company_service: CompanyService,
                private common: CommonService,
                private auth_servcie: AuthService,
                private appComponent: AppComponent) {
        // set last page value in metadata
        this.username = this.common.getUserName();
        this.companyName = this.common.getCompanyName();
        this.companyAccountingType = this.common.getAccountingType();
        let params = {last_page: '/sync'};
        this.company_service.updateCompanyMetadata(params)
            .then(data => {
                this.appComponent.session_warning();
            })
            .catch((error) => {
                let errBody = JSON.parse(error._body);
                if (this.common.sessionCheck(errBody.code)) {
                    this.showLoading = false;
                    return errBody.message;
                }
            });

        this.loadingMessage = {
            'message' : '',
            'error' : ''
        };

      if (this.companyAccountingType.toLowerCase() === AppConstants.XERO) {
        this.account_log = 'xero_logo.svg';
        this.online_sync_account = 'XERO';
        this.csv_enabled = false;
        this.desktop_enabled = false;
      }
      if (this.companyAccountingType.toLowerCase() === AppConstants.SAGE) {
        this.desktop_enabled = false;
        this.online_enabled = false;
      }
      this.router.events.subscribe((event) => {
          if (event instanceof NavigationEnd && event.url === '/sync/error') {
            this.appComponent.addToast('error', 'Error', ErrorMessage.MISSING_COMPANY_CONFIGURATION);
          }
        }
      );
    }

    ngOnInit() {
        this.common.disableBrowseBackButton();
    }
    show() {
        this.user = !this.user;
    }
    sync(type) {
        this.showLoading = true;
        let params = {
            monthly_reporting_sync_method: type,
            last_page: NavigateToScreen.sync
        };

      if (type == AppConstants.QBD_ACCOUNT_TYPE && !(this.companyAccountingType.toLowerCase() === AppConstants.QUICKBOOKS)) {
        this.appComponent.addToast('error', 'Error', ErrorMessage.INVALID_SYNC_TYPE);
        this.showLoading = false;
        return;
      }
      if ((type == AppConstants.QBO_ACCOUNT_TYPE || type == AppConstants.XERO_ACCOUNT_TYPE) && !(this.companyAccountingType.toLowerCase() === AppConstants.QUICKBOOKS || this.companyAccountingType.toLowerCase() === AppConstants.XERO)) {
        this.appComponent.addToast('error', 'Error', ErrorMessage.INVALID_SYNC_TYPE);
        this.showLoading = false;
        return;
      }
      if(type == AppConstants.CSV_ACCOUNT_TYPE && this.companyAccountingType.toLowerCase() === AppConstants.XERO) {
        this.appComponent.addToast('error', 'Error', ErrorMessage.INVALID_SYNC_TYPE);
        this.showLoading = false;
        return;
      }



        // redirect based on type
        this.company_service.updateCompanyMetadata(params)
            .then(data => {
                if (this.common.checkAccountSyncType(type)) {
                    let account_type = this.companyAccountingType.charAt(0).toUpperCase() + this.companyAccountingType.slice(1);
                    this.loadingMessage["message"] = "Redirecting to "+ account_type + " for Authentication.";
                    this.loadingMessageClass = 'msg_redir_to_qbo';
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

                } else if (type == AppConstants.MANUAL_ACCOUNT_TYPE) {
                    // Redirect to the manual
                    this.showLoading = false;
                    this.router.navigate([NavigateToScreen.manual]);
                }

            })
            .catch((error) => {
                let errBody = JSON.parse(error._body);
                if (this.common.sessionCheck(errBody.code)) {
                    this.loadingMessage['message'] = LoadingMessage.UPDATE_COMPANY_META;
                    this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
                }
            });
    }
    logOut() {
        this.appComponent.reset();
        this.auth_servcie.logout();
        this.router.navigate(['/']);
    }
}
