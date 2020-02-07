const categorys = require( './src/assets/tradecategorys.json' );
const items = require( './src/assets/tradeitems.json' );
const { clipboard } = require( 'electron' );
const cats = categorys.map( cat => cat.text.toLocaleLowerCase() );

let exit = false;

// console.log( match( 'ashscale talisman' ) );
// process.exit( 0 );

items.forEach( grp => {
    console.log( '' );
    console.log( '=============', grp.label, '=============' );
    grp.entries
        .filter( entry => {
            return !entry.flags || !entry.flags.unique
        } )
        .forEach( entry => {
            const type = entry.type.toLocaleLowerCase();
            matches = match( type );
            if ( matches.length !== 1 ) {
                if ( !exit ) {
                    clipboard.writeText( type, 'selection' )
                }
                console.log( type );
                if ( matches.length > 1 ) {
                    console.log( matches )
                }
                exit = true;
                process.exit( 0 );
            }
        } )

    if ( exit ) {
        process.exit( 0 );
    }
} );

function match( type ) {
    const tagResults = categorys.filter( cat => {
        if ( cat.tags && cat.tags.includes( type ) ) {
            return true;
        }
    } );

    if ( tagResults.length ) {
        return tagResults;
    }

    return categorys.filter( cat => {
        const catText = cat.text.toLocaleLowerCase();

        if ( checkList( type, cats.filter( c => c !== catText && c !== 'ring' ) ) ) {
            return false;
        }

        if ( cat.not && checkList( type, cat.not ) ) {
            return false;
        }

        if ( type.indexOf( catText ) !== -1 ) {
            return true;
        }

        if ( cat.tags ) {
            return checkList( type, cat.tags );
        }

        return false;
    } );
}

function checkList( search, list ) {
    for ( let i = 0; i < list.length; i++ ) {
        if ( search.indexOf( list[ i ] ) !== -1 ) {
            return true;
        }
    }
    return false;
}
