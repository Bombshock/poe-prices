import { Pipe, PipeTransform } from '@angular/core';
import { Item } from '../models/item';

@Pipe( {
  name: 'itemFilter'
} )
export class ItemFilterPipe implements PipeTransform {

  transform( items: Item[], filter: string ): any {
    const _filter = filter.trim().toLocaleLowerCase();
    if ( !filter ) {
      return items;
    }
    return items.filter( item => {
      return item.name.toLocaleLowerCase().indexOf( _filter ) !== -1 || item.typeLine.toLocaleLowerCase().indexOf( filter ) !== -1
    } );
  }

}
