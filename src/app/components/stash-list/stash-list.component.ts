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

    private title: TitleService,
    private router: Router,
  ) {
    this.title.suffix = 'stashes';
  }

  ngOnInit() {
  }

  public navigate( stash: Stash ) {
    this.router.navigate( [ '/stashes' ], { queryParams: { index: stash.i } } );
  }

}
