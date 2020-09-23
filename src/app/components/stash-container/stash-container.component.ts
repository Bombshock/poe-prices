import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { ApiService, StashRequestResult, Stash } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';

@Component( {
  selector: 'app-stash-container',
  templateUrl: './stash-container.component.html',
  styleUrls: [ './stash-container.component.scss' ]
} )
export class StashContainerComponent implements OnInit {

  public activeIndex = 0;
  public isLoading = false;
  public stashResult: StashRequestResult;
  public activeStash: Stash;

  private cache = {};

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    private api: ApiService
  ) {
    this.setIndex( window.localStorage.getItem( 'activeIndex' ) );
    this.route.queryParams.subscribe( ( params: Params ) => {
      setTimeout( () => {
        if( params.index ) {
          this.setIndex( params.index );
        }
        this.refresh();
      } )
    } );
    this.auth.league.subscribe( league => {
      if( league ) {
        this.setIndex( 0 );
        this.refresh();
      }
    } )
  }

  setIndex( index: any ) {
    this.activeIndex = parseInt( index );
    if( isNaN( this.activeIndex ) ) {
      this.activeIndex = 0;
    }
    window.localStorage.setItem( 'activeIndex', `${ this.activeIndex }` );
  }

  ngOnInit() {
    this.cache = {};
  }

  public async refresh() {
    this.activeStash = null;
    this.isLoading = true;
    this.stashResult = await this.api.stash( this.activeIndex );
    this.isLoading = false;

    this.cache[ this.activeIndex ] = this.stashResult.items;

    this.stashResult.tabs.forEach( tab => {
      if( tab.i === this.activeIndex ) {
        this.activeStash = tab;
      }
    } )
  }
}
