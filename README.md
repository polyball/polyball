# polyball

Fast, multiplayer, physics-driven tennis in two dimensions.

## setup

1. Install `node` & `npm`.

2. Install `bower` globally.
    
        npm install -g bower

3. Clone and enter the polyball repo.

        git clone git@github.com:polyball/polyball.git

4. Install dependencies.

        npm install --production
        bower install

## run

1. Follow setup instructions.
2. Edit polyball config file, `polyball.json`.
3. Run the server.

        node polyball/server.js

## dev

1. Install `gulp` globally.

        npm install -g gulp

2. Install dev dependencies.

        cd polyball/
        npm install --production

To automatically watch all client source files and build them on change,  run

    gulp watch-js

from the project root.  The process will persist and report builds and changes.
