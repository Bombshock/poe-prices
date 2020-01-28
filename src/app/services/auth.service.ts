import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable( {
  providedIn: 'root'
} )
export class AuthService {

  public authorized = false;

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

    return result;
  }
}
