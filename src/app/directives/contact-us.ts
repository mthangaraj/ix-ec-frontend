import { Component, OnInit, Input} from '@angular/core';
import {AppConstants, LoadingMessage} from '../app.constants';
import {CompanyService} from '../services/company.service';
import {CommonService} from '../services/common.service';
import {AppComponent} from '../app.component';

@Component({
    selector: 'contact-us',
    templateUrl: '../common/contact-us.component.html',
    styles: [
        `
        `
    ]
})
export class ContactUsDirective implements OnInit {
    @Input()
    showContact: boolean;


    espressoContacts: any = [];
    ecpressoContactCount: any;
    espressoContactNoData: string = "";
    loadingMessage: any;

    constructor(private company_service: CompanyService,
                private common: CommonService,
                private appComponent: AppComponent) {
        this.loadingMessage = {
            'message': '',
            'error': ''
        };
        // dynamically get the espresso contacts
        this.company_service.getEspressoContacts()
            .then(
                data => {
                    if (data.status === AppConstants.SUCCESS_RESPONSE){
                        this.appComponent.session_warning();
                        if (data.result) {
                            this.ecpressoContactCount = Object.keys(data.result).length;
                        }else {
                            this.ecpressoContactCount = 0;
                        }

                        if (this.ecpressoContactCount == 0){
                            this.espressoContactNoData = AppConstants.EC_CONTACT_NO_DATA;
                        }
                        this.espressoContacts = data.result;
                    }
                }
            )
            .catch((error) => {
                let errBody = JSON.parse(error._body);
                if (this.common.sessionCheck(errBody.code)) {
                    this.appComponent.session_warning();
                    this.loadingMessage['message'] = LoadingMessage.ESPRESSO_CONTACT;
                    this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
                }

            });
    }
    ngOnInit() {
console.log(this.showContact);
    }
}

