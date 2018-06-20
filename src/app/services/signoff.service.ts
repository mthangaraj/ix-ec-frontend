import {Injectable} from '@angular/core';
import {Http, Response, Headers, RequestOptions} from '@angular/http';
import {Router} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import {environment} from '../../environments/environment';
import {CommonService} from "./common.service";


@Injectable()
export class SignoffService {
    company_id;
    headers: Headers = new Headers();
    company_meta;
    test;
    current_reporting_period;
    
    constructor(private http: Http, private router: Router, private  common: CommonService) {
        this.company_id = localStorage.getItem('company');
        this.headers.append('Content-Type', 'application/json');
        this.headers.append('Authorization', 'Bearer ' + localStorage.getItem('token'));
        this.common.debuglog('######### sign off service constructor called');
        this.company_meta = JSON.parse(localStorage.getItem('company_meta'));
        this.common.debuglog(this.company_meta);
        this.current_reporting_period = this.company_meta['monthly_reporting_current_period'];
    }

    /**
    * Get income statement of present month
    */
    // #todo: this should be getIncomeStatement, not Certificate. find and fix before production
    getIncomeCetificate() {
        this.common.debuglog('###### getting i/s for '+this.current_reporting_period);
        // #brad - set this to be relative to the current period
        return this.http.get(environment.api.url + '/company/' + this.company_id + '/accounting/incomestatement/?end_date=' + this.current_reporting_period, 
                            {headers: this.headers})
                            .toPromise()
                            .then(this.common.extractData)
                            .catch(this.common.handleError);
    }

    /**
      * Get balance statement of present month
      */
    getBalanceSheet() {
        // #brad - set this to be relative to the current period
        return this.http.get(environment.api.url + '/company/' + this.company_id + '/accounting/balancesheet/?end_date=' + this.current_reporting_period,
                            {headers: this.headers})
                            .toPromise()
                            .then(this.common.extractData)
                            .catch(this.common.handleError);
    }
    /**
     * post api for signoff
     */
    postForSigningOff(data=undefined) {
        var curr_period = this.current_reporting_period.split("-");
        var yearmonth = curr_period[0]+'-'+curr_period[1];
        this.common.debuglog('########## signoff year month '+ yearmonth);
        this.common.debuglog('######### sign off curr period '+ curr_period);
        
        // at the moment, then only way this will get called with no data is if the system is sending a sign-off
        // for the placeholder monthly report that is created during the user setup process. #brad #note
        if (typeof(data) === 'undefined') {
            data = {
                "signoff_by_name": "System Sign-off for Setup",
                "signoff_by_title": "Chief Bouzouki Officer"                                                
            };
        }
                    
        return this.http.put(environment.api.url + '/company/' + this.company_id + '/monthlyreport/signoff/', data, {headers: this.headers})
            .toPromise()
            .then(this.common.extractData)
            .catch(this.common.handleError);
    }

    /**
     * get income statement of particular month
     * @param end_date is YYYY-MM 
     */
    getIncomeCetificateForParticularMonth(end_date) {   
        // #brad: API will retrun single month of data if only end_date is provided.
        return this.http.get(environment.api.url + '/company/' + this.company_id + '/accounting/incomestatement/?end_date=' + end_date, {headers: this.headers})
            .toPromise()
            .then(this.common.extractData)
            .catch(this.common.handleError);
    }
    /**
     * get balamnce statement of particular month
     * @param end_date is YYYY-MM 
     */
    getBalanceSheetForParticularMonth(end_date) {
        return this.http.get(environment.api.url + '/company/' + this.company_id + '/accounting/balancesheet/?end_date=' + end_date, {headers: this.headers})
            .toPromise()
            .then(this.common.extractData)
            .catch(this.common.handleError);
    }
    /**
     * get income statement of particular month for admin of particular company
     * @param companyid , end_date is YYYY-MM 
     */
    getIncomeCetificateForParticularMonthByCompany(companyId, end_date) {        
        return this.http.get(environment.api.url + '/company/' + companyId + '/accounting/incomestatement/?end_date=' + end_date, {headers: this.headers})
            .toPromise()
            .then(this.common.extractData)
            .catch(this.common.handleError);
    }

    /**
    * get balamnce statement of particular month for admin of particular company
    * @param companyid , end_date is YYYY-MM 
    */
    getBalanceSheetForParticularMonthByCompany(companyId, end_date) {
        return this.http.get(environment.api.url + '/company/' + companyId + '/accounting/balancesheet/?end_date=' + end_date, {headers: this.headers})
            .toPromise()
            .then(this.common.extractData)
            .catch(this.common.handleError);
    }

    errorHandler(error: Response) {
        if (error.status === 400) {
            return [{message: error.json().message}];
        }
        if (error) {
            this.common.debuglog('######### JSON ERROR');
            if (error.json().error) {
                Observable.throw(error.json().error || 'Server error');
            }
        }
        return Observable.throw('Server error');
    }

}
