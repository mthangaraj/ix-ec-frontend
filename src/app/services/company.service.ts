import {Injectable} from '@angular/core';
import {Http, Response, Headers, RequestOptions} from '@angular/http';
import {Router} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import {environment} from '../../environments/environment';
import * as moment from 'moment';
import {CommonService} from "./common.service";
import {AppConstants, NavigateToScreen} from "../app.constants";


@Injectable()
export class CompanyService {

    company_id;
    headers: Headers = new Headers();
    company_meta;
    loadingMessage: any;
    showLoading: boolean = true;
    public espressoContacts: any = [];
    ecpressoContactCount: any;
    espressoContactNoData: string = "";

    constructor(private http: Http, private router: Router, private common: CommonService) {
        this.company_id = localStorage.getItem('company');
        this.headers.append('Content-Type', 'application/json');
        this.headers.append('Authorization', 'Bearer ' + localStorage.getItem('token'));
        this.company_meta = JSON.parse(localStorage.getItem('company_meta'));
    }

    /**
     * Update company data
     * @param data 
     */
    putCompany(data) {
        return this.http.put(environment.api.url + '/company/' + this.company_id + '/', JSON.stringify(data), {headers: this.headers})
            .toPromise()
            .then(this.common.extractData)
            .catch(this.common.handleError);
    }

    /**
     * get Company By searcch keyword
     * @param keyword 
     */
    getCompanyBySearchText(text) {
        return this.http.get(environment.api.url + '/company/?name='+text, {headers: this.headers})
            .toPromise()
            .then(this.common.extractData)
            .catch(this.common.handleError);
    }
    /**
     * Update Company metadata
     * 
     * @param data 
     */
    updateCompanyMetadata(data) {
        this.common.debuglog('############### update Company Metadata company id is '+this.company_id);
        return this.http.put(environment.api.url + '/company/' + this.company_id + '/companymeta/', JSON.stringify(data), {headers: this.headers})
            .toPromise()
            .then(this.common.extractData)
            .catch(this.common.handleError);
    }

    /**
    * Get Company metadata
    * 
    * @param data 
    */
    getCompanyMetadata() {
        return this.http
            .get(environment.api.url + '/company/' + this.company_id + '/companymeta/', {headers: this.headers})
            .toPromise()
            .then(this.common.extractData)
            .catch(this.common.handleError);
    }

    /**
    * Get Company metadata by company id for admin
    * 
    * @param data 
    */
    getCompanyMetadataByCompanyId(id) {
        return this.http.get(environment.api.url + '/company/' + id + '/companymeta/', {headers: this.headers})
            .toPromise()
            .then(this.common.extractData)
            .catch(this.common.handleError);
    }

    /**
     * Get the charts of company account
     */
    getChartOfAccounts() {
        return this.http.get(environment.api.url + '/company/' + this.company_id + '/accounting/chartofaccounts/', {headers: this.headers})
            .toPromise()
            .then(this.common.extractData)
            .catch(this.common.handleError);
    }

    /**
     * Get the espresso company contact
     */
    getEspressoContacts() {
        return this.http.get(environment.api.url + '/company/' + this.company_id + '/espresso_contact/', {headers: this.headers})
            .toPromise()
            .then(this.common.extractData)
            .catch(this.common.handleError);
    }

    /**
     * Post the charts of company account file upload
     * @param files 
     */
    postChartOfAccounts(files) {
        let formData: FormData = new FormData();
        let filename;
        this.common.debuglog('######### CoA File CSV ');
        this.common.debuglog(files);
        for (let file of files) {
            this.common.debuglog('######### in postCoA file name is '+file.name);
            formData.append('file', file, file.name);
            filename = file.name;
        }
        let headers = new Headers();
        /** No need to include Content-Type in Angular 4 */
        headers.append('Content-Type', 'multipart/form-data');
        //headers.append('Accept', 'application/json');
        headers.append('Authorization', 'Bearer ' + localStorage.getItem('token'));
        headers.append('Content-Disposition', 'attachment; filename=' + filename);
        return this.http.post(environment.api.url + '/company/' + this.company_id + '/accounting/chartofaccounts/', formData, {headers: headers})
            .toPromise()
            .then(this.common.extractData)
            .catch(this.common.handleError);
    }


