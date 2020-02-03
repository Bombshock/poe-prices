import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { StaticItem } from 'src/app/models/static';
import { ApiService } from 'src/app/services/api.service';

@Component( {
  selector: 'app-item-price',
  templateUrl: './item-price.component.html',
  styleUrls: [ './item-price.component.scss' ]
} )
export class ItemPriceComponent implements OnInit, OnChanges {

  @Input()
  public chaos: number;
  
  public currencyMap: { [ key: string ]: StaticItem } = {};
  public price = 0;

  constructor(
    private api: ApiService
  ) { }

  ngOnChanges() {
    this.calculatePrice();
  }

  async ngOnInit() {
    const currency = ( await this.api.static() ).find( grp => grp.id === 'Currency' );
    currency.entries.forEach( entry => {
      this.currencyMap[ entry.id ] = entry;
    } );
    this.calculatePrice();
  }

  private calculatePrice() {
    this.price = 0;

    if ( this.chaos ) {
      this.price = this.chaos;
    }
  }

}
