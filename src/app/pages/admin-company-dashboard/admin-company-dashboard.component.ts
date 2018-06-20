import {Component, ElementRef, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

import {CompanyService} from './../../services';
import {AppConstants, ErrorCodes, LoadingMessage} from '../../app.constants';
import {CommonService} from "../../services";
import {ScrollEvent} from "ngx-scroll-event";

@Component({
    selector: 'app-admin-company-dashboard',
    templateUrl: './admin-company-dashboard.component.html',
    styleUrls: ['./admin-company-dashboard.component.css']
})
export class AdminCompanyDashboardComponent implements OnInit {
    showLoading: boolean = true;
    income_statement: any = [];
    balance_sheet: any = [];
    company_name;
    company_id;
    next_reporting_peroid;
    espressoContacts: any = [];
    ecpressoContactCount: any;
    espressoContactNoData: string = "";
    loadingMessage: any;
    constructor(private company_service: CompanyService,
                private router: Router,
                private route: ActivatedRoute,
                private common: CommonService,
                private elRef:ElementRef) {

        //get parametes from route
        this.route.params.subscribe(params => {
            this.company_name = params.name;
            this.company_id = params.company_id;
        });

        // dynamically get the espresso contacts
        this.company_service.getEspressoContacts()
            .then(
                data => {
                    if(data.status == AppConstants.SUCCESS_RESPONSE){
                        if(data.result) {
                            this.ecpressoContactCount = Object.keys(data.result).length;
                        }else{
                            this.ecpressoContactCount = 0;
                        }

                        if(this.ecpressoContactCount == 0){
                            this.espressoContactNoData = AppConstants.EC_CONTACT_NO_DATA;
                        }
                        this.espressoContacts = data.result;
                    }
                }
            )
            .catch((error) => {
                let errBody = JSON.parse(error._body);
                if (this.common.sessionCheck(errBody.code)) {
                    this.loadingMessage['message'] = LoadingMessage.ESPRESSO_CONTACT;
                    this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
                }
            });

        let params = {last_page: '/admin-company-dashboard/' + this.company_id + '/' + this.company_name};
        // api call to set the metdata  last page
        this.company_service.updateCompanyMetadata(params)
            .then(data => {
                this.next_reporting_peroid = data.result.monthly_reporting_next_period;
            })
            .catch((error) => {
                let errBody = JSON.parse(error._body);
                if (this.common.sessionCheck(errBody.code)) {
                    this.showLoading = false;
                    return errBody.message;
                }
            });


        // get income and balance sheet of last 24 months by partcular company id for admin and then order by period_ending
        this.company_service.getIncomeStatementOfLastMonthsByCompanyId(this.company_id)
            .then(data => {
                if (data.message) {
                    this.showLoading = false;
                    this.income_statement = []
                } else {
                    var feild = 'period_ending';
                    data.sort((a: any, b: any) => {
                        let left = Number(new Date(a[feild]));
                        let right = Number(new Date(b[feild]));

                        return right - left;
                    });
                    this.income_statement = data;
                    this.showLoading = false;
                }

                this.company_service.getBalanceStatementOfLastMonthsByCompanyId(this.company_id)
                    .then(data => {
                        if (data.message) {
                            this.showLoading = false;
                            this.balance_sheet = []
                        } else {
                            var feild = 'period_ending';
                            data.sort((a: any, b: any) => {
                                let left = Number(new Date(a[feild]));
                                let right = Number(new Date(b[feild]));

                                return right - left;
                            });
                            this.balance_sheet = data;
                            this.showLoading = false;
                        }
                    })
                    .catch((error) => {
                        let errBody = JSON.parse(error._body);
                        if (this.common.sessionCheck(errBody.code)) {
                            this.loadingMessage['message'] = LoadingMessage.GET_BALANCE_SHEET;
                            this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
                        }
                });
            })
            .catch((error) => {
                let errBody = JSON.parse(error._body);
                if (this.common.sessionCheck(errBody.code)) {
                    this.loadingMessage['message'] = LoadingMessage.GET_INCOME_STATEMENT;
                    this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
                }
            });

    }

    /*
    * Hide the contact us dropdown while scrolling event.
     */
    handleScroll(event: ScrollEvent) {
        let elements = this.elRef.nativeElement.querySelector('#contact-us');
        if(elements.classList.contains('open')){
          elements.classList.remove("open");
        }
    }

    ngOnInit() {
        this.common.disableBrowseBackButton();
    }

}
