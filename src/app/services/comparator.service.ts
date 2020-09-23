import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Item, ItemQueryResult, ItemQueryResultMapped } from '../models/item';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { StatGroup } from '../models/stat';
import { CategorizeService, Category } from './categorize.service';

@Injectable( {
  providedIn: 'root'
} )
export class ComparatorService {

  constructor(
    private api: ApiService,
    private http: HttpClient,
    private cat: CategorizeService
  ) { }

  public async getStatGroup( groupName: 'Pseudo' | 'Explicit' | 'Implicit' ) {
    const stats = await this.api.stats();
    return stats.find( grp => grp.label === groupName );
  }

  public async search(
    item: ComplexItemType,
    config?: ComperatorConfig
  ): Promise<ItemQueryResultMapped> {

    const category = await this.cat.categorizeItem( item );
    const defaultConfig = { category, min: true, minFactor: 0.99, ...config };

    item.category = category;

    console.log( item, category );

    if( item.frameType > 3 ) {
      return this.executeFilter( item, await this.buildSimpleFilter( item, category ) );
    } else {
      const chain = [
        async () => this.executeFilter( item, await this.buildItemFilter( item, { ...defaultConfig, explicit: true, implicit: true } ) ),
        async () => this.executeFilter( item, await this.buildItemFilter( item, { ...defaultConfig, explicit: true, implicit: false } ) ),
        async () => this.executeFilter( item, await this.buildItemFilter( item, { ...defaultConfig, explicit: false, implicit: false } ) ),
      ];

      let result;
      let id;

      while( chain.length && !result ) {
        let res = await chain.shift()();
        if( res.result.length ) {
          result = res;
        }
        if( !id ) {
          id = res.id;
        }
      }

      if( result ) {
        return { id, result: result.result, total: result.total };
      }
    }
  }

  public normalizeMod( mod: string ) {
    const matches = mod.match( /([+-]?([0-9]*[.])?[0-9]+)/gi );
    return {
      value: matches ? parseFloat( matches[ 0 ] ) : 0,
      text: mod.replace( /(([0-9]*[.])?[0-9]+)/gi, '#' ),
      matched: matches && matches.length > 0
    }
  }

  private async executeFilter( item: LeagueItemType, filter ): Promise<ItemQueryResultMapped> {
    const result = await this.api.queueItemQuery( item, filter );
    const itemIds = result.result.slice( 0, 9 );
    let filtered = [];

    if( itemIds.length ) {
      const items = await this.api.tradeItems( itemIds, result.id );
      filtered = items.filter( i => !!i.listing.price );
    }

    return {
      id: result.id,
      result: filtered,
      total: result.total
    };
  }

