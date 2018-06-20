import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {CommonService} from '../../services';
import { CompanyService } from './../../services';
import {AppConstants, NavigateToScreen, LoadingMessage, ErrorCodes} from '../../app.constants';
import {AuthService} from '../../services/auth.service';
import {AppComponent} from '../../app.component';

/* 
   #bradj - it was necessary to declare the CompanyService provider here to ensure the constructor gets called, 
            even though it's already added in app.component.ts @NgModule section. Why??
*/
@Component({
  selector: 'app-intro',
  templateUrl: './intro.component.html',
  styleUrls: ['./intro.component.css'],
  providers: [ CompanyService ]
})
export class IntroComponent implements OnInit {
    showLoading: boolean = true;
    loadingMessage: any;
    username;
    companyName;
    user = false;
  constructor(private router: Router,
              private company_service: CompanyService,
              private common: CommonService,
              private auth_servcie: AuthService,
              private appComponent: AppComponent) {
    // let lets_start = localStorage.getItem('lets_start');
    // if (lets_start == 'true') {
    //   this.router.navigate(['/sync']);
    // }
      this.loadingMessage = {
          'message': '',
          'error': ''
      };

       let params = {last_page: '/intro'};
        //api call to set the metdata for last page
        this.common.debuglog('in /intro ' + localStorage.getItem('company'));
        
        this.company_service.updateCompanyMetadata(params)
            .then(data => {
                this.appComponent.session_warning();
                this.common.debuglog('meta data response in /intro is ');
                this.common.debuglog(data.result);
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


  }

  show() {
      this.user = !this.user;
  }

  ngOnInit() {
      this.username = this.common.getUserName();
      this.companyName = this.common.getCompanyName();
      this.common.disableBrowseBackButton();
  }

  /**
   * Let's get started :)
   */
  letStart() {

     // localStorage.clear();
      this.showLoading = true;
    let params = { accounting_setup_status: AppConstants.SETUP_STATUS_IN_PROGRESS};
    //api call to set the metdata 
    this.company_service.updateCompanyMetadata(params)
        .then(data => {
            this.appComponent.session_warning();
            this.showLoading = false;
            localStorage.setItem('company_meta', JSON.stringify(data.result));
            this.router.navigate([NavigateToScreen.sync]);
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
