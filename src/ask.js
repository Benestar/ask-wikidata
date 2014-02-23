/**
 * JavaScript api to query data from Wikibase
 * Dependencies:
 * # jQuery < http://jquery.com/ >
 * # Wikibase api < api.js >
 *
 * @author Bene
 * @license GNU GPL v2+
 * @version 0.1
 */
( function( $, ns ) {
	'use strict';

	/**
	 * Constructor to create a new api object to parse questions.
	 *
	 * @param {Api} api
	 *
	 * @constructor
	 */
	ns.Ask = function Ask( api ) {
		this._api = api;
	};

	$.extend( ns.Ask.prototype, {

		/**
		 * Formats the given datavalues.
		 *
		 * @param {array} values
		 * @return {jQuery.Promise}
		 */
		formatDatavalues: function( values ) {
			var deferred = $.Deferred();
			var deferredsArray = [];
			for ( var i in values ) {
				deferredsArray.push( this._api.formatDatavalue( values[i] ) );
			}
			$.when.apply( $, deferredsArray )
			.then( function( /* arguments */ ) {
				var args = Array.prototype.slice.call( arguments );
				if ( values.length > 1 ) {
					var formattedValues = [];
					for ( var i in args ) {
						formattedValues.push( args[i][0].result );
					}
					deferred.resolve( formattedValues );
				} else if ( values.length > 0 ) {
					deferred.resolve( [ args[0].result ] );
				} else {
					deferred.reject();
				}
			}, function() {
				deferred.reject();
			} );
			return deferred.promise();
		},

		/**
		 * Gets the datavalues for the property in the given entity.
		 *
		 * @param {string} entityId
		 * @param {string} propertyId
		 */
		getDatavalues: function( entityId, propertyId ) {
			var deferred = $.Deferred();
			this._api.getClaims( entityId, propertyId ).done( function( claims ) {
				if ( claims.claims[propertyId] && claims.claims[propertyId].length > 0 ) {
					var values = [];
					var preferredValues = [];
					var propertyClaims = claims.claims[propertyId];
					for ( var i in propertyClaims ) {
						var value = propertyClaims[i].mainsnak.datavalue;
						// check the rank of the statement
						if ( propertyClaims[i].rank == 'preferred' ) {
							preferredValues.push( value );
						}
						else if ( propertyClaims[i].rank != 'deprecated' ) {
							values.push( value );
						}
					}
					deferred.resolve( preferredValues.length > 0 ? preferredValues : values );
				}
				else {
					deferred.reject();
				}
			} );
			return deferred.promise();
		},

		/**
		 * Sets the entity chooser of the api.
		 * Note: The chooser must return a jQuery Promise object
		 * and pass the id of the entity when calling the done function.
		 *
		 * @param {function} error
		 */
		entityChooser: function( entityChooser ) {
			if ( typeof entityChooser === 'function' ) {
				this._entityChooser = entityChooser;
			}
		},

		/**
		 * Searches an entity of a specific type for the given search.
		 * This function useses the entity chooser to get an entity if there are several options.
		 *
		 * @param {string} type
		 * @param {string} search
		 * @return {jQuery.Promise}
		 */
		searchEntity: function( type, search ) {
			var deferred = $.Deferred();
			var self = this;
			this._api.searchEntities( type, search ).done( function( data ) {
				if ( data.search.length === 0 ) {
					// reject if no entities were found
					deferred.reject();
				} else if ( data.search.length === 1 ) {
					// resolve if exactly one entity was found
					deferred.resolve( data.search[0].id );
				} else if ( data.search.length > 1
					&& data.search[0].label.toLowerCase().indexOf( search.toLowerCase() ) != -1
					&& data.search[1].label.toLowerCase().indexOf( search.toLowerCase() ) == -1
				) {
					// resolve if the first value's label contains the search term and the second one's doesn't
					deferred.resolve( data.search[0].id );
				} else if ( self._entityChooser ) {
					// ask to choose when more than one entity were found
					self._entityChooser( type, data.search )
					.done( function( id ) {
						deferred.resolve( id );
					} )
					.fail( function() {
						deferred.reject( false );
					} );
				} else {
					// otherwise reject
					deferred.reject();
				}
			} );
			return deferred.promise();
		}
	} );

} )( jQuery, window );