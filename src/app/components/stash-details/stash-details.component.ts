import { Component, OnInit } from '@angular/core';
import { StashContainerComponent } from '../stash-container/stash-container.component';
import { ComparatorService } from 'src/app/services/comparator.service';
import { Item, ItemListing, ItemQueryResultMapped } from 'src/app/models/item';
import { weights } from 'src/app/models/currencyWeight';
import { ItemFilterPipe } from 'src/app/pipes/item-filter.pipe';
import { ApiService } from 'src/app/services/api.service';
import { StaticItem, StaticGroup } from 'src/app/models/static';
import { MatDialog } from '@angular/material/dialog';
import { ItemDetailsComponent } from '../item-details/item-details.component';

@Component( {
  selector: 'app-stash-details',
  templateUrl: './stash-details.component.html',
  styleUrls: [ './stash-details.component.scss' ]
} )
export class StashDetailsComponent implements OnInit {

  public scale = 47;
  public open = 0;
  public max = 0;
  public textQuery = '';

  public currency: StaticGroup;
  public currencyMap: { [ key: string ]: StaticItem } = {};

  private queue: { (): Promise<any>; }[] = [];
  private filter = new ItemFilterPipe();

  constructor(
    public container: StashContainerComponent,

    private dialog: MatDialog,
    private api: ApiService,
    private comp: ComparatorService
  ) { }

  public async ngOnInit() {
    this.currency = ( await this.api.static() ).find( grp => grp.id === 'Currency' );
    this.currency.entries.forEach( entry => {
      this.currencyMap[ entry.id ] = entry;
    } );
    console.log( await this.comp.getStatGroup( 'Explicit' ) )
  }

  public load() {
    this.queue = [];
    const items = this.filter.transform( this.container.stashResult.items, this.textQuery );
    this.max = this.open = items.length;
    items.forEach( item => {
      this.queue.push( () => {
        return this.comp.search( item )
          .then( ( result: ItemQueryResultMapped ) => {
            item.result = result;
            this.open--;
            this.sort();
            return wait( 500 );
          } )
      } )
    } );
    this.next();
  }

  public showItem( item: Item ) {
    this.dialog.open( ItemDetailsComponent, {
      data: { item }
    } );
  }

  public sort() {
    this.container.stashResult.items = this.container.stashResult.items.sort( ( a: Item, b: Item ) => {
      if ( a.result && !b.result ) {
        return -1;
      }
      if ( b.result && !a.result ) {
        return 1;
      }
      if ( !a.result && !b.result ) {
        return a.x - b.x;
      }
      const bc = weights[ b.result.result[ 0 ].listing.price.currency ] * b.result.result[ 0 ].listing.price.amount;
      const ac = weights[ a.result.result[ 0 ].listing.price.currency ] * a.result.result[ 0 ].listing.price.amount;
      return bc - ac;
    } )
  }

  private next() {
    if ( this.queue.length ) {
      this.queue.shift()().then( () => wait( 200 ) ).then( () => this.next() )
    }
  }
}

function wait( ms ) {
  return new Promise( resolve => {
    setTimeout( resolve, ms );
  } );
}
