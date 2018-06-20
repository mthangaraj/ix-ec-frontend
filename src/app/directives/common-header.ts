import {Component, OnInit} from '@angular/core';
import {AppComponent} from '../app.component';
import {CommonService} from "../services/common.service";
import {ActivatedRoute, Router} from '@angular/router';
import {ErrorCodes, ErrorMessage, LoadingMessage, NavigateToScreen} from "../app.constants";
import {AuthService} from "../services/auth.service";

@Component({
  selector: 'static-header',
  templateUrl: '../common/common-header.component.html',
  styles: [
      `
    `
  ]
})
export class CommonHeaderDirective implements OnInit {
  username: string;
  companyName: string;
  user: boolean = false;
  is_tfa_enabled: boolean = false;
  enforce_tfa_enabled: boolean = false;
  is_security_page:boolean = false;
  constructor(private common: CommonService, private router: Router,
              private appComponent: AppComponent, private auth_servcie: AuthService) {
    if(this.router.url === '/account-security'){
      this.is_security_page = true;
    }

  }

  ngOnInit() {
    this.username = this.common.getUserName();
    this.companyName = this.common.getCompanyName();
    this.common.disableBrowseBackButton();
    let userinfo = JSON.parse(localStorage.getItem('user'));
    this.is_tfa_enabled = userinfo.is_tfa_enabled && userinfo.is_tfa_setup_completed;
    this.enforce_tfa_enabled = userinfo.enforce_tfa_enabled;
  }

  show() {
    this.user = !this.user;
  }

  to_change_password() {
    this.router.navigate([NavigateToScreen.change_password]);
  }

  to_enable_tfa() {
    this.router.navigate([NavigateToScreen.account_security]);
  }

  to_disable_tfa() {
    this.is_tfa_enabled = false;
    let data = {
      'is_tfa_enabled': false,
      'is_tfa_setup_completed': false
    };
    this.auth_servcie.updateTwoFactorLogin(data).then((response) => {
      let userinfo = JSON.parse(localStorage.getItem('user'));
      userinfo.is_tfa_enabled = false;
      userinfo.is_tfa_setup_completed = false;
      localStorage.setItem('user', JSON.stringify(userinfo));
      this.appComponent.addToast('success', 'Success', LoadingMessage.TFA_AUTH_DISABLED_SUCCESS);
    }).catch((error) => {
      let errBody = JSON.parse(error._body);
      if (errBody.code === ErrorCodes.MISSING_META_CURRENT_PERIOD) {
        this.appComponent.addToast('error', 'Error', this.common.getErrorMessage(errBody.code));
      } else {
        if (errBody.code === ErrorCodes.NO_META_DATA) {
          this.appComponent.addToast('error', 'Error', ErrorMessage.NO_META_DATA);

        } else {
          this.appComponent.addToast('error', 'Error', errBody.message);
        }
      }
    });
  }


  logOut() {
    this.appComponent.reset();
    this.auth_servcie.logout();
    this.router.navigate(['/']);
  }
}