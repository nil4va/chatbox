/**
 * Implementation of a simple Database Manager
 *
 * @author Lennard Fonteijn
 */
function databaseManager() {
    var url = "http://localhost:8080";
    var token;

    function connect(newUrl) {
        url = newUrl;
    }

    function authenticate(newToken) {
        token = newToken;
    }

    function query(query, values) {
        if(!token) {
            token = prompt("Please enter an authentication token to connect to the database:");
        }

        var promise = $.Deferred();

        $.ajax({
            url: url,
            type: "POST",
            headers: {
                "Authorization": "Bearer " + token
            },
            data: JSON.stringify({
                query: query,
                values: values
            })
        }).done(function(data) {
            promise.resolve(data);
        }).fail(function(xhr) {
            if(xhr.status === 400) {
                var data = JSON.parse(xhr.responseText);

                promise.reject(data.reason);
            }
            else {
                promise.reject("Something bad happened, see console.");
            }
        });

        return promise;
    }

    return {
        connect: connect,
        authenticate: authenticate,
        query: query
    }
}