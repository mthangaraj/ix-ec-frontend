import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AppComponent} from '../../app.component';

@Component({
  selector: 'app-session-inactive',
  templateUrl: './session-inactive.component.html',
  styleUrls: ['./session-inactive.component.css']
})
export class SessionInactiveComponent implements OnInit {

  constructor(public router: Router,
              private route: ActivatedRoute,
              private appComponent: AppComponent) { }

  ngOnInit() {
      this.appComponent.reset();
  }

}
