import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Character } from '../models/character';
import { TitleService } from './title.service';
import { BehaviorSubject } from 'rxjs';

@Injectable( {
  providedIn: 'root'
} )
export class AuthService {

  public authorized = false;
  public autoLogin = true;
  public characters: Character[] = [];
  public league = new BehaviorSubject<string | undefined>( undefined );
  public leagues: string[] = [];

  private _username;
  private _session;

  constructor(
    private http: HttpClient,
    private title: TitleService
  ) {
    this.league.subscribe( league => {
      if ( league ) {
        this.title.suffix = league;
      }
    } )
  }

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

    this.characters = await this.http.get<Character[]>( `https://www.pathofexile.com/character-window/get-characters?accountName=${ username }` ).toPromise();

    const lastChar = this.characters.find( c => c.lastActive );

    this.league.next( ( lastChar || this.characters[ 0 ] ).league );

    const map = {};

    this.characters.forEach( c => {
      map[ c.league ] = true;
    } );

    this.leagues = Object.keys( map );

    this._username = username;
    this._session = session;
    this.authorized = true;
    this.autoLogin = true;

    this.title.main = this.username;
  }

  public logout() {
    this.authorized = false;
    this.autoLogin = false;
  }
}
