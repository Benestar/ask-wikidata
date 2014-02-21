/**
 * JavaScript api to parse questions optimized to query data from Wikibase
 * Dependencies:
 * # jQuery < http://jquery.com/ >
 * # XRegExp < http://xregexp.com/ >
 *
 * @author Bene
 * @license GNU GPL v2+
 * @version 0.1
 */
( function( $, regex, ns ) {
	'use strict';

	/**
	 * Contains the regexes used for parsing.
	 *
	 * @var {object}
	 */
	// @todo: implement callbacks!
	var regexes = {
		en: [
			{ regex: 'when $verb_art $item born', property: 'date of birth', callback: '$article $item $verb born on $value.' },
			{ regex: 'where $verb_art $item born', property: 'place of birth', callback: '$article $item $verb born in $value.' },
			{ regex: 'when died $item', property: 'date of death', callback: '$article $item died on $value.' },
			{ regex: 'where died $item', property: 'place of death', callback: '$article $item died in $value.' },
			{ regex: 'who $verb_art $item married to', property: 'spouse', callback: '$article $item $verb married to $value.' },
			{ regex: 'where $verb_art $item', article: 'the', property: 'location', possesive: 'of' }, // @todo: improve
			{ regex: '(what|when|where|why|who|whose|which|how|how much|how many) $verb_art (?<property>.+?) $possesive $item' },
			{ regex: '(what|when|where|why|who|whose|which|how|how much|how many) $verb_art $item' },
		],
		de: [
			{ regex: 'wann $verb_art $item (?<2verb>geboren( worden)?)', property: 'Geburtsdatum', callback: '$article $item $verb am $value $2verb.' },
			{ regex: 'wo $verb_art $item (?<2verb>geboren( worden)?)', property: 'Geburtsort', callback: '$article $item $verb in $value $2verb.' },
			{ regex: 'wann starb $item', property: 'Sterbedatum', callback: '$article $item starb am $value.' },
			{ regex: 'wo starb $item', property: 'Sterbeort', callback: '$article $item starb in $value.' },
			{ regex: 'mit wem $verb_art $item verheiratet', property: 'Ehepartner', callback: '$article $item $verb mit $value verheiratet.' },
			{ regex: 'wo $verb_art $item', article: 'die', property: 'Position', possesive: 'von' }, // @todo: improve
			{ regex: '(was|wann|wo|wieso|wer|wessen|welches|wie|wie viel|wie viele) $verb_art (?<property>.+?) $possesive $item' },
			{ regex: '(was|wann|wo|wieso|wer|wessen|welches|wie|wie viel|wie viele) $verb_art $item' },
		]
	};

	/**
	 * Contains shortcut attributes that can be used in the reges.
	 *
	 * @var {object}
	 */
	var attributes = {
		en: {
			verb_art: '(?<verb>is|was|are|were)( (?<article>a|an|the))?',
			item: '(?<item>.+?)',
			possesive: '(?<possesive>(of|from|by)( (a|an|the))?)',
		},
		de: {
			verb_art: '(?<verb>ist|war|sind|waren|wurde|wurden)( (?<article>ein|eine|eines|der|die|das))?',
			item: '(?<item>.+?)',
			possesive: '(?<possesive>(von|an|bei|der|eines|einer)( (ein|eine|eines|einem|einem|dem|den))?)',
		}
	};

	/**
	 * Constructor to create a new parser object.
	 *
	 * @param {string} language
	 *
	 * @constructor
	 */
	ns.Parser = function( language ) {
		this._language = language;
	};

	$.extend( ns.Parser.prototype, {

		/**
		 * Sets or gets the language.
		 *
		 * @param {string} language
		 */
		language: function( language ) {
			if ( language ) {
				this._language = language;
			}
			return this._language;
		},

		/**
		 * Builds an answer string based on the given format string and the given attributes.
		 *
		 * @param {string} format
		 * @param {object} attributes
		 * @return {string}
		 */
		buildAnswer: function( format, attributes ) {
			for ( var i in attributes ) {
				format = format.replace( new RegExp( '\\$' + i, 'g' ), attributes[i] );
			}
			//format = format.replace( /undefined /g, '' );
			format = format.replace( /\$[\w\d-_\|]+ ?/g, '' );
			format = format.charAt( 0 ).toUpperCase() + format.slice( 1 ); // ucfirst
			return format;
		},

		/**
		 * Parses the question and returns the an object containing some of the following keys:
		 * [ 'question', 'verb', 'article', 'property', 'possesive', 'item' ]
		 *
		 * @param {string} question
		 * @return {object}
		 */
		parseQuestion: function( question ) {
			question = question.trim();
			if ( question.indexOf( '?', question.length - 1 ) !== -1 ) {
				question = question.substring( 0, question.length - 1 );
			}
			var r = regexes[this._language];
			for ( var i in r ) {
				var regString = r[i].regex;
				var a = attributes[this._language];
				for ( var j in a ) {
					regString = regString.replace( new RegExp( '\\$' + j, 'g' ), a[j] );
				}
				var reg = regex( '^' + regString + '$', 'i' );
				if ( reg.test( question ) ) {
					var parts = regex.exec( question, reg );
					var result = $.extend( {}, r[i], parts );
					return result;
				}
			}
			return false;
		}
	} );

} )( jQuery, XRegExp, window );