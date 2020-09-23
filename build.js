const { execSync } = require( 'child_process' );
const { createWriteStream, createReadStream } = require( 'fs' );
const { platform } = require( 'os' );
const { version } = require( './package.json' );
const { basename } = require( 'path' );

const archiver = require( 'archiver' );
const glob = require( 'glob' );

rimraf( `${ __dirname }/dist-build` )
exec( `npx electron-builder` );
zipIt();

function rimraf( path ) {
  if( platform() === 'win32' ) {
    exec( `rd /s /q "${ path }"` )
  } else {
    exec( `rm -rf "${ path }"` )
  }
}

function exec( cmd ) {
  try {
    return execSync( cmd, { stdio: 'inherit', detached: false } );
  }
  catch( _e ) {
    return null;
  }
}

function zipIt() {
  return new Promise( ( resolve, reject ) => {
    const ext = platform() === 'win32' ? 'exe' : 'dmg';
    const pathToExe = glob.sync( `${ __dirname }/dist-build/*.${ ext }` )[ 0 ];
    const exeName = basename( pathToExe, `.${ ext }` );
    const osName = platform() === 'win32' ? 'win' : 'mac';
    const outputName = `${ exeName.replace( /\s/g, '_' ) }-${ osName }`;

    let output = createWriteStream( `${ __dirname }/dist-build/${ outputName }.zip` );
    let archive = archiver( 'zip' );

    output.on( 'close', function () {
      console.log( `dist-build/${ outputName }.zip created` );
      resolve();
    } );

    archive.on( 'error', function ( err ) {
      reject();
      throw err;
    } );

    archive.pipe( output );
    archive.append( createReadStream( pathToExe ), { name: `${ exeName }.${ ext }` } );
    archive.finalize();
  } );
}