    /**
     * Get the trial balance of the company
     */
    getTrialBalance() {
        return this.http.get(environment.api.url + '/company/' + this.company_id + '/accounting/trialbalance/', {headers: this.headers})
            .toPromise()
            .then(this.common.extractData)
            .catch(this.common.handleError);
    }

    /**
     * Get CoA map
     */
    getCoAMap() {
        return this.http.get(environment.api.url + '/company/' + this.company_id + '/accounting/coamap/', {headers: this.headers})
            .toPromise()
            .then(this.common.extractData)
            .catch(this.common.handleError);
    }

    /**
     * Create new CoA Map
     * @param data 
     */
    postCoAMap(data) {
        return this.http.post(environment.api.url + '/company/' + this.company_id + '/accounting/coamap/', JSON.stringify(data), {headers: this.headers})
            .toPromise()
            .then(this.common.extractData)
            .catch(this.common.handleError);
    }
    putCoAMap() {
        return this.http.put(environment.api.url + '/company/' + this.company_id + '/accounting/coamap/', '', {headers: this.headers})
            .toPromise()
            .then(this.common.extractData)
            .catch(this.common.handleError);
    }

    /**
     * Get generate statement 
     */
    getGenerateStatements() {
        return this.http.get(environment.api.url + '/company/' + this.company_id + '/accounting/generatestatements/', {headers: this.headers})
            .toPromise()
            .then(this.common.extractData)
            .catch(this.common.handleError);
    }
    
    // #brad #todo: these next 4 functions are very repetative and should be refactored.
    /**
     * get IncomeStatement Of LastMonths By CompanyId for admin
     * @param companyid 
     */
    getIncomeStatementOfLastMonthsByCompanyId(id) {
        // get from current period from meta, this will be the end_date since no data will have been reported beyond this date
        let curr_period = moment(this.company_meta.monthly_reporting_current_period);
        
        // set end_date first before changing curr_period to set start_date
        let end_date = curr_period.format('YYYY-MM-DD');
        let start_date = curr_period.subtract(24, 'months').endOf('month').format('YYYY-MM-DD');
        
        return this.http.get(environment.api.url + '/company/' + id + '/accounting/incomestatement/?start_date=' + start_date + '&end_date=' + end_date, {headers: this.headers})
            .toPromise()
            .then(this.common.extractData)
            .catch(this.common.handleError);
    }

    /**
    * get IncomeStatement Of LastMonths By CompanyId for admin
    * @param companyid 
    */
    getBalanceStatementOfLastMonthsByCompanyId(id) {
        // get from current period from meta, this will be the end_date since no data will have been reported beyond this date
        let curr_period = moment(this.company_meta.monthly_reporting_current_period);
        this.common.debuglog(curr_period);
        // set end_date first before changing curr_period to set start_date
        let end_date = curr_period.format('YYYY-MM-DD');
        let start_date = curr_period.subtract(24, 'months').endOf('month').format('YYYY-MM-DD');        
        
        return this.http.get(environment.api.url + '/company/' + id + '/accounting/balancesheet/?start_date=' + start_date + '&end_date=' + end_date, {headers: this.headers})
            .toPromise()
            .then(this.common.extractData)
            .catch(this.common.handleError);
    }


    /**
     * get income statement of last 24 months for dashboard
     */
    getIncomeStatementOfLastMonths() {
        // get from current period from meta, this will be the end_date since no data will have been reported beyond this date
        let curr_period = moment(this.company_meta.monthly_reporting_current_period);

        // set end_date first before changing curr_period to set start_date
        let end_date = curr_period.format('YYYY-MM-DD');
        let start_date = curr_period.subtract(24, 'months').endOf('month').format('YYYY-MM-DD');
        
        this.common.debuglog('############### getLastStatementOfLastMonths '+start_date+' '+end_date);
        return this.http.get(environment.api.url + '/company/' + this.company_id + '/accounting/incomestatement/?start_date=' + start_date + '&end_date=' + end_date, {headers: this.headers})
            .toPromise()
            .then(this.common.extractData)
            .catch(this.common.handleError);
    }

