/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var Habitat = require( "habitat" ),
    irc = require( "irc" ),
    responseGenerator = require( "./lib/responses" )(),
    env,
    client,
    nick,
    hi5regexes;

Habitat.load();
env = (new Habitat()).all();

if ( !env.HOST, !env.NICK, !env.CHANNELS ) {
  throw new Error( "Missing config options, check your config!" );
}

nick = env.NICK;

hi5regexes = [
  new RegExp( "(^|\\s)+wow(\\s|$)+", "i" ),
  new RegExp( "(^|\\s)+such(\\s|$)+", "i"),
  new RegExp( "(^|\\s)+very(\\s|$)+", "i")
];

tenSeconds = 0;

hi5regexes.forEach(function(s){ console.log( s );});

client = new irc.Client( env.HOST, env.NICK, {
  channels: env.CHANNELS.split( "," ).map(function( channel ) {
    if ( /^#.+$/.test( channel ) ) {
      return channel;
    }
    return "#" + channel;
  })
});

client.addListener( "message", function( from, to, message ) {
  var responded = false;
  hi5regexes.forEach(function( regex ) {
    console.log( regex, regex.test( message ) );
    if ( !responded && regex.test( message ) ) {
      var tenSecondsTest = Math.round(new Date().getTime() / 10000);
      if (tenSecondsTest != tenSeconds) {
        responded = true;
        client.say( to, responseGenerator( from ) );
        tenSeconds = tenSecondsTest;
      }
    }
  });
});

client.addListener( "error", function( message ) {
    console.log( "error: ", message );
});
