# polyball

Fast multiplayer tennis in two dimensions.

## dev setup

1. Install node, npm, & bower.
    
    (use your googlefu)

2. Clone the repo.

        git clone git@github.com:polyball/polyball.git

3. Install the dependencies.

        cd polyball/
        npm install
        bower install

When you make a change to anything the client cares about, run

    browserify lib\client\client.js > client\bin\client-bundle.js

from the project root.  This can be automated using [watchify](https://npmjs.org/package/watchify), just make sure you remember to start it.

## run setup

1. Follow dev setup instructions.
2. Edit polyball config file, `polyball.json`.
3. Run the server.

        node index.js
