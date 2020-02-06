const categorys = require( './src/assets/tradecategorys.json' );
const items = require( './src/assets/tradeitems.json' );
const { clipboard } = require( 'electron' );

let exit = false;

items.forEach( grp => {
    console.log( '=============', grp.label, '=============' );
    grp.entries
        .filter( entry => {
            return !entry.flags || !entry.flags.unique
        } )
        .forEach( entry => {
            const type = entry.type.toLocaleLowerCase();
            matches = categorys.filter( cat => {

                if ( cat.not && checkList( type, cat.not ) ) {
                    return false;
                }

                if ( type.indexOf( cat.text.toLocaleLowerCase() ) !== -1 ) {
                    return true;
                }

                if ( cat.tags ) {
                    return checkList( type, cat.tags );
                }

                return false;
            } );
            if ( matches.length !== 1 ) {
                if ( !exit ) {
                    clipboard.writeText( type, 'selection' )
                }
                console.log( entry.text );
                exit = true;
                process.exit( 0 );
            }
        } )

    if ( exit ) {
        process.exit( 0 );
    }
} );

function checkList( search, list ) {
    for ( let i = 0; i < list.length; i++ ) {
        if ( search.indexOf( list[ i ] ) !== -1 ) {
            return true;
        }
    }
    return false;
}
