import { Component, OnInit } from '@angular/core';
import { TitleService } from 'src/app/services/title.service';
import { ApiService, Stash } from 'src/app/services/api.service';
import { StashContainerComponent } from '../stash-container/stash-container.component';
import { Router } from '@angular/router';

@Component( {
  selector: 'app-stash-list',
  templateUrl: './stash-list.component.html',
  styleUrls: [ './stash-list.component.scss' ]
} )
export class StashListComponent implements OnInit {

  constructor(
    public container: StashContainerComponent,

    private router: Router,
  ) {
  }

  ngOnInit() {
  }

  public hasPriceMap( stash: Stash ) {
    const storageKey = `priceMap_${ stash.id }`;
    return !!stash.priceMap || !!window.localStorage.getItem( storageKey );
  }

  public getPrice( stash: Stash ) {
    let price = 0;
    const storageKey = `priceMap_${ stash.id }`;
    if( !stash.priceMap ) {
      try {
        stash.priceMap = JSON.parse( window.localStorage.getItem( storageKey ) );
      } catch( _e ) { }
    }
    if( stash.priceMap ) {
      price = Object.values( stash.priceMap ).reduce( ( prev, cur ) => {
        if( isNaN( cur ) || typeof cur !== 'number' ) {
          cur = 0;
        }
        return cur + prev;
      }, price );
      window.localStorage.setItem( storageKey, JSON.stringify( stash.priceMap ) );
    }
    return Math.round( price );
  }

  public navigate( stash: Stash ) {
    this.router.navigate( [ '/stashes' ], { queryParams: { index: stash.i } } );
  }
}
