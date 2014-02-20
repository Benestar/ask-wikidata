/**
 * JavaScript api for Wikibase repo
 * Dependencies:
 * # jQuery < http://jquery.com/ >
 *
 * @author Bene
 * @license GNU GPL v2+
 * @version 0.1
 */
( function( $, ns ) {
	'use strict';

	/**
	 * Constructor to create a new api object for interacton with the wikibase api.
	 *
	 * @param {string} url
	 * @param {string} language
	 *
	 * @constructor
	 */
	ns.Api = function Api( url, language ) {
		this._url = url;
		this._language = language;
	};

	$.extend( ns.Api.prototype, {

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
		 * Searches for entities with the given type.
		 *
		 * @param {string} type
		 * @param {string} search
		 */
		searchEntities: function( type, search ) {
			return this._get( {
				action: 'wbsearchentities',
				language: this._language,
				search: search,
				type: type
			} );
		},

		/**
		 * Gets the entities with the ids and adds the props to the result.
		 *
		 * @param {string} ids
		 * @param {string} props
		 */
		getEntities: function( ids, props ) {
			return this._get( {
				action: 'wbgetentities',
				languages: this._language,
				ids: ids,
				props: props
			} );
		},

		/**
		 * Gets the claims for the property in the given entity.
		 *
		 * @param {string} entityId
		 * @param {string} propertyId
		 */
		getClaims: function( entityId, propertyId ) {
			return this._get( {
				action: 'wbgetclaims',
				entity: entityId,
				property: propertyId
			} );
		},

		/**
		 * Formats the datavalue.
		 *
		 * @param {object} datavalue
		 */
		formatDatavalue: function( datavalue ) {
			return this._get( {
				action: 'wbformatvalue',
				generate: 'text/plain',
				datavalue: JSON.stringify( datavalue ),
				options: JSON.stringify( {
					lang: this._language,
					geoformat: 'dms'
				} )
			} );
		},

		/**
		 * Perform a jsonp get request to the api.
		 *
		 * @param {object} params
		 * @return {jqXHR}
		 */
		_get: function( params ) {
			$.extend( params, {
				format: 'json'
			} );
			// no need for error handling as we are using jsonp
			return $.getJSON( this._url + '?callback=?', params );
		}
	} );

} )( jQuery, this );