serve:
	python -m SimpleHTTPServer  

watch:
	watchify -t coffeeify --extension=".coffee" src/main.coffee -o build/bundle.js -d

uglify:
	node_modules/uglify-js/bin/uglifyjs build/bundle.js -mt  -o build/bundle.min.js -m '$,require,exports' 
	


