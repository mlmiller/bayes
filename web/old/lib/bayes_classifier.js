var BayesClassifier = function() {
	var exampleRows = [
		{"key":["boy","height"],"value":{"sum":30176.780395,"count":500,"min":50.25586,"max":77.391131,"sumsqr":1832528.6584455539}},
		{"key":["boy","weight"],"value":{"sum":87258.608355,"count":500,"min":122.898343,"max":215.529415,"sumsqr":15341209.138569687}},
		{"key":["girl","height"],"value":{"sum":26641.40155,"count":500,"min":40.365006,"max":73.177459,"sumsqr":1432153.162301105}},
		{"key":["girl","weight"],"value":{"sum":72370.499821,"count":500,"min":90.32352,"max":196.793656,"sumsqr":10589978.333443519}}
	];

	var classify = function(rawRows, unknown) {
		result = {};

		// Need to keep this for normalization later
		var evidence = 0.0
        // var tclass, prop, val;
        var prop, val;

		var trainedRows = loadState(rawRows);
		for (var tclass in trainedRows) {
			// Accumulate posterior probability for a given class hypothesis
			var posterior = 1.0;
			for (prop in unknown) {
				val       = unknown[prop];
				moments   = trainedRows[tclass][prop];
				prob      = gausProb(moments['mean'], moments['sigma'], val);
				posterior = posterior * prob;
			}
			// Record into our result accumulator
			result[tclass] = posterior;
			// and accumulate the normalization
			evidence += posterior;
		}
		// Now apply the normalization
		var guess = '', val = -1, key;
		for (key in result) {
			if (result[key] > val) {
				guess = key;
				val   = result[key];
			}
			result[key] = result[key] / evidence;
		}

		result['guess'] = guess;
		return result;
	};

	var loadState = function(rows) {
		var trained = {}, row;
		for (i in rows) {
			row = rows[i];
			var tclass = row['key'][0],
				key    = row['key'][1],
				vals   = parseViewValue(row['value']);

			if (!trained[tclass])
				trained[tclass] = {};
			trained[tclass][key] = vals;
		}
		return trained;
	};

	var parseViewValue = function(value) {
		// Parse a result from a 'stats' view and convert to mean and sigma
		var mean  = value['sum'] / value['count'],
		    sigma = Math.sqrt(value['sumsqr']/value['count'] - mean*mean);

		return {'mean': mean, 'sigma': sigma};
	};

	var gausProb = function(mean, sigma, x) {
		var num = Math.exp(-1.0 * Math.pow(x-mean,2) / 2 / Math.pow(sigma, 2));
		var den = sigma * Math.sqrt(2 * Math.PI);
		return num/den;
	};

	return {
		'classify'    : classify,
		'exampleRows' : exampleRows
	};
}();

if (exports) {
	exports.exampleRows = BayesClassifier.exampleRows;
	exports.classify = BayesClassifier.classify;
}
