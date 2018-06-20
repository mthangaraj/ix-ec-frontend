import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

import {SignoffService} from './../../services';
import {CompanyService} from './../../services';
import {CommonService} from "../../services";
import {ErrorCodes, LoadingMessage, NavigateToScreen} from '../../app.constants';

@Component({
    selector: 'app-admin-previous-report-detail',
    templateUrl: './admin-previous-report-detail.component.html',
    styleUrls: ['./admin-previous-report-detail.component.css']
})
export class AdminPreviousReportDetailComponent implements OnInit {
    date;
    income_statement: any = [];
    showLoading: boolean = true;
    balance_sheet: any[];
    currentMonth;
    dateParam;
    company_name;
    company_id;
    next_reporting_peroid;
    loadingMessage: any;
    constructor(private signoff_service: SignoffService,
                private company_service: CompanyService,
                private route: ActivatedRoute,
                private common: CommonService,
                private router: Router) {

        this.loadingMessage = {
            'message': '',
            'error': ''
        };

        // get date param from route
        this.route.params.subscribe(params => {
            this.dateParam = params.date;
            this.company_name = params.name;
            this.company_id = params.company_id;
        });

        let params = {last_page: '/'+NavigateToScreen.admin_previous_report_detail+'/' + this.company_id + '/' + this.company_name  + '/' +this.dateParam};
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

        // get company reporting peroid
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

        // creating date format (eg 30/Apr/17)
        var dateObj = new Date(this.dateParam);
        var monthNames = [
            "Jan", "Feb", "Mar",
            "Apr", "May", "Jun", "Jul",
            "Aug", "Sep", "Oct",
            "Nov", "Dec"
        ];
        var monthFullNames = [
            "January", "February", "March",
            "April", "May", "June", "July",
            "August", "September", "October",
            "November", "December"
        ];

        var day = dateObj.getDate();
        var monthIndex = dateObj.getMonth();
        var year = dateObj.getFullYear().toString().substring(2);

        this.date = day + '/' + monthNames[monthIndex] + '/' + year;
        this.currentMonth = monthFullNames[monthIndex] + ' ' + dateObj.getFullYear();

        // get income and balance sheet by particular company id
        this.signoff_service.getIncomeCetificateForParticularMonthByCompany(this.company_id, this.dateParam)
            .then(data => {
                this.common.debuglog(data)
                if (data.message) {
                    this.showLoading = false;
                    this.income_statement = [];
                } else {
                    this.showLoading = false;
                    this.income_statement = data;
                }

            })
            .catch((error) => {
                let errBody = JSON.parse(error._body);
                if (this.common.sessionCheck(errBody.code)) {
                    this.loadingMessage['message'] = LoadingMessage.INCOME_CERTIFICATE_FOR_PARTICULAR_MONTH;
                    this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
                }
            });

        this.signoff_service.getBalanceSheetForParticularMonthByCompany(this.company_id, this.dateParam)
            .then(data => {
                this.common.debuglog(data)
                if (data.message) {
                    this.showLoading = false;
                    this.balance_sheet = []
                } else {
                    this.showLoading = false;
                    this.balance_sheet = data;
                }

            })
            .catch((error) => {
                let errBody = JSON.parse(error._body);
                if (this.common.sessionCheck(errBody.code)) {
                    this.loadingMessage['message'] = LoadingMessage.BALANCE_SHEET_CERTIFICATE_FOR_PARTICULAR_MONTH;
                    this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
                }
            });
    }

    ngOnInit() {
        this.common.disableBrowseBackButton();
    }

}
