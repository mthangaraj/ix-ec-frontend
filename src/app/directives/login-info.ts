import {Component, OnInit, Input} from '@angular/core';
import {AppComponent} from '../app.component';
import {CommonService} from "../services/common.service";
import {Router, ActivatedRoute, NavigationStart} from '@angular/router';
import {ErrorCodes, ErrorMessage, LoadingMessage, NavigateToScreen} from "../app.constants";
import {AuthService} from "../services/auth.service";

@Component({
    selector: 'login-info',
    templateUrl: '../common/login-info.component.html',
    styles: [
        `
        `
    ]
})
export class LoginInfoDirective implements OnInit{

    setting_access:any;
    css:string = 'user';
    username:string;
    companyName:string;
    user:boolean = false;
    is_tfa_enabled: boolean = false;
    enforce_tfa_enabled: boolean = false;
    is_security_page:boolean = false;
    constructor(private common: CommonService, private router:Router,
                private route:ActivatedRoute,
                private appComponent:AppComponent, private auth_servcie: AuthService ){
        this.setting_access = this.appComponent.checkSettingAccess();
        if(!this.setting_access){
            this.css = '';
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

    to_change_password(){
        this.router.navigate([NavigateToScreen.change_password]);
    }

    to_enable_tfa() {
      this.router.navigate([NavigateToScreen.account_security]);
    }

    to_disable_tfa() {
      this.user = !this.user;
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
  togglemenu() {
    this.user = !this.user;
  }

    openNav() {
        document.getElementById("side-slide").style.width = "254px";
        document.getElementById("side-slide").style.marginLeft = "23px";
        document.getElementById("settings").style.backgroundColor = "#fff";
        document.getElementById("settings").style.color = "#0085CA";

        document.getElementById("menu-title").style.display = 'block';
        document.getElementById("overlay-content").style.display = 'block';

    }

    closeNav() {

        document.getElementById("menu-title").style.display = 'none';
        document.getElementById("overlay-content").style.display = 'none';
        document.getElementById("side-slide").style.width = "0%";
        document.getElementById("settings").style.backgroundColor = "#0085CA";
        document.getElementById("settings").style.color = "#fff";
    }
}