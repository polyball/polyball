# polyball

Fast, multiplayer, physics-driven tennis in two dimensions.


## setup

1. Install `node` & `npm`.

2. Install `bower` globally. (may need sudo)
    
        $ npm install -g bower
        
3. Install `gulp` globally. (may need sudo)
    
        $ npm install -g gulp

4. Clone and enter the polyball repo.

        $ git clone git@github.com:polyball/polyball.git

5. Install dependencies.

        $ npm install
        $ bower install

6. Build the client bundle (from the polyball root directory)

        $ gulp default
       

## test

See `./polyball/test/TestPlan.pdf` for the test plan in pdf form.

1. Navigate to the root directory of the project.

2. Run our test suite.

        $ gulp run-tests

3. Enjoy Nyan Cat.

## run

1. Follow setup instructions.
2. Edit polyball config file, `polyball.json`.
3. Run the server.

        $ node polyball/Server.js


## develop

1. Install `gulp` globally.

        $ npm install -g gulp

2. Install dev dependencies.

        $ cd polyball/
        $ npm install

3. [WINDOWS ONLY] Replace the polyball module symlink for browserify with a windows symlink

   Start `cmd`, probably as an administrator.  Navigate to the polyball project directory and run:

        cd node_modules
        mklink /D .\polyball ..\polyball

   and confirm the symlink file replacement if prompted.  Now avoid pushing that new symlink to the repo:

       cd ..     # now in project root directory
       git update-index --skip-worktree node_modules/polyball


4. To automatically watch all client source files and build them on change,  run

        gulp watch-js

   from the project root.  The gulp process will persist and report builds and changes.
