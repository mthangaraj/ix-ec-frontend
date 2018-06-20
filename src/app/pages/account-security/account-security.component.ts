import {Component, OnInit} from '@angular/core';
import {CompanyService} from './../../services';
import {AuthService} from './../../services';
import {CommonService} from "../../services";
import {AppConstants, ErrorCodes, ErrorMessage, LoadingMessage, NavigateToScreen} from '../../app.constants';
import {Router} from '@angular/router';
import {AppComponent} from '../../app.component';
import {URLSearchParams} from "@angular/http";
import {environment} from "../../../environments/environment";
import {isNullOrUndefined} from "util";

@Component({
  selector: 'app-account-security',
  templateUrl: './account-security.component.html',
  styleUrls: ['./account-security.component.css'],
  providers: []
})
export class AccountSecurityComponent implements OnInit {
  showLoading: boolean = false;
  loadingMessage: any;
  enable_security_block: boolean = true;
  set_security_block: boolean = false;
  security_code: string;
  secret_code: string ="";
  enforce_tfa_enabled: boolean = false;
  is_tfa_enabled: boolean = false;
  is_tfa_setup_completed: boolean = false;
  last_page: string;

  constructor(private common: CommonService, private auth: AuthService, private appComponent: AppComponent,
              private router: Router,
              private company: CompanyService) {
    let user = JSON.parse(localStorage.getItem('user'));
    this.enforce_tfa_enabled = user.enforce_tfa_enabled;
    this.is_tfa_setup_completed = user.is_tfa_setup_completed;
    this.is_tfa_enabled = user.is_tfa_enabled;
    if (this.is_tfa_setup_completed) {
      this.enable_security_block = false;
      this.set_security_block = false;
    }
  }

  ngOnInit() {
    this.common.disableBrowseBackButton();
  }

  enable_two_factor_auth() {
    this.enable_security_block = false;
    this.set_security_block = true;
    let username = this.common.getUserName();
    this.auth.getTwoFactorCode()
      .then(
        (response) => {
          if (response.status == AppConstants.SUCCESS_RESPONSE) {
            console.log(response);
            let secret_code = response.result.secret_code;
            this.security_code = 'otpauth://totp/' + username + '?secret=' + secret_code + '&issuer=' + AppConstants.SECURITY_ISSUER;
            
          } else {
            this.appComponent.addToast('error', 'Error', LoadingMessage.UNAUTHORIZED_ACCESS);
          }
        }
      )
      .catch((error) => {
        let errBody = JSON.parse(error._body);
        this.showLoading = false;
        this.appComponent.addToast('error', 'Error', LoadingMessage.UNAUTHORIZED_ACCESS);
      });
  }

  skip_2fa() {
    let data = {
      'is_tfa_enabled': false,
      'is_tfa_setup_completed': false
    };
    //this.auth.updateTwoFactorLogin(data).then((response) => {
      this.company.getCompanyMetadata()
        .then(
          meta => {
            this.last_page = meta.result.last_page;
            if (isNullOrUndefined(this.last_page)) {
              this.router.navigate([NavigateToScreen.intro]);
            } else {
              this.router.navigate([this.last_page]);
            }
          })
        .catch((error) => {
          let errBody = JSON.parse(error._body);
          this.appComponent.addToast('error', 'Error', ErrorMessage.INTERNAL_SERVER_ERROR);
          this.showLoading = false;
        });
    //}).catch((error) => {
    //  return false;
    //});
  }

  back_to_enable_2fa() {
    this.enable_security_block = true;
    this.set_security_block = false;
    let data = {
      'is_tfa_enabled': false,
      'is_tfa_setup_completed': false,
    };
    this.auth.updateTwoFactorLogin(data).then((response) => {
      let userinfo = JSON.parse(localStorage.getItem('user'));
      userinfo.is_tfa_enabled = false;
      userinfo.is_tfa_setup_completed = false;
      localStorage.setItem('user', JSON.stringify(userinfo));
    }).catch((error) => {
      console.log(error);
      let errBody = JSON.parse(error._body);
      if (errBody.code == ErrorCodes.VALIDATION_FAILED) {
        // this.message = ErrorMessage.INVALID_CREDENTIALS;
        this.appComponent.addToast('error', 'Error', ErrorMessage.INCORRECT_TOTP);
      } else {
        if (errBody.code === ErrorCodes.USER_COMPANY) {
          this.appComponent.addToast('error', 'Error', ErrorMessage.USER_COMPANY);
        } else {
          this.appComponent.addToast('error', 'Error', ErrorMessage.INTERNAL_SERVER_ERROR);
        }
      }
    });
  }

  code_verification() {
    let code = {'code': this.secret_code};
    this.auth.checckTwoFactorCode(code)
      .then(
        (data) => {
          if (data.status == AppConstants.SUCCESS_RESPONSE) {
            let data = {
              'is_tfa_enabled': true,
              'is_tfa_setup_completed': true
            };
            this.auth.updateTwoFactorLogin(data).then((response) => {
              let userinfo = JSON.parse(localStorage.getItem('user'));
              userinfo.is_tfa_enabled = true;
              userinfo.is_tfa_setup_completed = true;
              localStorage.setItem('user', JSON.stringify(userinfo));


              this.company.getCompanyMetadata()
                .then(
                  meta => {
                    this.last_page = meta.result.last_page;
                    if (isNullOrUndefined(this.last_page)) {
                      this.router.navigate([NavigateToScreen.intro]);
                    } else {
                      this.router.navigate([this.last_page]);
                    }
                    if( !this.is_tfa_setup_completed){
                        this.appComponent.addToast('success', '', LoadingMessage.CONFIGURATION_2FA_SUCCESS);

                    }
                  })
                .catch((error) => {
                  let errBody = JSON.parse(error._body);
                  this.appComponent.addToast('error', 'Error', ErrorMessage.INTERNAL_SERVER_ERROR);
                  this.showLoading = false;
                });


            }).catch((error) => {
              return false;
            });
          } else {
            this.appComponent.addToast('error', 'Error', ErrorMessage.INCORRECT_TOTP);
            return false;
          }
        }
      )
      .catch((error) => {
        console.log(error);
        let errBody = JSON.parse(error._body);
        if (errBody.code == ErrorCodes.VALIDATION_FAILED) {
          // this.message = ErrorMessage.INVALID_CREDENTIALS;
          this.appComponent.addToast('error', 'Error', ErrorMessage.INCORRECT_TOTP);
        } else {
          if (errBody.code === ErrorCodes.USER_COMPANY) {
            this.appComponent.addToast('error', 'Error', ErrorMessage.USER_COMPANY);
          } else {
            this.appComponent.addToast('error', 'Error', ErrorMessage.INTERNAL_SERVER_ERROR);
          }
        }
      });
  }

}
