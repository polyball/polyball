# polyball

Fast multiplayer tennis in two dimensions.

## setup

1. Install node, npm, & bower.
    
    (use your googlefu)

2. Clone the repo.

        git clone git@github.com:polyball/polyball.git

3. Install the dependencies.

        cd polyball/
        npm install
        bower install

## run

1. Follow setup instructions.
2. Edit polyball config file, `polyball.json`.
3. Run the server.

        node polyball/server.js

## dev

To automatically watch all client source files and build them on change,  run

    gulp js

from the project root.  The process will persist and report builds and changes.

#TODO global dev dependencies!