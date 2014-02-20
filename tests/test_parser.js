module( 'Parser' );

test( 'constructor', function() {
	var parser = new Parser( 'en' );
	equal( parser._language, 'en', 'language value' );
} );

test( 'langauge', function() {
	var parser = new Parser( 'en' );
	equal( parser.language(), 'en', 'get language value' );
	equal( parser.language( 'de' ), 'de', 'get and set language value' );
	equal( parser._language, 'de', 'saved language value' );
} );

test( 'parse question (en)', function() {
	var parser = new Parser( 'en' );
	var question1 = 'Who is Barack Obama?';
	var question2 = 'Who are the presidents of the United States';

	var parsed1 = parser.parseQuestion( question1 );
	deepEqual( parsed1, {
		question: 'Who',
		verb: 'is',
		item: 'Barack Obama'
	}, 'Question containing item only' );

	var parsed2 = parser.parseQuestion( question2 );
	deepEqual( parsed2, {
		question: 'Who',
		verb: 'are',
		article: 'the',
		property: 'presidents',
		possesive: 'of the',
		item: 'United States'
	}, 'Question containint property and item' );

	equal( parser.parseQuestion( 'Foo bar' ), false, 'Invalid value' );
} );

test( 'parse question (de)', function() {
	var parser = new Parser( 'de' );
	var question1 = 'Wer ist Joachim Gauck?';
	var question2 = 'Wer sind die Präsidenten der Bundesrepublik Deutschland';

	var parsed1 = parser.parseQuestion( question1 );
	deepEqual( parsed1, {
		question: 'Wer',
		verb: 'ist',
		item: 'Joachim Gauck'
	}, 'Question containing item only' );

	var parsed2 = parser.parseQuestion( question2 );
	deepEqual( parsed2, {
		question: 'Wer',
		verb: 'sind',
		article: 'die',
		property: 'Präsidenten',
		possesive: 'der',
		item: 'Bundesrepublik Deutschland'
	}, 'Question containint property and item' );

	equal( parser.parseQuestion( 'Foo bar' ), false, 'Invalid value' );
} );
