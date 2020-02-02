import { Pipe, PipeTransform } from '@angular/core';
import { Item } from '../models/item';

const typeMapping = {
  1: 'normal',
  2: 'magic',
  3: 'rare',
  4: 'unique',
  5: 'currency',
  6: 'divination card'
}

@Pipe({
  name: 'itemFilter'
})
export class ItemFilterPipe implements PipeTransform {

  transform(items: Item[], filter: string): any {
    const _filter = filter.trim().toLocaleLowerCase();
    if (!filter) {
      return items;
    }
    return items.filter(item => {
      return (
        item.name.toLocaleLowerCase().indexOf(_filter) !== -1 ||
        item.typeLine.toLocaleLowerCase().indexOf(_filter) !== -1 ||
        `${item.frameType}` === _filter ||
        `${typeMapping[item.frameType]}`.indexOf(_filter) !== -1
      )
    });
  }

}
