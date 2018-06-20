import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-scheduled',
  templateUrl: './scheduled-maintenance.component.html',
  styleUrls: ['./scheduled-maintenance.component.css']
})
export class ScheduledMaintenanceComponent implements OnInit {
  @Input('maintenance_details') maintenance_details;
  constructor() {
  }

  ngOnInit() {
  }

}
