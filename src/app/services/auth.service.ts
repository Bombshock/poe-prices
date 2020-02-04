import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from './api.service';

@Injectable( {
  providedIn: 'root'
} )
export class AuthService {

  public authorized = false;
  public autoLogin = true;

  private _username;
  private _session;

  constructor(
    private http: HttpClient
  ) { }

  get username(): string {
    return this._username || window.localStorage.getItem( 'username' ) || '';
  }

  get session(): string {
    return this._session || window.localStorage.getItem( 'session' ) || '';
  }

  public async authorize( username: string, session: string ) {
    window.localStorage.setItem( 'session', session );
    window.localStorage.setItem( 'username', username );

    const cookies = await window[ 'require' ]( 'electron' ).remote.session.defaultSession.cookies;

    cookies.remove( 'https://www.pathofexile.com', 'POESESSID' )

    cookies.set( {
      url: 'https://www.pathofexile.com',
      name: 'POESESSID',
      value: session
    } );

    const result = await this.http.get( `https://www.pathofexile.com/character-window/get-characters?accountName=${ username }` ).toPromise();

    this._username = username;
    this._session = session;
    this.authorized = true;
    this.autoLogin = true;

    return result;
  }

  public logout() {
    this.authorized = false;
    this.autoLogin = false;
  }
}
