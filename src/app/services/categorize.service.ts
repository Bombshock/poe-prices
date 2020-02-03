import { Injectable } from '@angular/core';
import { Item } from '../models/item';
import { ApiService } from './api.service';

@Injectable( {
  providedIn: 'root'
} )
export class CategorizeService {

  constructor(
    private api: ApiService
  ) { }

  public async categorizeItem( item: Item ) {
    let statics = await this.api.static();
    let items = await this.api.items();

    if ( this.isOrgan( item ) ) {
      return {
        group: 'Organ',
        text: item.typeLine,
        map: false
      }
    }

    let mapTier = this.getMapTier( item );

    if ( mapTier > 0 ) {
      statics = statics.filter( grp => grp.id === 'MapsTier' + mapTier )
    } else {
      statics = statics.filter( grp => grp.id.indexOf( 'MapsTier' ) === -1 )
    }

    for ( let i = 0; i < statics.length; i++ ) {
      const staticGroup = statics[ i ];
      for ( let j = 0; j < staticGroup.entries.length; j++ ) {
        const staticGroupEntry = staticGroup.entries[ j ];
        if ( item.typeLine.indexOf( staticGroupEntry.text ) !== -1 ) {
          return {
            group: staticGroup.label,
            text: staticGroupEntry.text,
            map: mapTier > 0,
            src: 'static'
          };
        }
      }
    }

    const itemName = item.name ? item.name + ' ' + item.typeLine : item.typeLine;

    console.log( itemName );

    for ( let i = 0; i < items.length; i++ ) {
      const itemGroup = items[ i ];
      for ( let j = 0; j < itemGroup.entries.length; j++ ) {
        const itemGroupEntry = itemGroup.entries[ j ];
        if ( ( !itemGroupEntry.name && itemGroupEntry.text === item.typeLine ) || ( itemGroupEntry.name === item.name && itemGroupEntry.text === item.typeLine ) ) {
          return {
            group: itemGroup.label,
            text: itemGroupEntry.text,
            map: mapTier > 0,
            src: 'items'
          };
        }
      }
    }

    for ( let i = 0; i < items.length; i++ ) {
      const itemGroup = items[ i ];
      for ( let j = 0; j < itemGroup.entries.length; j++ ) {
        const itemGroupEntry = itemGroup.entries[ j ];
        if ( item.typeLine.indexOf( itemGroupEntry.type ) !== -1 ) {
          return {
            group: itemGroup.label,
            text: itemGroupEntry.text,
            map: mapTier > 0,
            src: 'items-fuzzy'
          };
        }
      }
    }
  }

  public isOrgan( item: Item ): boolean {
    return item.descrText === 'Combine this with four other different samples in Tane\'s Laboratory.'
  }

  public isProphecy( item: Item ): boolean {
    return item.frameType === 8;
  }

  public getMapTier( item: Item ): number {
    let mapTier = -1;
    if ( item.properties ) {
      const prop = item.properties.find( prop => prop.name === 'Map Tier' );
      if ( prop ) {
        mapTier = parseInt( prop.values[ 0 ][ 0 ] )
      }
    }
    return mapTier;
  }
}
