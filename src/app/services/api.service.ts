import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { StatGroup } from '../models/stat';
import { ItemListing } from '../models/item';
import { StaticGroup } from '../models/static';

@Injectable( {
  providedIn: 'root'
} )
export class ApiService {

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) { }

  public stash( index: number ): Promise<StashRequestResult> {
    return this.http.get(
      `https://www.pathofexile.com/character-window/get-stash-items` +
      `?accountName=${ this.auth.username }` +
      `&realm=pc&league=Metamorph&tabs=1&tabIndex=${ index }&public=false`
    ).toPromise().then( ( result: any ) => {
      return result;
    } );
  }

  public stats(): Promise<StatGroup[]> {
    const stats = window.localStorage.getItem( 'stats' );
    if ( stats ) {
      return Promise.resolve( JSON.parse( stats ).result );
    } else {
      return this.http.get<{ result: StatGroup[] }>( `https://www.pathofexile.com/api/trade/data/stats` ).toPromise().then( result => {
        window.localStorage.setItem( 'stats', JSON.stringify( result ) );
        return result.result;
      } )
    }
  }

  public static(): Promise<StaticGroup[]> {
    const staticData = window.localStorage.getItem( 'static' );
    if ( staticData ) {
      return Promise.resolve( JSON.parse( staticData ).result );
    } else {
      return this.http.get<{ result: StaticGroup[] }>( `https://www.pathofexile.com/api/trade/data/static` ).toPromise().then( result => {
        window.localStorage.setItem( 'static', JSON.stringify( result ) );
        return result.result;
      } )
    }
  }

  public items( ids: string[], query: string ): Promise<ItemListing[]> {
    return this.http.get<{ result: ItemListing[] }>( `https://www.pathofexile.com/api/trade/fetch/${ ids.join( ',' ) }?query=${ query }` ).toPromise().then( res => res.result );
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
  srcR: string
};

export type StashType = 'NormalStash' | 'PremiumStash' | 'EssenceStash' | 'CurrencyStash' | 'MapStash' | 'DivinationCardStash';

export type StashRequestResult = {
  tabs: Stash[];
  items: any[];
  numTabs: number;
};