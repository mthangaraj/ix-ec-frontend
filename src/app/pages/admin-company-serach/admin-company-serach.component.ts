import {Component, OnInit, Pipe, PipeTransform} from '@angular/core';
import {Router} from '@angular/router';
import {CommonService} from "../../services";
import {CompanyService} from './../../services';
import {ErrorCodes, LoadingMessage, NavigateToScreen} from '../../app.constants';

/**
 * pipe for search by company name
 */

@Pipe({name: 'Searchfilter'})
export class Searchfilter implements PipeTransform {
    transform(value: Array<any>, field: string) {
        if (field == "") {
            return value;
        }
        else {
            var res = [];
            for (var i = 0; i < value.length; i++) {
                var name = value[i].name;
                if (name.search(field) !== -1) {
                    res.push(value[i])
                }
            }
            return res;
        }

    }
}

@Component({
    selector: 'app-admin-company-serach',
    templateUrl: './admin-company-serach.component.html',
    styleUrls: ['./admin-company-serach.component.css']
})
export class AdminCompanySerachComponent implements OnInit {
    companyList: any = [];
    seachText = "";
    showLoading: boolean = true;
    loadingMessage: any;

    constructor(public router: Router, private company_service: CompanyService, private common: CommonService) {
        this.loadingMessage = {
            'message':'',
            'error':''
        }

        // get all companies
        this.company_service.getCompanyLists()
            .then(data => {
                this.companyList = data;
                this.showLoading = false;
            })
            .catch((error) => {
                let errBody = JSON.parse(error._body);
                if (this.common.sessionCheck(errBody.code)) {
                    this.loadingMessage['message'] = LoadingMessage.GET_COMPANY_LIST;
                    this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
                }
            });


        let params = {last_page: '/admin-company-search'};
        //api call to set the metdata  last page
        this.company_service.updateCompanyMetadata(params)
            .then(data => {
                this.showLoading = false
                this.common.debuglog(data)
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
     * go to admin previous reports
     */
    goToAdminPreviousReport(company) {

        this.router.navigate([NavigateToScreen.admin_previous_report, company.id, company.name]);
    }

    ngOnInit() {
        this.common.disableBrowseBackButton();
    }

    getCompanyBySearchText(text) {
        this.common.debuglog(text)
        this.company_service.getCompanyBySearchText(text).
            then(data => {
                this.companyList = data;
            })
            .catch((error) => {
                let errBody = JSON.parse(error._body);
                if (this.common.sessionCheck(errBody.code)) {
                    this.loadingMessage['message'] = LoadingMessage.GET_COMPANY_BY_SEARCH;
                    this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
                }
            });
    }

}
