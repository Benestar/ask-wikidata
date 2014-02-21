module( 'Parser' );

test( 'constructor', function() {
	var parser = new Parser( 'en' );
	equal( parser._language, 'en', 'language value' );
} );

test( 'language', function() {
	var parser = new Parser( 'en' );
	equal( parser.language(), 'en', 'get language value' );
	equal( parser.language( 'de' ), 'de', 'get and set language value' );
	equal( parser._language, 'de', 'saved language value' );
} );

test( 'build answer', function() {
	var parser = new Parser( 'en' );
	var format = '$abc $foo. $hij . $xxx; $bar';
	var attributes = {
		'abc': 'def',
		'foo': 'bar',
		'bar': 'foo'
	};

	var answer = parser.buildAnswer( format, attributes );
	equal( answer, 'Def bar. . ; foo', 'build a proper answer' );
} );

test( 'parse question (en)', function() {
	var parser = new Parser( 'en' );
	var question1 = 'Who is Barack Obama?';
	var question2 = 'Who are the presidents of the United States';

	var parsed1 = parser.parseQuestion( question1 );
	equal( parsed1.verb, 'is', 'verb' );
	equal( parsed1.item, 'Barack Obama', 'item' );

	var parsed2 = parser.parseQuestion( question2 );
	equal( parsed2.verb, 'are', 'verb' );
	equal( parsed2.article, 'the', 'article' );
	equal( parsed2.property, 'presidents', 'property' );
	equal( parsed2.possesive, 'of the', 'possesive' );
	equal( parsed2.item, 'United States', 'item' );

	equal( parser.parseQuestion( 'Foo bar' ), false, 'Invalid value' );
} );

test( 'parse question (de)', function() {
	var parser = new Parser( 'de' );
	var question1 = 'Wer ist Joachim Gauck?';
	var question2 = 'Wer sind die Präsidenten der Bundesrepublik Deutschland';

	var parsed1 = parser.parseQuestion( question1 );
	equal( parsed1.verb, 'ist', 'verb' );
	equal( parsed1.item, 'Joachim Gauck', 'item' );

	var parsed2 = parser.parseQuestion( question2 );
	equal( parsed2.verb, 'sind', 'verb' );
	equal( parsed2.article, 'die', 'article' );
	equal( parsed2.property, 'Präsidenten', 'property' );
	equal( parsed2.possesive, 'der', 'possesive' );
	equal( parsed2.item, 'Bundesrepublik Deutschland', 'item' );

	equal( parser.parseQuestion( 'Foo bar' ), false, 'Invalid value' );
} );
