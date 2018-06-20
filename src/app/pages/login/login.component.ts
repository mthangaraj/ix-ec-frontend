import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {environment} from './../../../environments/environment';
import {ReportingService, CommonService} from '../../services';
import {AppConstants, NavigateToScreen, ErrorCodes, ErrorMessage, LoadingMessage} from './../../app.constants';
import {AppComponent} from '../../app.component';
import {PushNotificationsService} from 'angular2-notifications';
import {URLSearchParams} from '@angular/http';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    providers: [ReportingService, AuthService]
})
export class LoginComponent implements OnInit {
    showLoading: boolean = false;
    public loadingMessage: any;
    initial = true;
    forgot: boolean;
    new: boolean;
    code: boolean;
    user = {
        username: '',
        password: ''
    };

    message = '';
    title_message: string;
    error: string;
    is_password_reset:boolean;

    constructor(private authService: AuthService,
                private reporting_service: ReportingService,
                private router: Router,
                private common: CommonService,
                private appComponent: AppComponent,
                private _pushNotifications: PushNotificationsService
    ) {

        // Message will display if debug mode is enable
        this.common.debuglog('login constructor. clearing localstorage');
        localStorage.clear();
        sessionStorage.clear();
        // flushing local storage on login because some data appears to be carrying forward. need to figure out why. #todo #brad
        if (this.authService.isLoggedIn()) {
            let user = JSON.parse(localStorage.getItem('user'));
            if (user.enforce_tfa_enabled || user.is_tfa_enabled) {
              this.router.navigate([NavigateToScreen.account_security]);
            } else {
              this.router.navigate([NavigateToScreen.intro]);
            }
        }

        this.loadingMessage = {
            'message': '',
            'error': ''
        };
    }

    ngOnInit() {
        this.common.disableBrowseBackButton();
    }

    /**
     * Login handler
     */
    login() {
        this.appComponent.remove();
        localStorage.clear();
        sessionStorage.clear();
        this.showLoading = true;
        this.authService.login(this.user)
            .then(
                (data) => {
                    if (data.status == AppConstants.SUCCESS_RESPONSE) {
                        let urlParams = new URLSearchParams();
                        urlParams.append('username', this.user.username);
                        urlParams.append('password', this.user.password);
                        urlParams.append('client_id', environment.api.client_id);
                        urlParams.append('client_secret', environment.api.client_secret);
                        urlParams.append('grant_type', 'password');
                        this.getAuthToken(data, urlParams.toString());
                    }

                    // this.showLoading = false;
                }
            )
            .catch((error) => {
                let errBody = JSON.parse(error._body);
                this.showLoading = false;
                if (errBody.code == ErrorCodes.INVALID_CREDENTIALS) {
                    // this.message = ErrorMessage.INVALID_CREDENTIALS;
                    this.appComponent.addToast('error', 'Error', ErrorMessage.INVALID_CREDENTIALS);
                } else {
                    if (errBody.code === ErrorCodes.USER_COMPANY) {
                        this.appComponent.addToast('error', 'Error', ErrorMessage.USER_COMPANY);
                    } else {
                        this.appComponent.addToast('error', 'Error', ErrorMessage.INTERNAL_SERVER_ERROR);
                    }
                }
            });
    }


    /**
     * Get Auth Token handler
     */
    getAuthToken(data, params){

        this.authService.getToken(params)
            .then(
                (response) => {
                    let current_date = new Date();
                    //Set the company into the localstorage
                    this.is_password_reset = data.result.is_password_reset;
                    localStorage.setItem('user', JSON.stringify(data.result));
                    localStorage.setItem('company', data.result.company.id);
                    localStorage.setItem('accounting_type', data.result.company.accounting_type);
                    localStorage.setItem('token', response.access_token);
                    localStorage.setItem('refresh', response.refresh_token);
                    localStorage.setItem('session_timing', data.result.session_expiry_timeout);
                    sessionStorage.setItem('company', data.result.company.id);
                    this.appComponent.session_warning();
                    this.getUserRole(data.result);
                }
            )
            .catch((error) => {
                let errBody = JSON.parse(error._body);
                this.showLoading = false;
                // this.message = LoadingMessage.UNAUTHORIZED_ACCESS;
                this.appComponent.addToast('error', 'Error', LoadingMessage.UNAUTHORIZED_ACCESS);
                // this.loadingMessage['message'] = LoadingMessage.COMPANY_META_SETUP;
                // this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
            });
    }

