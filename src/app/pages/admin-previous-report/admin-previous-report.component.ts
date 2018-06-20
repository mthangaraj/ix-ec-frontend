import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';

import {CompanyService} from './../../services';
import {CommonService} from "../../services";
import {ErrorCodes, LoadingMessage, NavigateToScreen} from '../../app.constants';

@Component({
    selector: 'app-admin-previous-report',
    templateUrl: './admin-previous-report.component.html',
    styleUrls: ['./admin-previous-report.component.css']
})
export class AdminPreviousReportComponent implements OnInit {

    company_id;
    company_name;
    showLoading: boolean = true;
    reports: any = [];
    next_reporting_peroid;
    loadingMessage: any;

    constructor(public router: Router, private company_service: CompanyService,
                private route: ActivatedRoute, private common: CommonService) {
        // get date param from route
        this.route.params.subscribe(params => {
            this.company_id = params.company_id;
            this.company_name = params.name;
        });

        this.loadingMessage = {
            'message':'',
            'error':''
        }

        let params = {last_page: '/'+NavigateToScreen.admin_previous_report+'/'+ this.company_id + '/' + this.company_name};
        //api call to set the metdata  last page
        this.company_service.updateCompanyMetadata(params)
            .then(data => {
                this.showLoading = false;
                this.common.debuglog(data.result)
            })
            .catch((error) => {
                let errBody = JSON.parse(error._body);
                if (this.common.sessionCheck(errBody.code)) {
                    this.loadingMessage['message'] = LoadingMessage.UPDATE_COMPANY_META;
                    this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
                }
            });

        // get company next reporting peroid from company metadat
        this.company_service.getCompanyMetadataByCompanyId(this.company_id)
            .then(data => {
                this.common.debuglog(data.result)
                this.showLoading = false;
                this.next_reporting_peroid = data.result.monthly_reporting_next_period;
            })
            .catch((error) => {
                let errBody = JSON.parse(error._body);
                if (this.common.sessionCheck(errBody.code)) {
                    this.loadingMessage['message'] = LoadingMessage.GET_COMPANY_META_BY_COMPANY;
                    this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
                }

            });

        // get monthly reports
        this.company_service.getMonthlyReportByCompany(this.company_id)
            .then(response => {
                //redirect to report page
                this.common.debuglog(response)
                this.reports = response;
                this.showLoading = false;
            })
            .catch((error) => {
                let errBody = JSON.parse(error._body);
                if (this.common.sessionCheck(errBody.code)) {
                    this.loadingMessage['message'] = LoadingMessage.GET_MONTHLY_REPORT_BY_COMPANY;
                    this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
                }
            });
    }

    ngOnInit() {
        this.common.disableBrowseBackButton();
    }
    // adminPreviousReportDetail
}
