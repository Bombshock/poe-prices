import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable( {
  providedIn: 'root'
} )
export class TitleService {

  public prefix = 'PoE';
  public suffix = '';

  constructor(
    private auth: AuthService
  ) { }

  get title(): string {
    const out = [ this.prefix ];

    if ( this.auth.authorized ) {
      out.push( this.auth.username );
    }

    if ( this.suffix ) {
      out.push( this.suffix );
    }

    return out.join( ' - ' );
  }

}
