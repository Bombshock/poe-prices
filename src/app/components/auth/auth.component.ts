import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component( {
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: [ './auth.component.scss' ]
} )
export class AuthComponent implements OnInit {

  public session;
  public username;
  public isLoading = false;
  public couldNotLogin = false;

  constructor(
    private auth: AuthService
  ) {
    this.session = auth.session;
    this.username = auth.username;
  }

  ngOnInit() {
    if( this.session && this.username && !this.isLoading && this.auth.autoLogin ) {
      this.send();
    }
  }

  public async send() {
    if( this.session && this.username && !this.isLoading ) {
      this.isLoading = true;
      try {
        await this.auth.authorize( this.username, this.session );
        this.isLoading = false;
        this.couldNotLogin = !this.auth.authorized;
      } catch( _e ) {
        this.isLoading = false;
        this.couldNotLogin = true;
      }
    }
  }
}
