import { Component, OnInit } from '@angular/core';
import { TitleService } from 'src/app/services/title.service';

const remote = window[ 'require' ]( 'electron' ).remote;

@Component( {
  selector: 'app-title-bar',
  templateUrl: './title-bar.component.html',
  styleUrls: [ './title-bar.component.scss' ]
} )
export class TitleBarComponent implements OnInit {

  constructor(
    public titleService: TitleService
  ) { }

  ngOnInit() {
  }

  min() {
    const window = remote.getCurrentWindow();
    window.minimize();
  }

  max() {
    const window = remote.getCurrentWindow();
    if ( !window.isMaximized() ) {
      window.maximize();
    } else {
      window.unmaximize();
    }
  }

  close() {
    const window = remote.getCurrentWindow();
    window.close();
  }
}
