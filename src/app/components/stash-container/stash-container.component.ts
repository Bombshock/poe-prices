import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { ApiService, StashRequestResult, Stash } from 'src/app/services/api.service';

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
    private api: ApiService
  ) {
    this.route.queryParams.subscribe( ( params: Params ) => {
      this.activeIndex = parseInt( params.index );
      if ( isNaN( this.activeIndex ) ) {
        this.activeIndex = 0;
      }
      if ( this.cache[ this.activeIndex ] ) {
        this.stashResult.items = this.cache[ this.activeIndex ];
      } else {
        this.refresh();
      }
    } );
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
      if ( tab.i === this.activeIndex ) {
        this.activeStash = tab;
      }
    } )
  }
}
