({
	baseUrl: "js",
	paths: {
		"bower"     : '../bower_components',
		"text"      : '../bower_components/text/text',
		"templates" : '../templates/',
		"dust"      : '../bower_components/dustjs-linkedin/dist/dust-full.min',
		"class"     : "lib/class",
		"jquery"	: "../bower_components/jquery/dist/jquery.min",
		"dict"		: "_"
	},
	shim: {
		"dust": {
			"exports": "dust"
		}
	},
	name: "../bower_components/almond/almond",
	include: "main",
	out: "dist/app.min.js"
})