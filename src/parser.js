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
	var regexes = {};

	/**
	 * Contains shortcut attributes that can be used in the reges.
	 *
	 * @var {object}
	 */
	var attributes = {};

	/**
	 * Constructor to create a new parser object.
	 *
	 * @param {string} language
	 *
	 * @constructor
	 */
	ns.Parser = function( language ) {
		this._language = language;
		this._initPatterns();
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
				this._initPatterns();
			}
			return this._language;
		},

		/**
		 * Loads the patterns.
		 */
		_initPatterns: function() {
			this._promise = $.getJSON( 'patterns/' + this._language + '.json', function( data ) {
				regexes = data.regexes;
				attributes = data.attributes;
			} );
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
			var deferred = $.Deferred();
			this._promise.then( function() {
				question = question.trim();
				if ( question.indexOf( '?', question.length - 1 ) !== -1 ) {
					question = question.substring( 0, question.length - 1 );
				}
				for ( var r in regexes ) {
					var regString = regexes[r].regex;
					for ( var a in attributes ) {
						regString = regString.replace( new RegExp( '\\$' + a, 'g' ), attributes[a] );
					}
					var reg = regex( '^' + regString + '$', 'i' );
					if ( reg.test( question ) ) {
						var parts = regex.exec( question, reg );
						var result = $.extend( {}, regexes[r], parts );
						deferred.resolve( result );
					}
				}
				deferred.reject();
			} );
			return deferred.promise();
		}
	} );

} )( jQuery, XRegExp, window );