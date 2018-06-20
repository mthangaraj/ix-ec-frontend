import {Component, ElementRef, ViewChild,OnInit} from '@angular/core';
import {AppConstants, NavigateToScreen} from './app.constants';
import {Idle, DEFAULT_INTERRUPTSOURCES} from '@ng-idle/core';
import {ToastyService, ToastyConfig, ToastyComponent, ToastOptions, ToastData} from 'ng2-toasty';
import {AuthService} from './services/auth.service';
import { PushNotificationsService } from 'angular2-notifications';
import {NavigationStart, Router, ActivatedRoute} from '@angular/router';
import {CommonService} from './services/common.service';
import {environment} from '../environments/environment';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  idleState = 'Not started.';
  company: any;
  timedOut = false;
  toastTitle = '';
  toastMessage = '';
  options = {'type': 'success'};
  title = 'app works!';
  minutes = 0;
  maintenance = false;
  maintenance_details = {};
  settings_access:boolean = false;



  constructor(private idle: Idle,
              private toastyConfig: ToastyConfig,
              private toastyService: ToastyService,
              private authService: AuthService,
              private route: ActivatedRoute,
              private router: Router,
              private commonService: CommonService,
              private _pushNotifications: PushNotificationsService) {
    this.toastyConfig.theme = 'bootstrap';
    this.toastyConfig.position = 'top-center';

    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
          let urlParms = event.url.split("/");
          if(! event.url.match(/edit/g) && (event.url.match(/dashboard/g) ||
                  urlParms[1].match(/form-entry/g) ||
                  urlParms[1].match(/csv-upload/g))){
              this.settings_access =  true;
          }else{
              this.settings_access =  false;
          }
         this.isUnderMaintenance();
        this.toastyService.clearAll();
      }
    });
  }

    ngOnInit() {
    }

    checkSettingAccess(){
        this.router.events.subscribe(event => {

            if (event instanceof NavigationStart) {
                let urlParms = event.url.split("/");
                if(! event.url.match(/edit/g) && (event.url.match(/dashboard/g) ||
                        urlParms[1].match(/form-entry/g) ||
                        urlParms[1].match(/csv-upload/g))){
                    this.settings_access =  true;
                }else{
                    this.settings_access =  false;
                }

            }
        });
        return this.settings_access;
    }

  session_warning() {
    if (this.authService.isLoggedIn()) {
      this.reset();
      let idle_time = this.commonService.getSessionTiming() - (AppConstants.TIMEOUT_WARNING[0] * 60);
      this.idle.setIdle(idle_time);
      this.idle.setTimeout(AppConstants.TIMEOUT_WARNING[0] * 60);
      this.idle.setAutoResume(0);
      this.idle.onTimeout.subscribe(() => {
        this.idleState = 'Timeout';
        console.log('Timed out!');
      });
      this.idle.onTimeoutWarning.subscribe((countdown) => {
        for (let i = 0; i < AppConstants.TIMEOUT_WARNING.length; i++) {
          if (countdown === (AppConstants.TIMEOUT_WARNING[i] * 60)) {
            this.minutes = countdown / 60;
            this.notify();
          }
        }
      });
      this.idle.watch();
    }
  }

  notify() {
    this.timedOut = true;
    let options = {
      body: 'Please save your changes',
      icon: './assets/img/expresso-logo-blue.png',
      closeDelay: '120000'
    };
    let notify = this._pushNotifications.create('Your session will expire in another ' + this.minutes + ' minutes!', options)
      .subscribe(
        res => res['notification']['onclick'] = this.event,
        err => console.log(err)
      );
  }

  event() {
    this.company = JSON.parse(localStorage.getItem('company_meta'));
    let path = this.company.last_page;
    window.open(environment.api.notification_url + path);
  }

  getTitle(): any {
    return this.toastTitle;
  }

  getMessage(): any {
    return this.toastMessage;
  }

  addToast(type = null, title = null, message = null) {
    const self = this;
    this.toastyService.clearAll();
    const toastOptions: ToastOptions = {
      title: '',
      msg: (message) ? message : this.getMessage(),
      showClose: true,
      timeout: 5000,
      onAdd: (toast: ToastData) => {
        self.toastTitle = '';
        self.toastMessage = '';
        self.options.type = '';
      },
      onRemove: function (toast: ToastData) {

      }
    };
    type = (type) ? type : this.options.type;
    switch (type) {
      case 'default':
        this.toastyService.default(toastOptions);
        break;
      case 'info':
        this.toastyService.info(toastOptions);
        break;
      case 'success':
        this.toastyService.success(toastOptions);
        break;
      case 'wait':
        this.toastyService.wait(toastOptions);
        break;
      case 'error':
        this.toastyService.error(toastOptions);
        break;
      case 'warning':
        this.toastyService.warning(toastOptions);
        break;
    }
  }

  remove() {
    this.toastyService.clearAll();
  }

  reset() {
    this.idle.setIdle(1);
    this.idle.setTimeout(1);
    this.idle.stop();
    this.idle.onTimeoutWarning.observers.length = 0;
    this.idle.onTimeout.observers.length = 0;
    this.idle.onIdleStart.observers.length = 0;
    this.idle.onIdleEnd.observers.length = 0;
  }

  isUnderMaintenance() {
    this.authService.check_maintenance()
      .then((data) => {
        if (data.status == AppConstants.SUCCESS_RESPONSE) {
          this.maintenance_details = data.result;
          this.maintenance = data.result.is_under_maintenance;
        }
      }).catch((err) => {
        this.maintenance = false;
      }
    );
  }
}
