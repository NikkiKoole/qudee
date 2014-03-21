serve:
	python -m SimpleHTTPServer  

# watch for changes in all coffee files referenced beginning at main.coffee, build browserified bundle (with sourcemaps)
watch:
	watchify -t coffeeify --extension=".coffee" src/main.coffee -o build/bundle.js -d

# mangle top names, exclude a few names from mangling
uglify:
	node_modules/uglify-js/bin/uglifyjs build/bundle.js  -o build/bundle.min.js -m 
#TODO: make a simple build that will just build (not watch), for some reason 'browserify -c src/main.coffee > build/bundle.js' work on terminal but not in here. 


