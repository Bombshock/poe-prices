import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Item, ItemListing } from '../models/item';
import { Stat, StatGroup } from '../models/stat';
import { parse } from 'querystring';
import { HttpClient } from '@angular/common/http';

@Injectable( {
  providedIn: 'root'
} )
export class ComparatorService {

  constructor(
    private api: ApiService,
    private http: HttpClient
  ) { }

  public async pseudoStats(): Promise<StatGroup> {
    const stats = await this.api.stats();
    return stats.find( grp => grp.label === 'Pseudo' );
  }

  public async explicitStats(): Promise<StatGroup> {
    const stats = await this.api.stats();
    return stats.find( grp => grp.label === 'Explicit' );
  }

  public async implicitStats(): Promise<StatGroup> {
    const stats = await this.api.stats();
    return stats.find( grp => grp.label === 'Implicit' );
  }

  public extractStats( item: Item ) {
    const mods = ( item.explicitMods || [] ).concat( ( item.implicitMods || [] ) );
    const normalizedMods = mods.map( mod => {
      const matches = mod.match( /([+-]?([0-9]*[.])?[0-9]+)/gi );
      return {
        value: matches ? parseFloat( matches[ 0 ] ) : 0,
        mod: mod.replace( /(([0-9]*[.])?[0-9]+)/gi, '#' )
      }
    } );
    const map = {};
    normalizedMods.forEach( entry => {
      map[ entry.mod ] = map[ entry.mod ] || 0;
      map[ entry.mod ] += entry.value;
    } );

    return map;
  }

  public async search( item: Item ): Promise<ItemListing> {
    if ( item.frameType > 3 ) {
      return this.executeFilter( item, this.buildSimpleFilter( item ) );
    } else {
      let result = await this.executeFilter( item, await this.buildItemFilter( item, true ) );
      if(!result) {
        result = await this.executeFilter( item, await this.buildItemFilter( item, false ) );
      }
      return result;
    }
  }

  private async executeFilter( item: Item, filter ) {
    const result: any = await this.http.post( `https://www.pathofexile.com/api/trade/search/${ item.league }`, filter ).toPromise();
    const itemIds = result.result.slice( 0, 5 );

    if ( itemIds.length === 0 ) return;

    const items = await this.api.items( itemIds, result.id );

    return items.find( i => !!i.listing.price );
  }

  private async buildItemFilter( item: Item, complex: boolean ) {
    const body = this.buildSimpleFilter( item );
    const pseudoStats = await this.pseudoStats();
    const explicitStats = await this.explicitStats();
    const itemMods = this.extractStats( item );
    const filters = [];

    Object.keys( itemMods ).forEach( mod => {
      const value = itemMods[ mod ];
      const sanitizedMods = [ mod.replace( ' to ', ' total ' ), mod.replace( ' to ', ' total to ' ) ];
      let stat = pseudoStats.entries.find( stat => sanitizedMods.includes( stat.text ) );

      if ( !stat && complex ) {
        stat = explicitStats.entries.find( stat => sanitizedMods.includes( stat.text ) );
      }

      if ( stat ) {
        filters.push( {
          id: stat.id,
          value: {
            min: value
          },
          disabled: false
        } )
      } else {
        console.log( 'could not find stat for mod', mod, `=> ( ${ sanitizedMods } )` );
      }
    } );

    body.query.stats.push( {
      type: 'and',
      filters
    } )

    return body;
  }

  private buildSimpleFilter( item: Item ) {
    const body: any = {
      query: {
        status: {
          option: 'online'
        },
        stats: []
      },
      sort: {
        price: 'asc'
      }
    }

    if ( item.frameType >= 3 ) {
      if ( item.name ) {
        body.query.name = item.name;
      }
      if ( item.typeLine ) {
        body.query.type = item.typeLine;
      }
      if ( item.frameType === 8 ) {
        body.query.name = item.typeLine;
        body.query.type = 'Prophecy';
      }
    } else {
      body.query.status.option = 'any';
    }

    return body;
  }

}
