import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { StashContainerComponent } from '../stash-container/stash-container.component';
import { ComparatorService } from 'src/app/services/comparator.service';
import { Item, ItemQueryResultMapped } from 'src/app/models/item';
import { ItemFilterPipe } from 'src/app/pipes/item-filter.pipe';
import { ApiService } from 'src/app/services/api.service';
import { StaticItem, StaticGroup } from 'src/app/models/static';
import { MatDialog } from '@angular/material/dialog';
import { ItemDetailsComponent } from '../item-details/item-details.component';
import { PriceService } from 'src/app/services/price.service';

@Component( {
  selector: 'app-stash-details',
  templateUrl: './stash-details.component.html',
  styleUrls: [ './stash-details.component.scss' ]
} )
export class StashDetailsComponent implements OnInit, OnChanges {

  @Input() stash;

  public scale = 47;
  public open = 0;
  public max = 0;
  public textQuery = '';
  public items: Item[] = [];

  public currency: StaticGroup;
  public currencyMap: { [ key: string ]: StaticItem } = {};

  private queue: { (): Promise<any>; }[] = [];
  private filter = new ItemFilterPipe();

  constructor(
    public container: StashContainerComponent,

    private dialog: MatDialog,
    private api: ApiService,
    private comp: ComparatorService,
    private price: PriceService
  ) {
    console.log( this );
  }

  get queueLength() {
    return this.queue.length;
  }

  public ngOnChanges() {
    if( this.container && this.container.stashResult ) {
      this.items = this.filter.transform( this.container.stashResult.items, this.textQuery );
    } else {
      this.items = [];
    }
  }

  public async ngOnInit() {
    this.currency = ( await this.api.static() ).find( grp => grp.id === 'Currency' );
    this.currency.entries.forEach( entry => {
      this.currencyMap[ entry.id ] = entry;
    } );
  }

  public stop() {
    this.queue = [];
    this.max = 0;
    this.open = 0;
  }

  public load() {
    this.queue = [];
    const items = this.items;
    const activeStash = this.container.activeStash;
    this.max = this.open = items.length;
    activeStash.priceMap = {};
    items.forEach( item => {
      this.queue.push( () => {
        return this.comp.search( item )
          .then( ( result: ItemQueryResultMapped ) => {
            item.result = result;
            item.priceInChaos = this.price.calculate( item );
            activeStash.priceMap[ item.id ] = item.priceInChaos;
            this.open--;
            this.ngOnChanges();
            return wait( 1000 / this.api.allowedRequestsPerSecond );
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

  private async next() {
    if( this.queue.length ) {
      await this.queue.shift()();
      this.next();
    }
  }
}

function wait( ms ) {
  return new Promise( resolve => {
    setTimeout( resolve, ms );
  } );
}
