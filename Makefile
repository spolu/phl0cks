clean:
	rm -rf node_modules

install: clean
	npm install

start: 
	rm -f ~/log/phl0cks.fvr
	forever start -a -l ~/log/phl0cks.fvr srv/app.js 

run:
	node srv/app.js

.PHONY: clean install start run
