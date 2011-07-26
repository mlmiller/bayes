#!/usr/bin/env node

var http = require('http');
var BayesClassifier = require('./lib/bayes_classifier');
var sampleRows = BayesClassifier.exampleRows
var httpOptions = {
	'host': 'millertime.cloudant.com',
	'port': 80,
	'path': '/bitb/_design/bayes/_view/training?group=true'
};

// and run it on a few sample documents
var unknowns = {
	'boy' : {'height':65.65,'weight':168.61}, //it's a boy
	'girl' : {'height':50.81,'weight':156.85} //it's a girl
};

var unknownArgs = {};
process.argv.forEach(function(val, index, array) {
	if (val.match(/^(height|weight)=[0-9\.]+$/)) {
		var matches = val.split('=');
		unknownArgs[matches[0]] = matches[1];
	}
});

if (unknownArgs.height && unknownArgs.weight) {
	unknowns = {'unknown': unknownArgs};
}
var classify = function(rows, unknowns) {
	var unknown;
	for (key in unknowns) {
		unknown = unknowns[key];
		var result = BayesClassifier.classify(rows, unknown);

		console.log("\nClassifier result for "+key+" with height: "+unknown.height+" and weight: "+unknown.weight+":");
		console.log("\tProbability boy: "+result.boy);
		console.log("\tProbability girl: "+result.girl);
		console.log("\tGuess: "+result.guess);
	}
}

// Uncomment this to use example data
//classify(sampleRows, unknowns);

// Comment out the http.get call to use sample data instead
http.get(httpOptions, function(res) {
	  var viewResp = ''
	  res.on('data', function (chunk) {
		  viewResp += chunk; 
	  })
	  res.on('end', function(){
		  var view = JSON.parse(viewResp);
		  classify(view.rows, unknowns);
	  })
 
}).on('error', function(e) {
	  console.log("Got error: " + e.message);
});
