module( 'api' );

test( 'constructor', function() {
	var api = new Api( 'https://example.com/api.php', 'en' );
	equal( api._url, 'https://example.com/api.php', 'url value' );
	equal( api._language, 'en', 'language value' );
} );

test( 'langauge', function() {
	var api = new Api( 'https://example.com/api.php', 'en' );
	equal( api.language(), 'en', 'get language value' );
	equal( api.language( 'de' ), 'de', 'get and set language value' );
	equal( api._language, 'de', 'saved language value' );
} );

asyncTest( '_get', function() {
	expect( 1 );

	var api = new Api( 'https://www.wikidata.org/w/api.php', 'en' );
	api._get( {
		action: 'test'
	} )
	.done( function( data ) {
		equal( data.error.info, 'Unrecognized value for parameter \'action\': test', 'error message' );
	} )
	.always( start );
} );

asyncTest( 'format datavalue', function() {
	expect( 2 );

	var api = new Api( 'https://www.wikidata.org/w/api.php', 'en' );
	var datavalue1 = {"value":{"time":"+00000002001-06-16T00:00:00Z","timezone":0,"before":0,"after":0,"precision":11,"calendarmodel":"http://www.wikidata.org/entity/Q1985727"},"type":"time"};
	var datavalue2 = {"value":{"entity-type":"item","numeric-id":1208},"type":"wikibase-entityid"};
	$.when(
		api.formatDatavalue( datavalue1 ),
		$.getJSON( 'https://www.wikidata.org/w/api.php?action=wbformatvalue&generate=text%2Fplain&datavalue=' + encodeURIComponent( JSON.stringify( datavalue1 ) ) + '&options=%7B%22lang%22%3A%22en%22%2C%22geoformat%22%3A%22dms%22%7D&format=json&callback=?' ),
		api.formatDatavalue( datavalue2 ),
		$.getJSON( 'https://www.wikidata.org/w/api.php?action=wbformatvalue&generate=text%2Fplain&datavalue=' + encodeURIComponent( JSON.stringify( datavalue2 ) ) + '&options=%7B%22lang%22%3A%22en%22%2C%22geoformat%22%3A%22dms%22%7D&format=json&callback=?')
	)
	.then( function( data1, expected1, data2, expected2 ) {
		deepEqual(
			data1[0],
			expected1[0],
			'time data value'
		);
		deepEqual(
			data2[0],
			expected2[0],
			'entity id data value'
		);
	} )
	.always( start );
} );

asyncTest( 'get claims', function() {
	expect( 1 );

	var api = new Api( 'https://www.wikidata.org/w/api.php', 'en' );
	$.when(
		api.getClaims( 'q76', 'p21' ),
		$.getJSON( 'https://www.wikidata.org/w/api.php?action=wbgetclaims&entity=q76&property=p21&format=json&callback=?' )
	)
	.then( function( data1, expected1 ) {
		deepEqual(
			data1[0],
			expected1[0],
			'Checking result'
		);
	} )
	.always( start );
} );

asyncTest( 'get entities', function() {
	expect( 1 );

	var api = new Api( 'https://www.wikidata.org/w/api.php', 'en' );
	$.when(
		api.getEntities( 'q76', 'labels' ),
		$.getJSON( 'https://www.wikidata.org/w/api.php?action=wbgetentities&languages=en&ids=q76&props=labels&format=json&callback=?' )
	)
	.then( function( data1, expected1 ) {
		deepEqual(
			data1[0],
			expected1[0],
			'Checking result'
		);
	} )
	.always( start );
} );

asyncTest( 'search entities', function() {
	expect( 2 );

	var api = new Api( 'https://www.wikidata.org/w/api.php', 'en' );
	$.when(
		api.searchEntities( 'item', 'United States' ),
		$.getJSON( 'https://www.wikidata.org/w/api.php?action=wbsearchentities&language=en&search=United+States&type=item&format=json&callback=?' ),
		api.searchEntities( 'property', 'location' ) ),
		$.getJSON( 'https://www.wikidata.org/w/api.php?action=wbsearchentities&language=en&search=location&type=property&format=json&callback=?' )
	.done( function( data1, expected1, data2, expected2 ) {
		deepEqual(
			data1[0],
			expected1[0],
			'Checking result'
		);
		deepEqual(
			data2[0],
			expected2[0],
			'Checking result'
		);
	} )
	.always( start );
} );
