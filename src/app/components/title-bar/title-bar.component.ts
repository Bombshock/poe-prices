import { Component, OnInit, HostListener } from '@angular/core';
import { TitleService } from 'src/app/services/title.service';
import { ApiService } from 'src/app/services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/services/auth.service';

const remote = window[ 'require' ]( 'electron' ).remote;

@Component( {
  selector: 'app-title-bar',
  templateUrl: './title-bar.component.html',
  styleUrls: [ './title-bar.component.scss' ]
} )
export class TitleBarComponent implements OnInit {

  constructor(
    public titleService: TitleService,
    public auth: AuthService,

    private api: ApiService,
    private snackBar: MatSnackBar
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

  clearCache() {
    this.api.clearCache();
    this.snackBar.open( 'chache cleared', null, {
      duration: 2000,
    } );
  }

  @HostListener( 'window:keyup', [ '$event' ] )
  keyEvent( event: KeyboardEvent ) {
    console.log( event );

    if ( event.key === 'F12' ) {
      this.openDevTools();
    }
  }

  openDevTools() {
    window[ 'require' ]( 'electron' ).remote.BrowserWindow.getAllWindows()[ 0 ].openDevTools();
  }

  logout() {
    this.auth.logout();
    this.api.clearCache();
  }
}
