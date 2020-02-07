import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { StatGroup } from '../models/stat';
import { ItemListing, StaticItemDataGroup } from '../models/item';
import { StaticGroup } from '../models/static';

@Injectable( {
  providedIn: 'root'
} )
export class ApiService {

  private cache: { [ key: string ]: Promise<any> } = {};

  constructor(
    private http: HttpClient,
    private auth: AuthService
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