/**
 * Contains all the ui stuff
 * Dependencies:
 * # jQuery < http://jquery.com/ >
 * # i18next < http://i18next.com/ >
 * # Wikibase api < api.js >
 * # Ask < ask.js >
 * # Parser < parser.js >
 *
 * @author Bene
 * @license GNU GPL v2+
 * @version 0.1
 */
( function( $ ) {
	'use strict';

	var api = new Api( 'https://www.wikidata.org/w/api.php', 'en' );
	var ask = new Ask( api );
	var parser = new Parser( 'en' );

	// init i18n as soon as possible
	i18nInit();

	$( function() {
		ask.entityChooser( entityChooser );
		$( '#question' ).val( location.hash.slice( 1 ) );

		// Question form submit handler
		$( '#question-form' ).submit( function() {
			setLoading( true );
			$( '#details' ).text( '' );
			var question = $( '#question' ).val();
			location.hash = '#' + question;
			handleQuestion( question );
		} );

		// Language change handler
		$( '#language' ).change( function() {
			i18nInit( $( '#language' ).val() );
		} );
	} );

	/**
	 * Inits the i18n extension.
	 *
	 * @param {string} lng
	 */
	function i18nInit( lng ) {
		var options = {
			resGetPath: 'i18n/__lng__.json',
			fallbackLng: 'en'
		};
		if ( lng ) {
			options.lng = lng;
		}
		// Init i18n
		i18n.init( options, function() {
			// Set messages
			$( 'title' ).i18n();
			$( 'body' ).i18n();
			var lang = i18n.lng().split( '-' )[0];
			api.language( lang );
			parser.language( lang );
			$( '#language' ).val( lang );

			// Question param handler
			// Note: this must be called here as the possible
			// error messages should already be available
			if ( $( '#question' ).val() ) {
				$( '#question-form' ).submit();
			}
		} );
	}

	/**
	 * Sets whether we are showing a loading icon or not.
	 *
	 * @param {boolean} loading
	 */
	function setLoading( loading ) {
		$( '#submit img' ).attr( 'src', loading ? 'res/loading.gif' : 'res/search.png' );
	}

	/**
	 * Shows the error.
	 *
	 * @param {string} error
	 */
	function showError( error ) {
		$( '#result' ).addClass( 'error' ).text( error );
		setLoading( false );
	}

	/**
	 * Shows the result.
	 *
	 * @param {string} result
	 */
	function showResult( result ) {
		$( '#result' ).removeClass( 'error' ).text( result );
		setLoading( false );
	}

	/**
	 * Shows the intro.
	 */
	function showIntro() {
		$( '#result' ).removeClass( 'error' ).html( $( '<i>' ).text( i18n.t( 'intro' ) ) );
		setLoading( false );
	}

	/**
	 * Shows the details.
	 *
	 * @param {string} details
	 */
	function showDetails( details ) {
		$( '#details' ).append( details );
	}

	/**
	 * Shows a dialog which allows the user to choose an entity.
	 *
	 * @return {jQuery.Promise}
	 */
	function entityChooser( type, entities ) {
		var deferred = $.Deferred();
		var $dialog = $( '<div>' ).append(
			$( '<h3>' ).attr( 'class', 'dialog-header' ).text( i18n.t( 'chooseEntity', { type: type } ) ).append(
				$( '<a>' ).attr( {
					href: 'javascript:;',
					class: 'close',
					title: i18n.t( 'cancel' )
				} ).append(
					$( '<img>' ).attr( {
						src: 'res/close.png',
						alt: i18n.t( 'cancel' ),
						width: 20,
						height: 20
					} )
				)
				.click( function() {
					$.modal.close();
				} )
			)
		);
		for ( var i in entities ) {
			$dialog.append(
				$( '<p>', { class: 'entity-select' } )
				.append( $( '<span>', { class: 'label' } ).text( entities[i].label ) )
				.append( $( '<br>' ) )
				.append( $( '<span>', { class: 'description' } ).text( entities[i].description ) )
				.append( $( '<br>' ) )
				.append( $( '<span>', { class: 'aliases' } ).text( entities[i].aliases ? i18n.t( 'alsoKnown' ) + entities[i].aliases.join( ', ' ) : '' ) )
				.click( { id: entities[i].id }, function( e ) {
					deferred.resolve( e.data.id );
					$.modal.close();
				} )
			);
		}
		$dialog.modal( {
			maxWidth: 700,
			onClose: function() {
				deferred.reject();
				$.modal.close();
			}
		} );
		return deferred.promise();
	}

	/**
	 * Combines the given values.
	 */
	function combineValues( values ) {
		var value = '';
		for ( var i in values ) {
			if ( value !== '' && i == values.length - 1 ) {
				value += ' ' + i18n.t( 'and' ) + ' ';
			}
			else if ( i > 0 ) {
				value += ', ';
			}
			value += values[i];
		}
		return value;
	}

	/**
	 * Handles the questios.
	 *
	 * @param {string} question
	 */
	function handleQuestion( question ) {
		// parse the question
		var parsed = parser.parseQuestion( question );
		// cancel if the question could not be parsed
		if ( !parsed ) {
			showError( i18n.t( 'unparsable' ) );
			return;
		}
		// search the item
		ask.searchEntity( 'item', parsed.item )
		.then( function( itemId ) {
			showDetails( 'Item: ' + itemId );
			// question after a specific property => must be queried
			if ( parsed.property ) {
				// search the property
				ask.searchEntity( 'property', parsed.property )
				.then( function( propertyId ) {
					showDetails( ', Property: ' + propertyId );
					// get the claims
					return ask.getDatavalues( itemId, propertyId );
				}, function( notfound ) {
					// property not found
					if ( notfound !== false ) {
						showError( i18n.t( 'propertynotfound', { property: parsed.property } ) );
					} else {
						showIntro();
					}
					return false;
				} )
				.then( function( values ) {
					// format the values
					return ask.formatDatavalues( values );
				}, function( state ) {
					if ( state !== false ) {
						showError( i18n.t( 'nodata', { subject: parsed.article + ' ' + parsed.property + ' ' + parsed.possesive + ' ' + parsed.item } ) );
					}
					return false;
				} )
				.then( function( formattedValues ) {
					// display the values
					parsed.value = combineValues( formattedValues );
					console.log( parsed );
					var format = parsed.callback ? parsed.callback : '$article $property $possesive $item $verb $value.'
					var answer = parser.buildAnswer( format, parsed );
					showResult( answer );
				}, function( state ) {
					// formatting failed
					if ( state !== false ) {
						showError( i18n.t( 'notformatted' ) );
					}
					return false;
				} );
			}
			// common question => get the description
			else {
				api.getEntities( itemId, 'descriptions' )
				.done( function( data ) {
					if ( data.entities[itemId].descriptions[api.language()] ) {
						showResult( data.entities[itemId].descriptions[api.language()].value );
					} else {
						showResult( itemId );
					}
				} );
			}
		}, function( notfound ) {
			// item not found
			if ( notfound !== false ) {
				showError( i18n.t( 'itemnotfound', { item: parsed.item } ) );
			} else {
				showIntro();
			}
		} );
	}

} )( jQuery );
