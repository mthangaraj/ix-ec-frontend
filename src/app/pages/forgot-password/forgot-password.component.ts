import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {environment} from './../../../environments/environment';
import {ReportingService, CommonService} from '../../services';
import {AppConstants, NavigateToScreen, ErrorCodes, ErrorMessage, LoadingMessage} from './../../app.constants';
import {AppComponent} from '../../app.component';
import {CompanyService} from "../../services/company.service";
import {isNullOrUndefined} from "util";

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
    showLoading = false;
    public loadingMessage: any;
    id: Array<String>;
    identifier: any;
    passcode = {
        password: '',
        reenter_password: ''
    };
    initial: boolean;
    show: boolean;
    message = '';
    success: boolean;
    title_message: string;
    change_password: boolean;
    error: string;
    last_page:string;
    is_password_reset_enabled:boolean = false;

    public account = {
        password: <string>null
    };
    public barLabel: string = "Password strength:";
    public myColors = ['#DD2C00', '#FF6D00', '#FFD600', '#AEEA00', '#00C853'];

    public width = 0;
    private value:string;
    public pwd_strong_message:string = "Password must be at least 8 characters";
    private symbool:object = {'isit':'false'};
    private nucbool:object = {'isit':'false'};
    private nlcbool:object = {'isit':'false'};
    private numbool:object = {'isit':'false'};
    private lengthbool:object = {'isit':'false'};
    private password_status:string = "";
    public custom_css:string = 'left-block';


    constructor(private authService: AuthService,
                private router: Router,
                private common: CommonService,
                private appComponent: AppComponent,
                private company: CompanyService) {
        this.loadingMessage = {
            'message' : '',
            'error' : ''
        };
    }

  ngOnInit() {

      this.lengthbool['isit'] = false;
      this.symbool['isit'] = false;
      this.nucbool['isit'] = false;
      this.numbool['isit'] = false;
      this.nlcbool['isit'] = false;

      this.id = (this.router.url).split('/');
      this.identifier = {
          hashed_id: this.id[2]
      };
      if(!isNullOrUndefined(this.identifier.hashed_id)) {
          this.showLoading = true;
          this.validatelink();
          this.is_password_reset_enabled = true;
      }else{
          this.is_password_reset_enabled = this.common.checkIsPasswordRestEnabled();
          this.initial = true;
          this.custom_css = 'left-block';
          this.show = false;
      }
  }

    validatelink()  {

        this.authService.validatelink(this.identifier.hashed_id)
            .then(
                (response) => {
                    if (response.status === AppConstants.SUCCESS_RESPONSE) {
                        this.initial = true;
                        this.show = false;
                        this.showLoading = false;
                    }
                })
            .catch((error) => {
                let errBody = JSON.parse(error._body);
                if (errBody.code === ErrorCodes.TOKEN_EXPIRED){
                    this.initial = false;
                    this.custom_css = '';
                    this.show = true;
                    this.showLoading = false;
                } else {
                    this.appComponent.addToast('error', 'Error', ErrorMessage.INTERNAL_SERVER_ERROR);
                    this.showLoading = false;
                }
            });
    }
    changepassword_back(){
      this.showLoading = true;
        this.company.getCompanyMetadata()
            .then(
                meta => {
                  this.showLoading = false;
                    this.last_page = meta.result.last_page;
                    this.router.navigate([this.last_page]);
                })
            .catch((error) => {
                let errBody = JSON.parse(error._body);
                this.appComponent.addToast('error', 'Error', ErrorMessage.INTERNAL_SERVER_ERROR);
                this.showLoading = false;
            });
    }
    /*
    Change Password Save
     */
    changepassword() {
        this.showLoading = true;
        this.passcode.password = this.passcode.password.trim();
        this.passcode.reenter_password = this.passcode.reenter_password.trim();

        if(this.lengthbool['isit'] && this.symbool['isit'] && this.nucbool['isit'] && this.nlcbool['isit']
                && this.numbool['isit']) {
            if (this.passcode.password === this.passcode.reenter_password) {
                if (this.passcode.password) {
                    if (isNaN(Number(this.passcode.password))) {
                        this.change_password = true;
                    }else {
                        this.showLoading = false;
                        this.appComponent.addToast('error', 'Error',  ErrorMessage.NUMERIC_PASSWORD);
                    }
                } else {
                    this.showLoading = false;
                    this.appComponent.addToast('error', 'Error',  ErrorMessage.EMPTY_PASSWORD);
                }
            } else {
                this.showLoading = false;
                this.appComponent.addToast('error', 'Error', ErrorMessage.SAME_PASSWORD);
            }
        }else {
            this.showLoading = false;
            this.appComponent.addToast('error', 'Error',  ErrorMessage.PASSWORD_POLICY_NOT_CONTAINS);

        }
        if (this.change_password){
            if(isNullOrUndefined(this.identifier.hashed_id)){
                let user_id = this.common.getUserId();
                let credentials = {'id':user_id, 'passcode':this.passcode};
                this.authService.changepassword(credentials)
                    .then(
                        (data) => {
                            if (data.status === AppConstants.SUCCESS_RESPONSE) {
                                this.success = true;
                                this.initial = false;
                                this.custom_css = '';
                                localStorage.clear();
                                this.appComponent.remove();
                                this.router.navigate([NavigateToScreen.login]);
                                this.appComponent.addToast('success', '',  LoadingMessage.PASSWORD_CHANGE_SUCCESS);
                            }
                            this.showLoading = false;
                        }
                    )
                    .catch((error) => {
                        let errBody = JSON.parse(error._body);
                        this.appComponent.addToast('error', 'Error', ErrorMessage.INTERNAL_SERVER_ERROR);
                        this.showLoading = false;
                    });

            }else {
                localStorage.clear();
                this.appComponent.remove();
                this.authService.resetpassword(this.passcode, this.identifier.hashed_id)
                    .then(
                        (data) => {
                            if (data.status === AppConstants.SUCCESS_RESPONSE) {
                                this.success = true;
                                this.initial = false;
                                this.custom_css = '';
                            }
                            this.showLoading = false;
                        }
                    )
                    .catch((error) => {
                        let errBody = JSON.parse(error._body);
                        this.appComponent.addToast('error', 'Error', ErrorMessage.INTERNAL_SERVER_ERROR);
                        this.showLoading = false;
                    });
            }
        }
    }

    onKey(event: any) {
        this.value = event.target.value;

        // Additions :-D
        let noc = this.value.length; // Number of Characters
        let nuc = this.value.replace(/[^A-Z]/g, "").length; // Uppercase Letters
        let nlc = this.value.replace(/[^a-z]/g, "").length; // Lowercase Letters
        let num = this.value.replace(/[^0-9]/g, "").length; // Numbers
        let symr:number;
        let sym = this.value.match(/[ !@#$£%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g); // Symbols
        if(!sym) { symr = 0 } else { symr = sym.length};

        // Deductions :-(
        let aucr:number; // Letters Only Resolver
        let auc = this.value === this.value.toUpperCase();
        if(auc == false) {aucr = noc} else {aucr = 0}; // Letters Only
        let anvr:number; // Number Only Resolver
        let anv = +this.value;  if(anv !== NaN || anv !== 0) {anvr = noc} else {anvr = 0}; // Numbers Only
        let cons:number; // Repeat Characters Resolver
        //if(this.value.match(/(.)\1\1/)) {cons = noc*noc} else {cons = 0} // Repeat Characters
        if(this.value.match(/(.)\1\1/)) {cons = (noc*noc)%10} else {cons = 0} // Repeat Characters
        // The MF math
        let additions = ((noc*5)+((nuc)*10)+((nlc-nuc)*5)+(num*5)+((symr)*7));
        let deductions = ((aucr)+(anvr)+cons);
        let total = additions-deductions;
 
        if(this.value.length > 7){
            this.lengthbool['isit'] = true;
        }else{
            this.lengthbool['isit'] = false;
        }
        if(sym == null) {
            this.symbool['isit'] = false;
        } else {
            this.symbool['isit'] = true;
        }
        if (nuc == 0) {
            this.nucbool['isit'] = false;
        } else {
            this.nucbool['isit'] = true;
        }
        if (nlc == 0) {
            this.nlcbool['isit'] = false;
        } else {
            this.nlcbool['isit'] = true;
        }
        if (num == 0) {
            this.numbool['isit'] = false;
        } else {
            this.numbool['isit'] = true;
        }
    }
}
