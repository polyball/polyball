/**
 * Created by ryan on 16/05/16.
 */
var IdGenerator = {
    nextID : (function () {
        var nextID = 1;

        return function () {

            if (typeof window !== 'undefined') {
                throw new Error("Client Model must not create its own IDs!");
            }

            return nextID++;
        };
    }())
};

module.exports = IdGenerator;
