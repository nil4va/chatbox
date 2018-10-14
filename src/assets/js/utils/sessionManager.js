/**
 * Implementation of a simple Session Manager
 *
 * @author Lennard Fonteijn
 */
function sessionManager() {
    var session = {};

    function get(key) {
        return session[key];
    }

    function set(key, value) {
        session[key] = value;

        saveSession();
    }

    function remove(key) {
        delete(session[key]);

        saveSession();
    }

    function clear() {
        session = {};

        saveSession();
    }

    function loadSession() {
        try {
            session = JSON.parse(localStorage.getItem("session"));
        }
        catch (e) {
            //Do nothing
        }

        if(!session) {
            session = {};

            saveSession();
        }
    }

    function saveSession() {
        localStorage.setItem("session", JSON.stringify(session));
    }

    loadSession();

    return {
        get: get,
        set: set,
        remove: remove,
        clear: clear
    }
}