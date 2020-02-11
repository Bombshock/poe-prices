import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Item } from 'src/app/models/item';
import { ComparatorService, ComplexItemType } from 'src/app/services/comparator.service';
import { StaticItem } from 'src/app/models/static';
import { ApiService } from 'src/app/services/api.service';

const { ipcRenderer, shell } = window[ 'require' ]( 'electron' );

@Component( {
  selector: 'app-item-details',
  templateUrl: './item-details.component.html',
  styleUrls: [ './item-details.component.scss' ]
} )
export class ItemDetailsComponent implements OnInit {

  public iconLoaded = false;

  public isNarrowLoading = false;
  public isNoMinMaxLoading = false;

  @ViewChild( 'icon' ) public icon: ElementRef;
  public currencyMap: { [ key: string ]: StaticItem } = {};

  constructor(
    public dialogRef: MatDialogRef<ItemDetailsComponent>,
    @Inject( MAT_DIALOG_DATA ) public data: { item: ComplexItemType & { result?: Item[ 'result' ], icon?: Item[ 'icon' ] } },
    private api: ApiService,
    private comp: ComparatorService,
    private elementRef: ElementRef
  ) {
    console.log( this, elementRef );
  }

  public async ngOnInit() {
    if( this.icon ) {
      const native: HTMLImageElement = this.icon.nativeElement;
      if( native.complete ) {
        this.iconLoaded = true;
        this.saveAsTemplate();
      } else {
        native.onload = () => {
          this.iconLoaded = true;
          this.saveAsTemplate();
        };
      }
      setTimeout( () => {
        if( native.complete ) {
          this.iconLoaded = true;
          this.saveAsTemplate();
        }
      } )
    } else {
      this.iconLoaded = true;
    }
    const currency = ( await this.api.static() ).find( grp => grp.id === 'Currency' );
    currency.entries.forEach( entry => {
      this.currencyMap[ entry.id ] = entry;
    } );
    if( !this.data.item.result ) {
      this.scan();
    }
    if( !this.icon && this.data.item.result ) {
      this.saveAsTemplate();
    }
  }

  saveAsTemplate() {
    setTimeout( () => {
      const tempalte = `<html>${ document.head.outerHTML }<body class="overlay">${ this.elementRef.nativeElement.outerHTML }</body></html>`;
      ipcRenderer.send( 'show-overley', tempalte, {
        width: this.elementRef.nativeElement.offsetWidth,
        height: this.elementRef.nativeElement.offsetHeight
      } );
    } )
  }

  async openNarrow() {
    this.isNarrowLoading = true;
    const result = await this.comp.search( this.data.item );
    this.isNarrowLoading = false;
    this.openScan( result.id );
  }

  async openNoMinMax() {
    this.isNoMinMaxLoading = true;
    const result = await this.comp.search( this.data.item, { min: false, max: false, explicit: true, implicit: true } );
    this.isNoMinMaxLoading = false;
    this.openScan( result.id );
  }

  openScan( id: string ) {
    shell.openExternal( `https://pathofexile.com/trade/search/${ this.data.item.league }/${ id }` )
  }

  async scan() {
    this.iconLoaded = false;
    const result = await this.comp.search( this.data.item )
    this.data.item.result = result;
    this.iconLoaded = true;
    this.saveAsTemplate();
  }

}
