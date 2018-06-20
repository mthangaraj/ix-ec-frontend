import {Component, ElementRef, OnInit} from '@angular/core';
import {FileUploader} from 'ng2-file-upload';
import {Router} from '@angular/router';
import {FileDropModule} from 'ngx-file-drop/lib/ngx-drop';
import {CommonService} from "../../services";

import {environment} from '../../../environments/environment';

import { CompanyService, AuthService } from './../../services/index';
import {AppConstants, ErrorCodes, ErrorMessage, LoadingMessage, NavigateToScreen} from '../../app.constants';
import {ScrollEvent} from "ngx-scroll-event";
import {AppComponent} from '../../app.component';
const URL = environment.api.url;

@Component({
    selector: 'app-csv-upload',
    templateUrl: './csv-upload.component.html',
    styleUrls: ['./csv-upload.component.css'],
    providers: [ CompanyService, AuthService ]
})
export class CsvUploadComponent implements OnInit {
    company_id = localStorage.getItem('company');
    username;
    companyName;
    public trailuploader: FileUploader = new FileUploader({url: URL + '/company/' + this.company_id + '/accounting/trialbalance', authToken: 'Bearer ' + localStorage.getItem('token')});
    public chartOfAccountsuploader: FileUploader = new FileUploader({url: URL + '/company/' + this.company_id + '/accounting/chartofaccounts', authToken: 'Bearer ' + localStorage.getItem('token')});
    public hasBaseDropZoneOver: boolean = false;
    public hasAnotherDropZoneOver: boolean = false;

    public trialFiles = [];
    public coaFiles = [];
    public showLoading = false;
    public showContact =  true;
    public loadingMessage: any;
    file_delete =false;
    coa_message:string = "";
    tb_message:string = "";
    account_status: any;
    errordisplay: boolean;

    public fileOverBase(e: any): void {
        this.hasBaseDropZoneOver = e;
    }

    public fileOverAnother(e: any): void {
        this.hasAnotherDropZoneOver = e;
    }

    constructor(private company_service: CompanyService,
                public router: Router,
                private auth_service: AuthService,
                private common: CommonService,
                private elRef: ElementRef,
                private appComponent: AppComponent) {
        this.username = this.common.getUserName();
        this.companyName = this.common.getCompanyName();
        let params = {last_page: '/'+NavigateToScreen.csv};
        this.loadingMessage = {
            'message' : '',
            'error' : ''
        };

	//api call to set the metdata  last page
        this.company_service.updateCompanyMetadata(params)
            .then(data => {
                this.account_status = data.result.accounting_setup_status;
                this.appComponent.session_warning();
                this.showLoading = false;
            })
            .catch((error) => {
                let errBody = JSON.parse(error._body);
                if (this.common.sessionCheck(errBody.code)) {
                    this.appComponent.session_warning();
                    this.errordisplay = true;
                    this.loadingMessage['message'] = LoadingMessage.UPDATE_COMPANY_META;
                    this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
                }

            });

        }
    resetFile(event) {
        if (this.file_delete) {
            if (event.srcElement) {
                this.tb_message = '';
                this.coa_message = '';
                event.srcElement.value = null;
                this.file_delete = false;
            }
        }else {
            this.file_delete = false;
        }

    }
    ngOnInit() {
        this.common.disableBrowseBackButton();
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

    goBack() {
        if (this.account_status === AppConstants.SETUP_STATUS_COMPLETE) {
            this.router.navigate([NavigateToScreen.dashboard]);
        }else {
            this.router.navigate([NavigateToScreen.sync]);
        }
    }

    /**
     * upload files
     */
      uploadFiles(){
          let is_files_uploaded = true;
          if (!this.coaFiles.length){
              this.coa_message = ErrorMessage.COA_NOT_UPLOADED;
              is_files_uploaded = false;
          }

          if (!this.trialFiles.length){
              this.tb_message = ErrorMessage.TB_NOT_UPLOADED;
              is_files_uploaded = false;
           }

          if(is_files_uploaded){
               this.showLoading = true;
               // The Chart of Accounts must be called before the Trial Balance.
              this.errordisplay = true;
               this.loadingMessage['message'] = LoadingMessage.UPLOADING_COA;

               this.company_service.postChartOfAccounts(this.coaFiles)
               .then((resposne) => {
                   this.loadingMessage['message'] = LoadingMessage.UPLOADING_TB;

                   if(resposne.status == AppConstants.SUCCESS_RESPONSE){
                       this.appComponent.session_warning();
                       this.company_service.postTrialBalance(this.trialFiles)
                           .then(tb_response => {
                               if(tb_response.status == AppConstants.SUCCESS_RESPONSE){
                                   // this.showLoading = false;
                                   this.appComponent.session_warning();
                                   this.router.navigate([NavigateToScreen.coa_match, NavigateToScreen.upload]);
                               }
                           }).catch((error) => {
                           let errBody = JSON.parse(error._body);
                           if (this.common.sessionCheck(errBody.code)) {
                               this.appComponent.session_warning();
                               this.errordisplay = true;
                               this.showLoading = false;
                               this.tb_message = this.common.getErrorMessage(errBody.code);
                           }
                       });
                   }

               })
               .catch((error) => {
                   let errBody = JSON.parse(error._body);
                   if (this.common.sessionCheck(errBody.code)) {
                       this.appComponent.session_warning();
                       this.errordisplay = true;
                       this.showLoading = false;
                       this.coa_message = this.common.getErrorMessage(errBody.code);
                   }

               });
          }
    }

    remove(type) {
        if (type == 'trial') {
            this.file_delete = true;
            this.tb_message = '';
            this.trialFiles = [];
        } else {
            this.file_delete = true;
            this.coa_message = '';
            this.coaFiles = [];
        }
    }
    /**
     * push files based on types
     */
    fileChange(event, type) {
        let files = event.target.files;
        if (files.length > 0) {
            let file_name = files[0].name.split('.');
            let file_type = file_name[1].toLowerCase();
            if (type == 'trial') {
                if(file_type !== 'csv'){
                    this.tb_message = ErrorMessage.INVALID_FILE_FORMAT;
                }else {
                    this.tb_message = '';
                }
                this.trialFiles = files;
            } else {
                if(file_type !== 'csv'){
                    this.coa_message = ErrorMessage.INVALID_FILE_FORMAT;
                }else {
                    this.coa_message = '';
                }
                this.coaFiles = files;
            }
        }
    }

    /**
     * delete selected file for drag file
     */

    dropped(event, type) {
        let files = event.files;
        if (type == 'trial') {
            this.trialFiles = files;
        } else {
            this.coaFiles = files
        }
    }

     /**
     * Save Exit
     */
    saveExit(){
        this.appComponent.reset();
        this.auth_service.logout();
        this.router.navigate(['/']);
    }
}
