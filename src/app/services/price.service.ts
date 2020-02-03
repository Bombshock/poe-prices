import { Injectable } from '@angular/core';
import { Item } from '../models/item';
import { weights } from '../models/currencyWeight';

@Injectable( {
  providedIn: 'root'
} )
export class PriceService {

  constructor() { }

  public calculate( item: Item ) {
    let price = 0;
    let isCurrency = item.category ? item.category.group === 'Currency' : false;

    if ( !item.result ) {
      return 0;
    }

    const first = item.result.result.slice( isCurrency ? 3 : 0, isCurrency ? 6 : 3 );

    first.forEach( itemListing => {
      const listingPrice = weights[ itemListing.listing.price.currency ] * itemListing.listing.price.amount;
      price += listingPrice;
    } );
    return Math.round( price / first.length * 10 ) / 10;
  }
}
