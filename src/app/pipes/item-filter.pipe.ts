import { Pipe, PipeTransform } from '@angular/core';
import { Item } from '../models/item';

const typeMapping = {
  0: 'normal',
  1: 'magic',
  2: 'rare',
  3: 'unique',
  5: 'currency',
  6: 'divination card'
}

@Pipe( {
  name: 'itemFilter'
} )
export class ItemFilterPipe implements PipeTransform {

  transform( items: Item[], filter: string ): any {
    if ( !items ) {
      return [];
    }
    const _filter = filter.trim().toLocaleLowerCase();
    if ( !filter ) {
      return items.sort( this.sortFn );
    }
    return items
      .filter( item => {
        return (
          item.name.toLocaleLowerCase().indexOf( _filter ) !== -1 ||
          item.typeLine.toLocaleLowerCase().indexOf( _filter ) !== -1 ||
          `${ item.frameType }` === _filter ||
          `${ typeMapping[ item.frameType ] }`.indexOf( _filter ) !== -1
        )
      } )
      .sort( this.sortFn );
  }

  private sortFn( a: Item, b: Item ) {
    const ac = a.priceInChaos;
    const bc = b.priceInChaos;

    if ( ac && !bc ) {
      return -1;
    }
    if ( !ac && bc ) {
      return 1;
    }
    if ( !ac && !bc ) {
      return 0;
    }

    const res = ac > bc ? -1 : ac < bc ? 1 : 0;
    return res;
  }

}
