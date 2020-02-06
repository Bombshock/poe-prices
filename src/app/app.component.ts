import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import { ClipboardService } from './services/clipboard.service';
import { ComplexItemType, ComparatorService } from './services/comparator.service';
import { Item } from './models/item';
import { MatDialog } from '@angular/material/dialog';
import { ItemDetailsComponent } from './components/item-details/item-details.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  private rarityMap = ["Normal", "Magic", "Rare", "Unique", "Gem", "Currency", "Divination Card"];
  private currentHandle;

  constructor(
    public auth: AuthService,

    private clipboard: ClipboardService,
    private dialog: MatDialog,
    private comp: ComparatorService
  ) {
    const rarityMap = {};
    this.clipboard.selection.subscribe(async (selection) => {
      const explicits = await this.comp.getStatGroup('Explicit');
      const splitted = selection.split('--------').map(x => x.trim()).map(x => x.split('\r\n'));
      const rarity = splitted[0].shift().replace('Rarity: ', '');
      rarityMap[rarity] = true;

      const item: ComplexItemType & { result?: Item['result'] } = {
        typeLine: splitted[0].length > 1 ? splitted[0][1] : splitted[0][0],
        frameType: this.rarityMap.indexOf(rarity),
        league: this.auth.league.getValue(),
        name: splitted[0].length > 1 ? splitted[0][0] : '',
        explicitMods: [],
        implicitMods: [],
        descrText: '',
        properties: [],
        sockets: []
      }


      splitted.forEach((grp, i) => {
        grp.forEach(line => {
          if (line.indexOf('(implicit)') !== -1) {
            const implicit = line.replace('(implicit)', '').trim();
            item.implicitMods.push(implicit);
            return;
          }
          if (line.indexOf('Sockets:') !== -1) {
            const sockets = line.replace('Sockets:', '').trim().split(' ');
            sockets.forEach((sgrp, i) => {
              sgrp.split('-').forEach(color => {
                item.sockets.push({
                  attr: '',
                  group: i,
                  sColour: color
                });
              })
            });
            return;
          }

          const _line = line.replace('(crafted)', '').trim();
          const normalized = this.comp.normalizeMod(_line);
          if (normalized.matched) {
            const mod = this.comp.findModInList(normalized.text, explicits);
            if (mod) {
              item.explicitMods.push(_line);
              return;
            }
          }

          item.descrText = line;
        })
      })

      if (this.currentHandle) {
        this.currentHandle.close();
      }

      this.currentHandle = this.dialog.open(ItemDetailsComponent, {
        data: { item }
      });
    })
  }

  /**  0: 'normal',
  1: 'magic',
  2: 'rare',
  3: 'unique',
  5: 'currency',
  6: 'divination card' */
  // ["Divination Card","Normal","Magic","Unique","Rare","Currency","Gem"] 
  /*
  Rarity: Divination Card
  The Wretched
  --------
  Stack Size: 1/6
  --------
  Belt
  --------
  Necromancers, believe me, are more terrifying than their thralls.






Rarity: Unique
Briskwrap
Strapped Leather
--------
Evasion Rating: 243 (augmented)
--------
Requirements:
Level: 9
Dex: 32
--------
Sockets: R-G G-G 
--------
Item Level: 82
--------
15% increased Dexterity
10% increased Attack Speed
+145 to Evasion Rating
+35% to Cold Resistance
5% increased Movement Speed
20% increased Mana Recovery from Flasks
--------
"I carry neither food nor drink. I rely on the charity
of my fellow wayfarers. Dead men are generous men."
- Taruk of the Wildmen

  */

}