    /**
     * get iBalanceStatement of last 24 months for dashboard
     */
     // #todo this should be called Balance SHEET not STATEMENT. rename
    getBalanceStatementOfLastMonths() {
        // get from current period from meta, this will be the end_date since no data will have been reported beyond this date
        let curr_period = moment(this.company_meta.monthly_reporting_current_period);
        
        // set end_date first before changing curr_period to set start_date
        let end_date = curr_period.format('YYYY-MM-DD');
        let start_date = curr_period.subtract(24, 'months').endOf('month').format('YYYY-MM-DD');        
        
        this.common.debuglog('######## GETTING B/S for '+start_date+' '+end_date);
        return this.http.get(environment.api.url + '/company/' + this.company_id + '/accounting/balancesheet/?start_date=' + start_date + '&end_date=' + end_date, {headers: this.headers})
            .toPromise()
            .then(this.common.extractData)
            .catch(this.common.handleError);
    }

    /**
     * get monthly report list
     * #brad #todo: this function needs to be renamed to getMonthlyReportList(). There is also a getMonthlyReport function in reporting services that needs to
     *              be renamed because it's getting the monthly reporting questionairre, and not dealing with the monthlyreport model like this one is.
     */
    getMonthlyReport() {
        // #brad this will get all monthly reports, is that desired?
        return this.http.get(environment.api.url + '/company/' + this.company_id + '/monthlyreport/', {headers: this.headers})
            .toPromise()
            .then(this.common.extractData)
            .catch(this.common.handleError);
    }

    /**
     * get company list for admin search
     */
    getCompanyLists() {
        return this.http.get(environment.api.url + '/company/', {headers: this.headers})
            .toPromise()
            .then(this.common.extractData)
            .catch(this.common.handleError);
    }

    /***
     * get company previous reports for admin
     * @param companyid 
     */
    getMonthlyReportByCompany(companyid) {
        return this.http.get(environment.api.url + '/company/' + companyid + '/monthlyreport/', {headers: this.headers})
            .toPromise()
            .then(this.common.extractData)
            .catch(this.common.handleError);
    }

    /** 
     * save balance sheet
     * 
     */
    sendBalanceSheet(balancesheet) {
        return this.http.post(environment.api.url + '/company/' + this.company_id + '/accounting/balancesheet/', JSON.stringify(balancesheet), {headers: this.headers})
            .toPromise()
            .then(this.common.extractData)
            .catch(this.common.handleError);
    }

    /** 
     * save incomestatement
     * 
     */
    sendIncomeStatement(incomestatement) {
        return this.http.post(environment.api.url + '/company/' + this.company_id + '/accounting/incomestatement/', JSON.stringify(incomestatement), {headers: this.headers})
            .toPromise()
            .then(this.common.extractData)
            .catch(this.common.handleError);
    }
    /**
     *  post for trail balance file upload
     * @param files
     */
    postTrialBalance(files) {
        let formData: FormData = new FormData();
        let filename;
        this.common.debuglog('######### TB File CSV ');
        this.common.debuglog(files);
        for (let file of files) {
            this.common.debuglog('######### in postTB file name is '+file.name);
            formData.append('file', file, file.name);
            filename = file.name;
        }
        let headers = new Headers();
        /** No need to include Content-Type in Angular 4 */
        headers.append('Content-Type', 'multipart/form-data');
        //headers.append('Accept', 'application/json');
        headers.append('Authorization', 'Bearer ' + localStorage.getItem('token'));
        headers.append('Content-Disposition', 'attachment;filename=' + filename);
        
        return this.http.post(environment.api.url + '/company/' + this.company_id + '/accounting/trialbalance/', formData, {headers: headers})
            .toPromise()
            .then(this.common.extractData)
            .catch(this.common.handleError);
    }

    errorHandler(error: Response) {
        // if (error.status === 503) {
        // localStorage.removeItem('user');
        // localStorage.removeItem('company');
        // localStorage.removeItem('token');
        // localStorage.removeItem('refresh');
        // return [{ message: 'redirecting to login' }];
        // }
        if (error.status === 400) {
            return [{message: error.json().message}];
        }
        if (error) {
            if (error.json().error) {
                Observable.throw(error.json().error || 'Server error');
            }
        }
        return Observable.throw('Server error');
    }
}
