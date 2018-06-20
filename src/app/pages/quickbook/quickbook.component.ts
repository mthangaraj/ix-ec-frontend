import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {CommonService} from "../../services";
import { CompanyService, AuthService } from './../../services';
import {ErrorCodes, LoadingMessage} from '../../app.constants';

@Component({
    selector: 'app-quickbook',
    templateUrl: './quickbook.component.html',
    styleUrls: ['./quickbook.component.css'],
    providers: [ CompanyService, AuthService ]
})
export class QuickbookComponent implements OnInit {
    showLoading: boolean = true;
    loadingMessage:any;
    companyAccountingType;
    constructor(private company_service: CompanyService,
                private auth_service: AuthService,
                private router: Router,
                private common: CommonService) {
        let params = {last_page: '/qbook'};
        this.companyAccountingType = this.common.getAccountingType();
        this.loadingMessage = {
            'message':'',
            'error':''
        }
        //api call to set the metdata
        this.company_service.updateCompanyMetadata(params)
            .then(data => {
                this.common.debuglog(data.result)
                this.showLoading = false;
            })
            .catch((error) => {
                let errBody = JSON.parse(error._body);
                if (this.common.sessionCheck(errBody.code)) {
                    this.loadingMessage['message'] = LoadingMessage.UPDATE_COMPANY_META;
                    this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
                }
            });

    }

    /**
     * Save Exit
     */
    saveExit(){
        this.auth_service.logout();
        this.router.navigate(['/']);
    }

    ngOnInit() {
        this.common.disableBrowseBackButton();
    }

}
