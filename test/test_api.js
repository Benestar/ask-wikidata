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

// @todo: verify that search entities etc. works. Note that the data may change so we have to be careful at this point.
// Note: perhaps it would be best to query the data using getJSON on our own, too, but this does not really test something.

asyncTest( 'format datavalue', function() {
	expect( 2 );

	var api = new Api( 'https://www.wikidata.org/w/api.php', 'en' );
	$.when( api.formatDatavalue( {"value":{"time":"+00000002001-06-16T00:00:00Z","timezone":0,"before":0,"after":0,"precision":11,"calendarmodel":"http://www.wikidata.org/entity/Q1985727"},"type":"time"} ) )
	.then( function( data ) {
		deepEqual(
			data,
			{"warnings":{"main":{"*":"Unrecognized parameter: '_'"}},"result":"16 June 2001"},
			'time data value'
		);
		return api.formatDatavalue( {"value":{"entity-type":"item","numeric-id":1208},"type":"wikibase-entityid"} );
	} )
	.then( function( data ) {
		deepEqual(
			data,
			{"warnings":{"main":{"*":"Unrecognized parameter: '_'"}},"result":"Brandenburg"},
			'entity id data value'
		);
	} )
	.always( start );
} );

asyncTest( 'get claims', function() {
	expect( 1 );

	var api = new Api( 'https://www.wikidata.org/w/api.php', 'en' );
	api.getClaims( 'q76', 'p21' )
	.done( function( data ) {
		deepEqual(
			data,
			{"warnings":{"main":{"*":"Unrecognized parameter: '_'"}},"claims":{"P21":[{"id":"q76$545B2D30-AD63-4698-9224-DDB75CC685FC","mainsnak":{"snaktype":"value","property":"P21","datavalue":{"value":{"entity-type":"item","numeric-id":6581097},"type":"wikibase-entityid"}},"type":"statement","rank":"normal","references":[{"hash":"a51d6594fee36c7452eaed2db35a4833613a7078","snaks":{"P143":[{"snaktype":"value","property":"P143","datavalue":{"value":{"entity-type":"item","numeric-id":54919},"type":"wikibase-entityid"}}]},"snaks-order":["P143"]},{"hash":"0d477c3857899469474d86574114856e00d9933c","snaks":{"P248":[{"snaktype":"value","property":"P248","datavalue":{"value":{"entity-type":"item","numeric-id":14527788},"type":"wikibase-entityid"}}]},"snaks-order":["P248"]}]}]}},
			'Checking result'
		);
	} )
	.always( start );
} );

asyncTest( 'get entities', function() {
	expect( 1 );

	var api = new Api( 'https://www.wikidata.org/w/api.php', 'en' );
	api.getEntities( 'q76', 'labels' )
	.done( function( data ) {
		deepEqual(
			data,
			{"warnings":{"main":{"*":"Unrecognized parameter: '_'"}},"entities":{"Q76":{"id":"Q76","type":"item","labels":{"en":{"language":"en","value":"Barack Obama"}}}},"success":1},
			'Checking result'
		);
	} )
	.always( start );
} );

asyncTest( 'search entities', function() {
	expect( 2 );

	var api = new Api( 'https://www.wikidata.org/w/api.php', 'en' );
	$.when( api.searchEntities( 'item', 'United States' ), api.searchEntities( 'property', 'location' ) )
	.done( function( data1, data2 ) {
		deepEqual(
			data1[0],
			{"warnings":{"main":{"*":"Unrecognized parameter: '_'"}},"searchinfo":{"search":"United States"},"search":[{"id":"Q30","url":"//www.wikidata.org/wiki/Q30","description":"country in North America","label":"United States of America","aliases":["United States"]},{"id":"Q232865","url":"//www.wikidata.org/wiki/Q232865","description":"Wikipedia disambiguation page","label":"United States"},{"id":"Q3965121","url":"//www.wikidata.org/wiki/Q3965121","description":"television series","label":"United States"},{"id":"Q4917","url":"//www.wikidata.org/wiki/Q4917","description":"currency of the United States of America","label":"United States dollar"},{"id":"Q11703","url":"//www.wikidata.org/wiki/Q11703","description":"group of islands in the Caribbean","label":"Virgin Islands of the United States","aliases":["United States Virgin Islands"]},{"id":"Q35657","url":"//www.wikidata.org/wiki/Q35657","description":"constituent political entity sharing sovereignty with the United States of America","label":"U.S. state","aliases":["United States state","United States statehood"]},{"id":"Q29552","url":"//www.wikidata.org/wiki/Q29552","description":"political party in the United States","label":"Democratic Party","aliases":["United States Democratic Party"]}],"search-continue":7,"success":1},
			'Checking result'
		);
		deepEqual(
			data2[0],
			{"warnings":{"main":{"*":"Unrecognized parameter: '_'"}},"searchinfo":{"search":"location"},"search":[{"id":"P706","url":"//www.wikidata.org/wiki/Property:P706","description":"located on the specified landform or body of water. Should not be used when the value is only political/administrative (towns, cities, provinces, states, countries, etc.).","label":"located on terrain feature","aliases":["location"]},{"id":"P625","url":"//www.wikidata.org/wiki/Property:P625","description":"coordinates of the subject","label":"coordinate location","aliases":["location"]},{"id":"P766","url":"//www.wikidata.org/wiki/Property:P766","description":"place where a specific event took (or will take) place","label":"event location","aliases":["location"]},{"id":"P189","url":"//www.wikidata.org/wiki/Property:P189","description":"where the item was located when discovered","label":"discovery place","aliases":["location of discovered object"]},{"id":"P276","url":"//www.wikidata.org/wiki/Property:P276","description":"location of a moveable object","label":"moveable object location","aliases":["location of moveable object"]},{"id":"P19","url":"//www.wikidata.org/wiki/Property:P19","description":"the most specific known (e.g. city instead of country)","label":"place of birth","aliases":["location born"]}],"success":1},
			'Checking result'
		);
	} )
	.always( start );
} );