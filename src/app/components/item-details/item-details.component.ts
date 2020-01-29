import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Item, ItemQueryResultMapped } from 'src/app/models/item';
import { ComparatorService } from 'src/app/services/comparator.service';
import { StaticItem } from 'src/app/models/static';
import { ApiService } from 'src/app/services/api.service';

const { shell } = window[ 'require' ]( 'electron' )

@Component( {
  selector: 'app-item-details',
  templateUrl: './item-details.component.html',
  styleUrls: [ './item-details.component.scss' ]
} )
export class ItemDetailsComponent implements OnInit {

  public iconLoaded = false;

  @ViewChild( 'icon' ) public icon: ElementRef;
  public currencyMap: { [ key: string ]: StaticItem } = {};

  constructor(
    public dialogRef: MatDialogRef<ItemDetailsComponent>,
    @Inject( MAT_DIALOG_DATA ) public data: { item: Item },
    private api: ApiService,
    private comp: ComparatorService
  ) { }

  public async ngOnInit() {
    const native: HTMLImageElement = this.icon.nativeElement;
    if ( native.complete ) {
      this.iconLoaded = true;
    } else {
      native.onload = () => this.iconLoaded = true;
    }
    setTimeout( () => {
      if ( native.complete ) {
        this.iconLoaded = true;
      }
    } )
    const currency = ( await this.api.static() ).find( grp => grp.id === 'Currency' );
    currency.entries.forEach( entry => {
      this.currencyMap[ entry.id ] = entry;
    } );
  }

  openRefSearch( id: string ) {
    shell.openExternal( `https://pathofexile.com/trade/search/${ this.data.item.league }/${ id }` )
  }

  scan() {
    this.iconLoaded = false;
    this.comp.search( this.data.item )
      .then( ( result: ItemQueryResultMapped ) => {
        this.data.item.result = result;
        this.iconLoaded = true;
      } );
  }

}
