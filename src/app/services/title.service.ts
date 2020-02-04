import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable( {
  providedIn: 'root'
} )
export class TitleService {

  public prefix = '';
  public main = '';
  public suffix = '';

  constructor() { }

  get title(): string {
    const out = [];

    if ( this.prefix ) {
      out.push( this.prefix );
    }

    if ( this.main ) {
      out.push( this.main );
    }

    if ( this.suffix ) {
      out.push( this.suffix );
    }

    return out.join( ' - ' );
  }

}
