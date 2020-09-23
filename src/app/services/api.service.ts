import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from './auth.service';
import { StatGroup } from '../models/stat';
import { ItemListing, ItemQueryResult, StaticItemDataGroup } from '../models/item';
import { StaticGroup } from '../models/static';
import { LeagueItemType } from './comparator.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarTimerComponent } from '../components/snackbar-timer/snackbar-timer.component';

@Injectable( {
  providedIn: 'root'
} )
export class ApiService {

  public allowedRequestsPerSecond = 4 / 6;

  private cache: { [ key: string ]: Promise<any> } = {};

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private snackbar: MatSnackBar
  ) { }

  public stash( index: number ): Promise<StashRequestResult> {
    return this.http.get(
      `https://www.pathofexile.com/character-window/get-stash-items` +
      `?accountName=${ this.auth.username }` +
      `&realm=pc&league=${ this.auth.league.getValue() }&tabs=1&tabIndex=${ index }&public=false`
    ).toPromise().then( ( result: any ) => {
      return result;
    } );
  }

  public stats(): Promise<StatGroup[]> {
    return this.getCachedData( 'stats' );
  }

  public items(): Promise<StaticItemDataGroup[]> {
    return this.getCachedData( 'items' );
  }

  public static(): Promise<StaticGroup[]> {
    return this.getCachedData( 'static' );
  }

  public tradeItems( ids: string[], query: string ): Promise<ItemListing[]> {
    return this.http.get<{ result: ItemListing[] }>( `https://www.pathofexile.com/api/trade/fetch/${ ids.join( ',' ) }?query=${ query }` ).toPromise().then( res => res.result );
  }

  public clearCache() {
    [ 'static', 'items', 'stats' ].forEach( key => {
      window.localStorage.removeItem( key );
    } );
    this.cache = {};
  }

  private itemQueryQueue = [];
  private itemQueueInProgres = false;
  public queueItemQuery( item: LeagueItemType, filter ): Promise<ItemQueryResult> {
    const prom = new Promise<ItemQueryResult>( ( resolve ) => {
      this.itemQueryQueue.push( async () => {
        let result = await this.executeItemQuery( item, filter );
        resolve( result );
      } )
    } );

    if( !this.itemQueueInProgres ) {
      this.queueNext();
    }

    return prom;
  }

  private async queueNext() {
    if( !this.itemQueueInProgres && this.itemQueryQueue.length ) {
      this.itemQueueInProgres = true;
      await this.itemQueryQueue.shift()();
      await wait( 1000 / this.allowedRequestsPerSecond );
      this.itemQueueInProgres = false;
      this.queueNext();
    }
  }

  private async executeItemQuery( item: LeagueItemType, filter, c = 0 ): Promise<ItemQueryResult> {
    console.log( 'EXECUTE', c, 'start' )
    let result: ItemQueryResult;
    try {
      result = await this.http.post<ItemQueryResult>( `https://www.pathofexile.com/api/trade/search/${ item.league }`, filter ).toPromise();
    } catch( e ) {
      console.log( 'EXECUTE', c, 'error' )
      const error = e as HttpErrorResponse;
      if( error.status === 429 ) { // rate limit
        const account = error.headers.get( 'x-rate-limit-account' );
        const state = error.headers.get( 'x-rate-limit-account-state' );
        const [ , , timeout ] = state.split( ':' ).map( i => parseInt( i ) );
        const [ limit, interval ] = account.split( ':' ).map( i => parseInt( i ) );
        this.allowedRequestsPerSecond = limit / interval;
        if( c < 5 ) {
          console.log( 'EXECUTE', c, 'waiting for', timeout, 'seconds' );
          if( timeout > 0 ) {
            this.snackbar.openFromComponent( SnackbarTimerComponent, { duration: timeout * 1000, data: timeout } );
          }
          await wait( timeout * 1000 );
          result = await this.executeItemQuery( item, filter, c + 1 );
        }
      }
    }
    console.log( 'EXECUTE', c, 'end' );
    this.queueNext();
    return result;
  }

  private async getCachedData( key: 'static' | 'items' | 'stats' ) {
    if( this.cache[ key ] ) {
      return this.cache[ key ];
    }
    const storageData = window.localStorage.getItem( key );
    if( storageData ) {
      this.cache[ key ] = Promise.resolve( JSON.parse( storageData ).result );
    } else {
      this.cache[ key ] = this.http.get<{ result: any[] }>( `https://www.pathofexile.com/api/trade/data/${ key }` ).toPromise().then( result => {
        window.localStorage.setItem( key, JSON.stringify( result ) );
        return result.result;
      } )
    }
    return this.cache[ key ];
  }
}

function wait( ms ) {
  return new Promise( resolve => {
    setTimeout( resolve, ms );
  } );
}

export type Stash = {
  n: string;
  i: number;
  id: string;
  type: StashType;
  hidden: boolean;
  colour: { r: number, g: number, b: number };
  srcL: string;
  srcC: string;
  srcR: string;
  priceMap?: { [ key: string ]: number };
};

export type StashType = 'NormalStash' | 'PremiumStash' | 'EssenceStash' | 'CurrencyStash' | 'MapStash' | 'DivinationCardStash';

export type StashRequestResult = {
  tabs: Stash[];
  items: any[];
  numTabs: number;
};