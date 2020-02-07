import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

const electron = window[ 'require' ]( 'electron' );
const { clipboard, app, screen } = electron.remote

@Injectable( {
  providedIn: 'root'
} )
export class ClipboardService {

  public readonly selection = new Subject<any>();

  constructor() {
    let last;
    setInterval( () => {
      let now = clipboard.readText( 'selection' );
      if( now !== last && now.indexOf( 'Rarity:' ) !== -1 ) {
        this.selection.next( now );
        now += ' ';
        clipboard.writeText( now, 'selection' );
        last = now;
        // app.console.log(now);
        // app.console.log(screen.getCursorScreenPoint());
      }
    }, 200 )
  }
}
