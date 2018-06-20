import {Injectable} from '@angular/core';
import {Http, Response, Headers, RequestOptions} from '@angular/http';
import {Router} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import {environment} from '../../environments/environment';
import * as moment from 'moment';
import {CommonService} from "./common.service";

@Injectable()
export class ReportingService {

    company_id;
    headers: Headers = new Headers();
    company_meta;

    // #todo: this company service is causing a circular dependcy with index.ts for some reason, how do we get rid of this?
    constructor(private http: Http, private router: Router, private common: CommonService) {
    //constructor(private http: Http, private router: Router) {
        this.company_id = localStorage.getItem('company');
        this.common.debuglog('########## REPORTING service consructor found company id '+localStorage.getItem('company'));

        this.headers.append('Content-Type', 'application/json');
        this.headers.append('Authorization', 'Bearer ' + localStorage.getItem('token'));

        this.company_meta = JSON.parse(localStorage.getItem('company_meta'));
    }

    /**
     * Get's a report signoff information
     */
    getSignOffInfo(period) {
        var curr_period = moment(period);
        var yearmonth = curr_period.format('YYYY-MM');
        return this.http.get(environment.api.url + '/company/' + this.company_id + '/monthlyreport/' + yearmonth + '/', {headers: this.headers})
            .toPromise()
            .then(this.common.extractData)
            .catch(this.common.handleError);
    }

    /**
    * Get's a blank questionaire (no answers)
    */
    getQuestionListOnly() {
        return this.http.get(environment.api.url + '/company/' + this.company_id + '/questionnaire/', {headers: this.headers})
            .toPromise()
            .then(this.common.extractData)
            .catch(this.common.handleError);
    }
    
    /**
    * Get previous month's answers to carry forward for the current month. #brad renamed this function so it doesn't conflict with company_service.getMonthlyReport
    */
    getLastMonthlyReportAnswers() {
        // #brad: get questions from last month, and copy them forward for user convenience.
        var last_period = moment(this.company_meta['monthly_reporting_current_period']).subtract(1, 'months').endOf('month');
        var yearmonth = last_period.format('YYYY-MM');
        this.common.debuglog('########### getting answers from '+ yearmonth);
        
        return this.http.get(environment.api.url + '/company/' + this.company_id + '/monthlyreport/' + yearmonth + '/questionnaire/', {headers: this.headers})
            .toPromise()
            .then(this.common.extractData)
            .catch(this.common.handleError);
    }
    
    /**
    * Get previous month's answers to carry forward for the current month. #brad renamed this function so it doesn't conflict with company_service.getMonthlyReport
    */
    getMonthlyReportAnswersByPeriod(period) {
        // make sure the correct period format is being used.
        // #todo this inconsitency in the system needs to be fixed. We should use YYYY-MM-DD format everywhere.
        var fperiod = moment(period).format('YYYY-MM');
        
        return this.http.get(environment.api.url + '/company/' + this.company_id + '/monthlyreport/' + fperiod + '/questionnaire/', {headers: this.headers})
            .toPromise()
            .then(this.common.extractData)
            .catch(this.common.handleError);
    }
    
    /* 
        This will create a new Monthly Report object (not questionaire) for the current period. Multiple calls will not create multiple entries for the same period 
        #brad #todo this function needs to be fixed because for some reason the class constructor isn't getting called from the login component.
    */

    postMonthlyReportForCurrentPeriod(co_id, token){
        // if (this.company_id == null) this.company_id = co_id;
        this.company_id = localStorage.getItem('company');
        this.company_id = sessionStorage.getItem('company');
        this.headers = null;
        this.headers = new Headers();
        this.headers.append('Content-Type', 'application/json');
        this.headers.append('Authorization', 'Bearer ' + token);

        // #brad #todo: due date is not currently used, but should be set to +1 month from the reporting period date
        var payload = {};
        return this.http
            .post(environment.api.url + '/company/' + this.company_id + '/monthlyreport/', JSON.stringify(payload), {headers: this.headers})
            .toPromise()
            .then(this.common.extractData)
            .catch(this.common.handleError);
    }

    /**
     * post questionnaire answers of reporting
     */
    postReportingAnswers(params) {
        /*var month = new Date().getMonth();
        var year = new Date().getFullYear();
        if (month.toString().length == 1) {
            var yearmonth = year + '-0' + month;
        }
        else {
            var yearmonth = year + '-' + month;
        }*/

        // Reporting Period
        var curr_period = moment(this.company_meta['monthly_reporting_current_period']);
        var yearmonth = curr_period.format('YYYY-MM');

        this.common.debuglog('###### posting reporting answers for ' + yearmonth);
        return this.http.post(environment.api.url + '/company/' + this.company_id + '/monthlyreport/' + yearmonth + '/questionnaire/', JSON.stringify(params), {headers: this.headers})
            .toPromise()
            .then(this.common.extractData)
            .catch(this.common.handleError);
    }

  updatePreviousReports(data, date) {
    var curr_period = moment(date);
    var yearmonth = curr_period.format('YYYY-MM');

    return this.http.put(environment.api.url + '/company/' + this.company_id + '/monthlyreport/' + yearmonth + '/edit/', JSON.stringify(data), {headers: this.headers})
      .toPromise()
      .then(this.common.extractData)
      .catch(this.common.handleError);
  }

    errorHandler(error: Response) {
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


}​
