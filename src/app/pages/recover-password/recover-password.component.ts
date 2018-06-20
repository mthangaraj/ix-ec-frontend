import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AppConstants, ErrorCodes, ErrorMessage} from '../../app.constants';
import {AppComponent} from '../../app.component';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'app-recover-password',
  templateUrl: './recover-password.component.html',
  styleUrls: ['./recover-password.component.css']
})
export class RecoverPasswordComponent implements OnInit {
    showLoading: boolean = false;
    public loadingMessage: any;
    email = '';
    multiple: boolean = false;
    initial: boolean = true;
    show: boolean = false;
    constructor(public router: Router,
              private route: ActivatedRoute,
              private appComponent: AppComponent,
              private authService: AuthService) {
        this.loadingMessage = {
            'message': '',
            'error': ''
        };
    }

  ngOnInit() {
  }
    recoverpassword() {
        let flag;
        const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (this.email.match(regex)) {
            flag = true;
        } else {
            flag = false;
        }
        if (flag) {
            this.showLoading = true;
            let obj = {
                email: this.email
            };
            this.authService.recoverpassword(obj)
                .then(
                    (data) => {
                        if (data.status === AppConstants.SUCCESS_RESPONSE) {
                            this.showLoading = false;
                            this.initial = false;
                            this.show = true;
                            this.multiple = false;
                        }
                    })
                .catch((error) => {
                    let errBody = JSON.parse(error._body);
                    this.showLoading = false;
                    if (errBody.code === ErrorCodes.MULTIPLE_MAIL) {
                        this.multiple =  true;
                        this.initial = false;
                        this.show = false;
                    }else {
                        if (errBody.code === ErrorCodes.MAIL_NOT_FOUND) {
                           this.appComponent.addToast('error', 'Error', ErrorMessage.MAIL_NOT_FOUND);
                        }else {
                            this.appComponent.addToast('error', 'Error', ErrorMessage.INTERNAL_SERVER_ERROR);
                        }
                    }
                });
        } else {
            this.appComponent.addToast('error', 'Error', ErrorMessage.INVALID_MAIL);
        }
    }
}
