import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if( environment.production ) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule( AppModule )
  .catch( err => console.error( err ) );

const log = console.log;
console.log = ( ...args ) => {
  const now = new Date();
  log( `${ padInt( now.getHours() ) }:${ padInt( now.getMinutes() ) }:${ padInt( now.getSeconds() ) }`, ...args );
}

function padInt( n ) {
  if( n < 10 ) {
    return `0${ n }`;
  }
  return `${ n }`;
}