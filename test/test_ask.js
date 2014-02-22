module( 'Ask' );

test( 'constructor', function() {
	var api = new Api( 'https://www.wikidata.org/w/api.php', 'en' );
	var ask = new Ask( api );
	equal( ask._api, api, 'api value' );
} );

asyncTest( 'search entity', function() {
	expect( 5 );

	var ask = new Ask( new Api( 'https://www.wikidata.org/w/api.php', 'en' ) );
	ask.entityChooser( function( type, entities ) {
		equal( type, 'item', 'Checking type' );
		ok( true, 'Entity choser should be called when the query returns more than one value' );
		return $.Deferred().resolve( entities[1].id ).promise();
	} );

	$.when( ask.searchEntity( 'item', 'asdfg' ) )
	.then( null, function() {
		ok( true, 'No item should be found by searching for "asdfg"' );
		return ask.searchEntity( 'item', 'Bayerische Motoren Werke' );
	} )
	.then( function( item ) {
		equal( item, 'Q26678', 'One item should be found by searching for "Bayerische Motoren Werke"' );
		return ask.searchEntity( 'item', 'BMW' );
	} )
	.then( function( item ) {
		equal( item, 'Q564512', 'Several items should be found by searching for "BMW" and the second one should be choosen' );
	} )
	.always( start );
} );

asyncTest( 'get datavalues', function() {
	expect( 1 );

	var ask = new Ask( new Api( 'https://www.wikidata.org/w/api.php', 'en' ) );
	ask.getDatavalues( 'Q76', 'P21' )
	.done( function( values ) {
		deepEqual( values, [ {"value":{"entity-type":"item","numeric-id":6581097},"type":"wikibase-entityid"} ], 'Check values' );
	} )
	.always( start );
} );

asyncTest( 'format datavalues', function() {
	expect( 4 - 1 );

	var ask = new Ask( new Api( 'https://www.wikidata.org/w/api.php', 'en' ) );
	$.when( ask.formatDatavalues( [] ) )
	.then( null, function() {
		ok( true, 'If no property values are given it must fail' );
		return ask.formatDatavalues( [{"value":{"entity-type":"item","numeric-id":1208},"type":"wikibase-entityid"},{"value":{"entity-type":"item","numeric-id":1201238},"type":"wikibase-entityid"}] );
	} )
	.then( function( values ) {
		// this test fails perhaps because travis does not know the "arguments" feature used in ask.js on line 40. Tips are welcome.
		deepEqual( values, [ 'Brandenburg', 'Q1201238' ], 'Check entity id value' );
		return ask.formatDatavalues( [{"value":{"time":"+00000002001-06-16T00:00:00Z","timezone":0,"before":0,"after":0,"precision":11,"calendarmodel":"http://www.wikidata.org/entity/Q1985727"},"type":"time"}] );
	} )
	.then( function( values ) {
		deepEqual( values, [ '16 June 2001' ], 'Check time value' );
		return ask.formatDatavalues( [{"value":{"latitude":52.516666666667,"longitude":13.383333333333,"altitude":null,"precision":0.016666666666667,"globe":"http://www.wikidata.org/entity/Q2"},"type":"globecoordinate"}] );
	} )
	.then( function( values ) {
		deepEqual( values, [ '52° 31\' 0", 13° 22\' 60"' ], 'Check globecoordinate value' );
	} )
	.always( start );
} );