    /**
     * Get User Role handler
     */
    getUserRole(data){
        // get user role - client or admin
        this.authService.getRole()
            .then(
                (response) => {
                    if(response.status == AppConstants.SUCCESS_RESPONSE){
                        this.appComponent.session_warning();
                        if (response.result.role == AppConstants.USER_ROLE_ADMIN) {
                            this._pushNotifications.requestPermission();
                            this.router.navigate([NavigateToScreen.admin_company_search_component]);
                            // this.showLoading = false;

                        }else{

                            // #brad keeping all meta data to be used on various pages in the app.
                            // #todo: the meta data changes through the apps usage so watch out that this doesn't get out of sync for the current session.

                            localStorage.setItem('company_meta', JSON.stringify(data.company.metadata));

                            if (data.company.metadata.accounting_setup_status !== AppConstants.SETUP_STATUS_COMPLETE) {

                                if (data.company.metadata.accounting_setup_status === AppConstants.SETUP_STATUS_NOT_STARTED ) {
                                    // #brad creating a monthly report for the setup process
                                    this.common.debuglog('found company during accounting setup @login page ' + localStorage.getItem('company'));

                                    this.addMonthlyReportForCurrentPeriod(data);
                                }
                                else {
                                    var path = [data.company.metadata.last_page];
                                    // this.showLoading = false;
                                    this._pushNotifications.requestPermission();
                                    if(this.is_password_reset){
                                        this.router.navigate([NavigateToScreen.change_password]);
                                    }else {
                                      let user = JSON.parse(localStorage.getItem('user'));
                                      if (user.enforce_tfa_enabled || user.is_tfa_enabled) {
                                        this.router.navigate([NavigateToScreen.account_security]);
                                      } else {
                                        this.router.navigate(path);
                                      }
                                    }
                                }
                            }else{
                                // this.showLoading = false;
                                this._pushNotifications.requestPermission();
                                if(this.is_password_reset){
                                    this.router.navigate([NavigateToScreen.change_password]);
                                }else {
                                  let user = JSON.parse(localStorage.getItem('user'));
                                  if (user.enforce_tfa_enabled || user.is_tfa_enabled) {
                                    this.router.navigate([NavigateToScreen.account_security]);
                                  } else {
                                    this.router.navigate([NavigateToScreen.dashboard]);
                                  }

                                }
                            }
                        }
                    }
                }
            )
            .catch((error) => {
                this.appComponent.reset();
                let errBody = JSON.parse(error._body);
                // this.message = errBody.message;
                this.appComponent.addToast('error', 'Error', errBody.message);
                this.showLoading = false;
            });
    }

    /**
     * add the monthly report if not exist.
     */
    addMonthlyReportForCurrentPeriod(data){
        this.showLoading = true;
        this.reporting_service.postMonthlyReportForCurrentPeriod(data.company.id, localStorage.getItem('token'))
            .then(
                (response) => {
                    this.appComponent.session_warning();
                    this.common.debuglog('created a new monthly report ' + JSON.stringify(response.result));
                    // this.showLoading = false;
                    this._pushNotifications.requestPermission();

                    if(this.is_password_reset){
                        this.router.navigate([NavigateToScreen.change_password]);
                    }else{
                        let user = JSON.parse(localStorage.getItem('user'));
                        if (user.enforce_tfa_enabled || user.is_tfa_enabled) {
                          this.router.navigate([NavigateToScreen.account_security]);
                        } else {
                          this.router.navigate([NavigateToScreen.intro]);
                        }
                    }
            }
            )
            .catch((error) => {
            this.appComponent.reset();
                let errBody = JSON.parse(error._body);
                this.showLoading = false;
                if (errBody.code === ErrorCodes.MISSING_META_CURRENT_PERIOD) {
                    this.appComponent.addToast('error', 'Error', this.common.getErrorMessage(errBody.code));
                }else {
                    if (errBody.code === ErrorCodes.NO_META_DATA) {
                        this.appComponent.addToast('error', 'Error', ErrorMessage.NO_META_DATA);

                    }else {
                        this.appComponent.addToast('error', 'Error', errBody.message);
                    }
                }
            });
    }
}
