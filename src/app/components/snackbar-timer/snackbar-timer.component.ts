import { Component, Inject, OnInit } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

@Component( {
  selector: 'app-snackbar-timer',
  templateUrl: './snackbar-timer.component.html',
  styleUrls: [ './snackbar-timer.component.scss' ]
} )
export class SnackbarTimerComponent implements OnInit {

  public max: number;
  public interval = .1;
  public percent = 0;

  constructor(
    @Inject( MAT_SNACK_BAR_DATA ) public timeout: number
  ) {
    this.max = this.timeout;
  }

  ngOnInit(): void {
    const int = setInterval( () => {
      this.timeout -= this.interval;
      const p = 100 - ( ( this.timeout / this.max ) * 100 );
      if( p > this.percent ) {
        this.percent = p;
      }
      if( this.timeout <= 0 ) {
        clearInterval( int )
      }
    }, this.interval * 1000 );
  }

}
