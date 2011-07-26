function(head, req) {
	var ddoc = this;
	var BayesClassifier = require('lib/bayes_classifier');
	var Mustache = require('lib/mustache');
	var boy = {'height':65.65,'weight':168.61}; //it's a boy
	var girl = {'height':50.81,'weight':156.85}; //it's a girl

	provides('html', function() {
		// Use this block on cloudant
		var row, rows = [];
		while (row = getRow())
			rows.push(row);
		var boy_result = BayesClassifier.classify(rows, boy);
		var girl_result = BayesClassifier.classify(rows, girl);

		// Use this block with example rows on vanilla couchdb
		//var boy_result = BayesClassifier.classify(BayesClassifier.exampleRows, boy);
		//var girl_result = BayesClassifier.classify(BayesClassifier.exampleRows, girl);

		// Nested objects was not working with mustache for me
		var result = {
			boy_height: boy.height,
			boy_weight: boy.weight,
			girl_height: girl.height,
			girl_weight: girl.weight,
			boy_result_boy_prob: (boy_result.boy * 100).toFixed(2),
			boy_result_girl_prob: (boy_result.girl * 100).toFixed(2),
			boy_result_guess: boy_result.guess,
			girl_result_boy_prob: (girl_result.boy * 100).toFixed(2),
			girl_result_girl_prob: (girl_result.girl * 100).toFixed(2),
			girl_result_guess: girl_result.guess
		};


		return Mustache.to_html(ddoc.templates.classification, result);
	});

	provides('json', function() {
		var unknown = {
			'height': req.query.height,
			'weight': req.query.weight
		};
		// Use this block on cloudant
		var row, rows = [];
		while (row = getRow())
			rows.push(row);
		var result = BayesClassifier.classify(rows, unknown);

		// Use this block with example rows on vanilla couchdb
		//var result = BayesClassifier.classify(BayesClassifier.exampleRows, unknown);

		return JSON.stringify({
			"girl_probability" : result.girl,
			"boy_probability"  : result.boy,
			"guess"            : result.guess
		});
	});
}
