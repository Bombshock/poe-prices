import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Item, ItemQueryResult, ItemQueryResultMapped } from '../models/item';
import { HttpClient } from '@angular/common/http';
import { StatGroup } from '../models/stat';

@Injectable( {
  providedIn: 'root'
} )
export class ComparatorService {

  constructor(
    private api: ApiService,
    private http: HttpClient
  ) { }

  public async getStatGroup( groupName: 'Pseudo' | 'Explicit' | 'Implicit' ) {
    const stats = await this.api.stats();
    return stats.find( grp => grp.label === groupName );
  }

  public async search( item: Item ): Promise<ItemQueryResultMapped> {
    if ( item.frameType > 3 ) {
      return this.executeFilter( item, this.buildSimpleFilter( item ) );
    } else {
      let result = await this.executeFilter( item, await this.buildItemFilter( item, true, true ) );
      let id = result.id;

      if ( !result ) {
        result = await this.executeFilter( item, await this.buildItemFilter( item, true, true, false ) );
      }
      if ( !result ) {
        result = await this.executeFilter( item, await this.buildItemFilter( item, true, false ) );
      }
      if ( !result ) {
        result = await this.executeFilter( item, await this.buildItemFilter( item, true, false, false ) );
      }
      if ( !result ) {
        result = await this.executeFilter( item, await this.buildItemFilter( item, false, false ) );
      }
      if ( !result ) {
        result = await this.executeFilter( item, await this.buildItemFilter( item, false, false, false ) );
      }

      return { id, result: result.result, total: result.total };
    }
  }

  private normalizeMod( mod: string ) {
    const matches = mod.match( /([+-]?([0-9]*[.])?[0-9]+)/gi );
    return {
      value: matches ? parseFloat( matches[ 0 ] ) : 0,
      text: mod.replace( /(([0-9]*[.])?[0-9]+)/gi, '#' )
    }
  }

  private async executeFilter( item: Item, filter ): Promise<ItemQueryResultMapped> {
    const result: ItemQueryResult = await this.http.post<ItemQueryResult>( `https://www.pathofexile.com/api/trade/search/${ item.league }`, filter ).toPromise();
    const itemIds = result.result.slice( 0, 9 );

    console.log( result.id );

    if ( itemIds.length === 0 ) return;

    const items = await this.api.items( itemIds, result.id );

    const filtered = items.filter( i => !!i.listing.price );

    if ( filtered.length === 0 ) return;

    return {
      id: result.id,
      result: items.filter( i => !!i.listing.price ),
      total: result.total
    };
  }

  private async buildItemFilter( item: Item, explicit = true, implicit = true, online = true ) {
    const body = this.buildSimpleFilter( item );
    const pseudoStats = await this.getStatGroup( 'Pseudo' );
    const explicitStats = await this.getStatGroup( 'Explicit' );
    const implicitStats = await this.getStatGroup( 'Implicit' );
    const filters = [];
    const maxSockets = this.getMaxSocketsLinked( item );

    const pseudos = {};
    const explicits = [];
    const implicits = [];

    const factor = .99;

    if ( item.explicitMods && item.explicitMods.length ) {
      item.explicitMods.forEach( mod => {
        const normalized = this.normalizeMod( mod );
        const pseudoEntry = this.findModInList( normalized.text, pseudoStats );
        if ( pseudoEntry ) {
          pseudos[ pseudoEntry.id ] = pseudos[ pseudoEntry.id ] || 0;
          pseudos[ pseudoEntry.id ] += normalized.value;
        } else {
          explicits.push( normalized )
        }
      } )
    }

    if ( item.implicitMods && item.implicitMods.length ) {
      item.implicitMods.forEach( mod => {
        const normalized = this.normalizeMod( mod );
        const pseudoEntry = this.findModInList( normalized.text, pseudoStats );
        if ( pseudoEntry ) {
          pseudos[ pseudoEntry.id ] = pseudos[ pseudoEntry.id ] || 0;
          pseudos[ pseudoEntry.id ] += normalized.value;
        } else {
          implicits.push( normalized )
        }
      } )
    }

    Object.keys( pseudos )
      .map( id => {
        return {
          id,
          value: pseudos[ id ]
        }
      } )
      .forEach( item => {
        if ( item && item.value > 0 ) {
          filters.push( {
            id: item.id,
            value: {
              min: item.value * factor
            },
            disabled: false
          } )
        }
      } );

    if ( explicit ) {
      explicits.forEach( item => {
        const filter = this.findModInList( item.text, explicitStats );
        if ( filter ) {
          filters.push( {
            id: filter.id,
            value: {
              min: item.value * factor
            },
            disabled: false
          } )
        }
      } )

    }

    if ( implicit ) {
      implicits.forEach( item => {
        const filter = this.findModInList( item.text, implicitStats );
        if ( filter ) {
          filters.push( {
            id: filter.id,
            value: {
              min: item.value * factor
            },
            disabled: false
          } )
        }
      } )
    }

    console.log( filters );

    body.query.stats.push( {
      type: 'and',
      filters
    } )

    if ( maxSockets > 0 ) {
      body.query.filters = {
        socket_filters: {
          disabled: false,
          filters: {
            links: {
              min: maxSockets
            }
          }
        }
      }
    }

    body.query.status.option = online ? 'online' : 'any';

    return body;
  }

  private findModInList( mod: string, stats: StatGroup ) {
    const low = mod.toLocaleLowerCase();
    const sanitizedMods = [
      low,
      low.replace( ' to ', ' total ' ),
      low.replace( ' to ', ' total to ' ),
      low.replace( '+', '' )
    ];
    return stats.entries.find( stat => sanitizedMods.includes( stat.text.toLocaleLowerCase() ) )
  }

  private getMaxSocketsLinked( item: Item ): number {
    if ( !item.sockets ) {
      return 0;
    }

    const grpMap = {};

    item.sockets.forEach( socket => {
      grpMap[ socket.group ] = grpMap[ socket.group ] || 0;
      grpMap[ socket.group ]++;
    } );

    let highest = Object
      .values( grpMap )
      .reduce( ( prev: number, next: number ) => {
        return prev > next ? prev : next;
      }, 0 );

    return highest as number;
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

    if ( item.typeLine ) {
      body.query.type = item.typeLine;
    }

    if ( item.frameType >= 3 ) {
      if ( item.name ) {
        body.query.name = item.name;
      }
      if ( item.frameType === 8 ) {
        body.query.name = item.typeLine;
        body.query.type = 'Prophecy';
      }
    } else {
      // body.query.status.option = 'any';
    }

    return body;
  }

}