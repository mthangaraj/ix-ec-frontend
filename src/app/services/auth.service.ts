import {Injectable} from '@angular/core';
import {Http, Response, Headers, RequestOptions} from '@angular/http';
import {Resolve} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import {environment} from '../../environments/environment';
import {CommonService} from "./common.service";


@Injectable()
export class AuthService implements Resolve<any> {
    options: any;

    constructor(private http: Http, private common: CommonService) {}

    /**
     * Check whether user is logged in or not
     */
    isLoggedIn(): boolean {
        let currentUser = JSON.parse(localStorage.getItem('user'));
        if (currentUser && currentUser != '') {
            return true;
        }
        return false;
    }

  resolve() {
      if (!environment.development && (location.protocol !== 'https:')) {
        location.href = 'https:' + window.location.href.substring(window.location.protocol.length);
        return false;
      }
  }

    /**
     * Login Api
     * @param data
     */
    login(credentials: object): Promise<any> {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .post(environment.api.url + '/login/', credentials,{headers: headers})
            .toPromise()
            .then(this.common.extractData)
            .catch(this.common.handleError);
    }

    /**
     * get Two Factor Auth Code  By user
     * @param keyword
     */
    getTwoFactorCode() {
        let headers = new Headers();
        headers.append('Authorization', 'Bearer ' + localStorage.getItem('token'));
        headers.append('Content-Type', 'application/json');
        return this.http.get(environment.api.url + '/twofactor/auth/', {headers: headers})
            .toPromise()
            .then(this.common.extractData)
            .catch(this.common.handleError);
    }

    /**
     * Check Two Factor Auth Code  By user
     * @param keyword
     */
    checckTwoFactorCode(code) {
        let headers = new Headers();
        headers.append('Authorization', 'Bearer ' + localStorage.getItem('token'));
        return this.http.post(environment.api.url + '/twofactor/auth/', code, {headers: headers})
            .toPromise()
            .then(this.common.extractData)
            .catch(this.common.handleError);
    }

  updateTwoFactorLogin(data) {
    let headers = new Headers();
    headers.append('Authorization', 'Bearer ' + localStorage.getItem('token'));
    return this.http.put(environment.api.url + '/twofactor/auth/', data, {headers: headers})
      .toPromise()
      .then(this.common.extractData)
      .catch(this.common.handleError);
  }

  check_maintenance(): Promise<any> {
    let headers = new Headers();
    headers.append('Authorization', 'Bearer ' + localStorage.getItem('token'));
    return this.http
      .get(environment.api.url + '/scheduled_maintenance/', {headers: headers})
      .toPromise()
      .then(this.common.extractData)
      .catch(this.common.handleError);
  }
    recoverpassword(emailid: object): Promise<any> {
        let headers = new Headers();
        return this.http
            .post(environment.api.url + '/change_password/token/validate/', emailid, {headers: headers})
            .toPromise()
            .then(this.common.extractData)
            .catch(this.common.handleError);
    }
    resetpassword(password: object, token): Promise<any> {
        let headers = new Headers();
        return this.http
            .post(environment.api.url + '/change_password/' + token + '/', password, {headers: headers})
            .toPromise()
            .then(this.common.extractData)
            .catch(this.common.handleError);
    }

    changepassword(credentials: object): Promise<any> {
        let headers = new Headers();
        return this.http
            .post(environment.api.url + '/change_password/', credentials, {headers: headers})
            .toPromise()
            .then(this.common.extractData)
            .catch(this.common.handleError);
    }

    validatelink(token): Promise<any> {
        let headers = new Headers();
        return this.http
            .get(environment.api.url + '/change_password/' + token + '/', {headers: headers})
            .toPromise()
            .then(this.common.extractData)
            .catch(this.common.handleError);
    }
    logout() {
        // #brad: clear() will clear all for our domain only due to CORS, and will also ensure that any new items added do not have to be maintained here
        localStorage.clear();
        sessionStorage.clear();
        /*localStorage.removeItem('user');
        localStorage.removeItem('company');
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');*/
    }


    /**
     * Get access token from the api
     * @param data
     */
    getToken(data): Promise<any> {
        let headers = new Headers();
        headers.append('Content-Type', 'application/x-www-form-urlencoded');
        return this.http
            .post(environment.api.token_url, data,{headers: headers})
            .toPromise()
            .then(this.common.extractData)
            .catch(this.common.handleError);
    }

    /**
     * Get user role
     * @param data
     */


    getRole(): Promise<any> {
        let headers = new Headers();
        headers.append('Content-Type', 'application/x-www-form-urlencoded');
        headers.append('Authorization', 'Bearer ' + localStorage.getItem('token'));
        return this.http
            .get(environment.api.url + '/user/me/', {headers: headers})
            .toPromise()
            .then(this.common.extractData)
            .catch(this.common.handleError);
    }

}
