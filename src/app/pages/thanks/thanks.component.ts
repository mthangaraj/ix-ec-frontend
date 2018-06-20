import {Component, OnInit} from '@angular/core';
import {CompanyService} from './../../services';
import {SignoffService} from './../../services';
import {CommonService} from "../../services";
import {AppConstants, ErrorCodes, LoadingMessage, NavigateToScreen} from '../../app.constants';
import {Router, ActivatedRoute} from '@angular/router';
import {AppComponent} from '../../app.component';

@Component({
    selector: 'app-thanks',
    templateUrl: './thanks.component.html',
    styleUrls: ['./thanks.component.css'],
    providers: [ CompanyService, SignoffService ]
})
export class ThanksComponent implements OnInit {
    showLoading: boolean = true;
    loadingMessage: any;
    params: any;
    //company_meta:any;

    constructor(private company_service: CompanyService,
                private signoff_service: SignoffService,
                private common: CommonService,
                private route: ActivatedRoute,
                private router: Router,
                private appComponent: AppComponent) {
        //var company_meta;

        this.loadingMessage = {
            'message': '',
            'error': ''
        }

        /*this.company_service.getCompanyMetadata().subscribe(
            data => {
                company_meta = data;
                this.common.debuglog('##### thanks component got company meta ');
                this.common.debuglog(data);
            }
        );
        company_meta = JSON.parse(localStorage.getItem('company_meta'));*/

        let params = {last_page: '/'+NavigateToScreen.thanks};
        // api call to set the metdata
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


        // #brad - we want them to go back to te dashboard next time they login, not back to the thank you page
    }

    goto_dashboard(){
        // force the sign off the monthly report that gets created during setup
        let company_meta = JSON.parse(localStorage.getItem('company_meta'));

        if (company_meta.is_initial_setup) {
            this.signoff_service.postForSigningOff()
                .then(
                    data => {
                        console.log("POST FOR SIGNING OFF ");
                        this.appComponent.session_warning();
                        this.common.debuglog('signed off on initial setup monthly report');
                        let params = {is_initial_setup: false, last_page: '/dashboard', accounting_setup_status: AppConstants.SETUP_STATUS_COMPLETE};
                        // api call to set the metdata
                        this.company_service.updateCompanyMetadata(params)
                            .then(data => {
                                this.appComponent.session_warning();
                                this.showLoading = false;
                                this.common.debuglog(data.result);
                                this.router.navigate([NavigateToScreen.dashboard]);
                            })
                            .catch((error) => {
                                let errBody = JSON.parse(error._body);
                                if (this.common.sessionCheck(errBody.code)) {
                                    this.appComponent.session_warning();
                                    this.loadingMessage['message'] = LoadingMessage.UPDATE_COMPANY_META;
                                    this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
                                }
                            });
                        this.showLoading = false;
                    }
                )
                .catch((error) => {
                    let errBody = JSON.parse(error._body);
                    if (this.common.sessionCheck(errBody.code)) {
                        this.appComponent.session_warning();
                        this.loadingMessage['message'] = LoadingMessage.SIGNING_OFF;
                        this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
                    }
                });
        }else{
            let params = {last_page: NavigateToScreen.dashboard};
            // api call to set the metdata
            this.company_service.updateCompanyMetadata(params)
                .then(data => {
                    this.appComponent.session_warning();
                    this.router.navigate([NavigateToScreen.dashboard]);
                })
                .catch((error) => {
                    let errBody = JSON.parse(error._body);
                    if (this.common.sessionCheck(errBody.code)) {
                        this.appComponent.session_warning();
                        this.loadingMessage['message'] = LoadingMessage.UPDATE_COMPANY_META;
                        this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
                    }

                });
        }
    }

    ngOnInit() {
        this.common.disableBrowseBackButton();
    }

}
