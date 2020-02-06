import { Injectable } from '@angular/core';
import { Item } from '../models/item';
import { ApiService } from './api.service';

@Injectable( {
  providedIn: 'root'
} )
export class CategorizeService {

  constructor(
    private api: ApiService
  ) { }

  public async categorizeItem( item: Item ): Promise<Category> {
    let statics = await this.api.static();
    let items = await this.api.items();

    if ( this.isOrgan( item ) ) {
      return {
        group: 'Organ',
        text: item.typeLine,
        map: false
      }
    }

    let mapTier = this.getMapTier( item );

    if ( mapTier > 0 ) {
      statics = statics.filter( grp => grp.id === 'MapsTier' + mapTier )
    } else {
      statics = statics.filter( grp => grp.id.indexOf( 'MapsTier' ) === -1 )
    }

    for ( let i = 0; i < statics.length; i++ ) {
      const staticGroup = statics[ i ];
      const fuzzy = staticGroup.id.indexOf( 'Maps' ) === 0;
      for ( let j = 0; j < staticGroup.entries.length; j++ ) {
        const staticGroupEntry = staticGroup.entries[ j ];
        if ( ( fuzzy && item.typeLine.indexOf( staticGroupEntry.text ) !== -1 ) || item.typeLine === staticGroupEntry.text ) {
          return {
            group: staticGroup.label,
            text: staticGroupEntry.text,
            map: mapTier > 0,
            src: 'static'
          };
        }
      }
    }

    for ( let i = 0; i < items.length; i++ ) {
      const itemGroup = items[ i ];
      for ( let j = 0; j < itemGroup.entries.length; j++ ) {
        const itemGroupEntry = itemGroup.entries[ j ];
        if ( ( !itemGroupEntry.name && itemGroupEntry.text === item.typeLine ) || ( itemGroupEntry.name === item.name && itemGroupEntry.text === item.typeLine ) ) {
          return {
            group: itemGroup.label,
            text: itemGroupEntry.text,
            map: false,
            src: 'items'
          };
        }
      }
    }

    for ( let i = 0; i < items.length; i++ ) {
      const itemGroup = items[ i ];
      for ( let j = 0; j < itemGroup.entries.length; j++ ) {
        const itemGroupEntry = itemGroup.entries[ j ];
        if ( item.typeLine.indexOf( itemGroupEntry.type ) !== -1 ) {
          return {
            group: itemGroup.label,
            text: itemGroupEntry.text,
            map: false,
            src: 'items-fuzzy'
          };
        }
      }
    }
  }

  public isOrgan( item: Item ): boolean {
    return item.descrText === 'Combine this with four other different samples in Tane\'s Laboratory.'
  }

  public isProphecy( item: Item ): boolean {
    return item.frameType === 8;
  }

  public getMapTier( item: Item ): number {
    let mapTier = -1;
    if ( item.properties ) {
      const prop = item.properties.find( prop => prop.name === 'Map Tier' );
      if ( prop ) {
        mapTier = parseInt( prop.values[ 0 ][ 0 ] )
      }
    }
    return mapTier;
  }
}

export type Category = {
  group: string,
  text: string,
  map: boolean,
  src?: 'static' | 'items' | 'items-fuzzy',
  searchCategory?: string
}

export const groupCatMapping = [ {
  id: "weapon",
  text: e.translate( "Any Weapon" )
}, {
  id: "weapon.one",
  text: e.translate( "One-Handed Weapon" )
}, {
  id: "weapon.onemelee",
  text: e.translate( "One-Handed Melee Weapon" )
}, {
  id: "weapon.twomelee",
  text: e.translate( "Two-Handed Melee Weapon" )
}, {
  id: "weapon.bow",
  text: e.translate( "Bow" )
}, {
  id: "weapon.claw",
  text: e.translate( "Claw" )
}, {
  id: "weapon.dagger",
  text: e.translate( "Any Dagger" )
}, {
  id: "weapon.runedagger",
  text: e.translate( "Rune Dagger" )
}, {
  id: "weapon.oneaxe",
  text: e.translate( "One-Handed Axe" )
}, {
  id: "weapon.onemace",
  text: e.translate( "One-Handed Mace" )
}, {
  id: "weapon.onesword",
  text: e.translate( "One-Handed Sword" )
}, {
  id: "weapon.sceptre",
  text: e.translate( "Sceptre" )
}, {
  id: "weapon.staff",
  text: e.translate( "Any Staff" )
}, {
  id: "weapon.warstaff",
  text: e.translate( "Warstaff" )
}, {
  id: "weapon.twoaxe",
  text: e.translate( "Two-Handed Axe" )
}, {
  id: "weapon.twomace",
  text: e.translate( "Two-Handed Mace" )
}, {
  id: "weapon.twosword",
  text: e.translate( "Two-Handed Sword" )
}, {
  id: "weapon.wand",
  text: e.translate( "Wand" )
}, {
  id: "weapon.rod",
  text: e.translate( "Fishing Rod" )
}, {
  id: "armour",
  text: e.translate( "Any Armour" )
}, {
  id: "armour.chest",
  text: e.translate( "Body Armour" )
}, {
  id: "armour.boots",
  text: e.translate( "Boots" )
}, {
  id: "armour.gloves",
  text: e.translate( "Gloves" )
}, {
  id: "armour.helmet",
  text: e.translate( "Helmet" )
}, {
  id: "armour.shield",
  text: e.translate( "Shield" )
}, {
  id: "armour.quiver",
  text: e.translate( "Quiver" )
}, {
  id: "accessory",
  text: e.translate( "Any Accessory" )
}, {
  id: "accessory.amulet",
  text: e.translate( "Amulet" )
}, {
  id: "accessory.belt",
  text: e.translate( "Belt" )
}, {
  id: "accessory.ring",
  text: e.translate( "Ring" )
}, {
  id: "gem",
  text: e.translate( "Any Gem" )
}, {
  id: "gem.activegem",
  text: e.translate( "Skill Gem" )
}, {
  id: "gem.supportgem",
  text: e.translate( "Support Gem" )
}, {
  id: "gem.supportgemplus",
  text: e.translate( "Awakened Support Gem" )
}, {
  id: "jewel",
  text: e.translate( "Any Jewel" )
}, {
  id: "jewel.abyss",
  text: e.translate( "Abyss Jewel" )
}, {
  id: "flask",
  text: e.translate( "Flask" )
}, {
  id: "map",
  text: e.translate( "Map" )
}, {
  id: "map.fragment",
  text: e.translate( "Map Fragment" )
}, {
  id: "map.scarab",
  text: e.translate( "Scarab" )
}, {
  id: "watchstone",
  text: e.translate( "Watchstone" )
}, {
  id: "leaguestone",
  text: e.translate( "Leaguestone" )
}, {
  id: "prophecy",
  text: e.translate( "Prophecy" )
}, {
  id: "card",
  text: e.translate( "Card" )
}, {
  id: "monster.beast",
  text: e.translate( "Captured Beast" )
}, {
  id: "monster.sample",
  text: e.translate( "Metamorph Sample" )
}, {
  id: "currency",
  text: e.translate( "Any Currency" )
}, {
  id: "currency.piece",
  text: e.translate( "Unique Fragment" )
}, {
  id: "currency.resonator",
  text: e.translate( "Resonator" )
}, {
  id: "currency.fossil",
  text: e.translate( "Fossil" )
}, {
  id: "currency.incubator",
  text: e.translate( "Incubator" )
} ]