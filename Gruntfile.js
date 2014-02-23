module.exports = function ( grunt ) {
	grunt.loadNpmTasks( 'grunt-contrib-qunit' );
	grunt.loadNpmTasks( 'grunt-jsonlint' );

	grunt.initConfig( {
		qunit: {
			all: [ 'test/qunit.html' ]
		},
		jsonlint: {
			all: [ 'i18n/*.json', 'patterns/*.json' ]
		}
	} );

	grunt.registerTask( 'test', [ 'qunit', 'jsonlint' ] );
	grunt.registerTask( 'default', [ 'test' ] );
};
