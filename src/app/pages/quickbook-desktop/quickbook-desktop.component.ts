import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {DomSanitizer} from '@angular/platform-browser';
import {CompanyService, AuthService} from './../../services';
import {environment} from './../../../environments/environment';
import {ErrorCodes, LoadingMessage, NavigateToScreen} from '../../app.constants';
import {CommonService} from "../../services";
import {AppComponent} from '../../app.component';

@Component({
    selector: 'app-quickbook-desktop',
    templateUrl: './quickbook-desktop.component.html',
    styleUrls: ['./quickbook-desktop.component.css'],
    providers: [ CompanyService, AuthService ]
})
export class QuickbookDesktopComponent implements OnInit {
    showLoading: boolean = false;
    appInstalled: boolean = false;
    qbd_app_uri;
    user_data;
    loadingMessage: any;
    username;
    companyName;
    constructor(public router: Router, private company_service: CompanyService,
                private auth_service: AuthService, private sanitizer: DomSanitizer,
                private common: CommonService, private appComponent: AppComponent) {
        this.username = this.common.getUserName();
        this.companyName = this.common.getCompanyName();
        let params = {last_page: '/'+NavigateToScreen.qbd};
        //api call to set the metdata
        this.company_service.updateCompanyMetadata(params)
            .then(
                data => {
                    this.appComponent.session_warning();
                    this.showLoading = false;
                }
            )
            .catch((error) => {
                let errBody = JSON.parse(error._body);
                if (this.common.sessionCheck(errBody.code)) {
                    this.loadingMessage['message'] = LoadingMessage.UPDATE_COMPANY_META;
                    this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
                }
            });

        this.company_service.getCompanyMetadata().then(
            data => {
                this.appComponent.session_warning();
                if (data.result.qb_desktop_installed == true) {
                    this.user_data = JSON.parse(localStorage.getItem('user'));
                    this.common.debuglog('########## user data is '+JSON.stringify(this.user_data));
                    this.appInstalled = true;
                    // this is needed to avoid the unsafe URL error that angular raises.
                    this.qbd_app_uri = this.sanitizer.bypassSecurityTrustUrl('espresso:'+this.user_data.username+','+data.result.monthly_reporting_current_period);
                }
                this.showLoading = false;
            }
        ).catch((error) => {
            let errBody = JSON.parse(error._body);
            if (this.common.sessionCheck(errBody.code)) {
                this.appComponent.session_warning();
                this.loadingMessage['message'] = LoadingMessage.GET_COMPANY_META;
                this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
            }
        });
    }

    /**
     * download app
     */

    download() {
        // #brad - removing hardcoded URL
        window.location.href = environment.api.url+'/lend/downloadqbd/';
    }

    /**
    * open app and then route to coa-match
    */
    openApp() {
        this.router.navigate([NavigateToScreen.coa_match, NavigateToScreen.qbd]);
    }

    /**
     * Save Exit
     */
    saveExit(){
        this.appComponent.reset();
        this.auth_service.logout();
        this.router.navigate(['/']);
    }

    ngOnInit() {
        this.common.disableBrowseBackButton();
    }
    goBack(){
        this.router.navigate([NavigateToScreen.sync]);
    }

}