  private async buildItemFilter( item: ComplexItemType, options?: ComperatorConfig ) {
    options = options || {};
    const cat = options.category || await this.cat.categorizeItem( item );
    const body = await this.buildSimpleFilter( item, cat );
    const pseudoStats = await this.getStatGroup( 'Pseudo' );
    const explicitStats = await this.getStatGroup( 'Explicit' );
    const implicitStats = await this.getStatGroup( 'Implicit' );
    const filters = [];
    const maxSockets = this.getMaxSocketsLinked( item );

    const pseudos = {};
    const explicits = [];
    const implicits = [];

    if( item.explicitMods && item.explicitMods.length && options.explicit ) {
      item.explicitMods.forEach( mod => {
        const normalized = this.normalizeMod( mod );
        const pseudoEntry = this.findModInList( normalized.text, pseudoStats );
        if( pseudoEntry ) {
          pseudos[ pseudoEntry.id ] = pseudos[ pseudoEntry.id ] || 0;
          pseudos[ pseudoEntry.id ] += normalized.value;
        } else {
          explicits.push( normalized )
        }
      } )
    }

    if( item.implicitMods && item.implicitMods.length && options.implicit ) {
      item.implicitMods.forEach( mod => {
        const normalized = this.normalizeMod( mod );
        const pseudoEntry = this.findModInList( normalized.text, pseudoStats );
        if( pseudoEntry ) {
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
        if( item && item.value > 0 ) {
          const filter: any = {
            id: item.id,
            value: {},
            disabled: false
          }
          if( options.min ) {
            filter.value.min = item.value * ( options.minFactor || 1 );
          }
          if( options.max ) {
            filter.value.min = item.value * ( options.maxFactor || 1 );
          }
          filters.push( filter );
        }
      } );

    if( options.explicit ) {
      explicits.forEach( item => {
        const mod = this.findModInList( item.text, explicitStats );
        if( mod ) {
          const filter: any = {
            id: mod.id,
            value: {},
            disabled: false
          }
          if( options.min ) {
            filter.value.min = item.value * ( options.minFactor || 1 );
          }
          if( options.max ) {
            filter.value.min = item.value * ( options.maxFactor || 1 );
          }
          filters.push( filter );
        }
      } )
    }

    if( options.implicit ) {
      implicits.forEach( item => {
        const mod = this.findModInList( item.text, implicitStats );
        if( mod ) {
          const filter: any = {
            id: mod.id,
            value: {},
            disabled: false
          }
          if( options.min ) {
            filter.value.min = item.value * ( options.minFactor || 1 );
          }
          if( options.max ) {
            filter.value.min = item.value * ( options.maxFactor || 1 );
          }
          filters.push( filter );
        }
      } )
    }

    body.query.stats.push( {
      type: 'and',
      filters
    } )

    if( maxSockets > 0 ) {
      body.query.filters.socket_filters = {
        disabled: false,
        filters: {
          links: {
            min: maxSockets
          }
        }
      }
    }

    return body;
  }

  public findModInList( mod: string, stats: StatGroup ) {
    const low = mod.toLocaleLowerCase();
    const sanitizedMods = [
      low,
      low.replace( ' to ', ' total ' ),
      low.replace( ' to ', ' total to ' ),
      low.replace( '+', '' )
    ];
    return stats.entries.find( stat => sanitizedMods.includes( stat.text.toLocaleLowerCase() ) )
  }

  private getMaxSocketsLinked( item: SocketItemType ): number {
    if( !item.sockets ) {
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

  private async buildSimpleFilter( item: SimpleItemType, cat ) {
    const body: any = {
      query: {
        status: {
          option: 'any'
        },
        stats: [],
        filters: {
          trade_filters: {
            disabled: false,
            filters: {
              indexed: {
                option: '3days'
              },
              sale_type: {
                option: 'priced'
              }
            }
          }
        }
      },
      sort: {
        price: 'asc'
      }
    }

    if( this.cat.isOrgan( item ) ) {
      body.query.term = item.typeLine;
      return body;
    }

    if( this.cat.isProphecy( item ) ) {
      body.query.name = item.typeLine;
      body.query.type = 'Prophecy';
      return body;
    }

    if( this.cat.getMapTier( item ) > 0 ) {
      body.query.term = item.typeLine;
      return body;
    }

    if( cat && cat.group === 'Currency' ) {
      body.query.status.option = 'online';
    }

    if( cat ) {
      body.query.type = cat.text;
    } else {
      body.query.term = item.typeLine;
      return body;
    }

    if( item.frameType >= 3 ) {
      if( item.name ) {
        body.query.name = item.name;
      }
    }

    return body;
  }

}

function wait( ms ) {
  return new Promise( resolve => {
    setTimeout( resolve, ms );
  } );
}

export type ComperatorConfig = {
  category?: Category,
  explicit?: boolean,
  implicit?: boolean,
  min?: boolean,
  minFactor?: number,
  max?: boolean,
  maxFactor?: number
}

export type ComplexItemType = SimpleItemType & LeagueItemType & SocketItemType & {
  category?: Item[ 'category' ],
  explicitMods?: Item[ 'explicitMods' ],
  implicitMods?: Item[ 'implicitMods' ]
}

export type SimpleItemType = {
  typeLine: Item[ 'typeLine' ],
  name: Item[ 'name' ],
  descrText?: Item[ 'descrText' ],
  frameType: Item[ 'frameType' ],
  properties?: Item[ 'properties' ]
}

export type LeagueItemType = {
  league: Item[ 'league' ]
}

export type SocketItemType = {
  sockets?: Item[ 'sockets' ]
}