/**
 * Implementation of a simple Session Manager
 *
 * @author Lennard Fonteijn & Pim Meijer
 */
class SessionManager {

    constructor() {
        try {
            this.session = JSON.parse(localStorage.getItem("session"));
        }
        catch (e) {
            //Do nothing
        }

        if(!this.session) {
            this.session = {};

            this.saveSession();
        }
    }

     get(key) {
        return this.session[key];
    }

     set(key, value) {
        this.session[key] = value;

        this.saveSession();
    }

     remove(key) {
        delete(this.session[key]);

        this.saveSession();
    }

     clear() {
        this.session = {};

        this.saveSession();
    }

     saveSession() {
        localStorage.setItem("session", JSON.stringify(this.session));
    }

}