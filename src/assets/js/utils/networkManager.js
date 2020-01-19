/**
 * Implementation of a simple Database Manager
 *
 * @author Lennard Fonteijn & Pim Meijer
 */
class NetworkManager {

    doRequest(url, data = {}) {
        //TODO: check what token needs to be
        // if(!token) {
        //     token = prompt("Please enter an authentication token to connect to the database:");
        //
        const promise = $.Deferred();
        const json = JSON.stringify(data);

        $.ajax({
            url: url,
            type: "POST",
            dataType: 'json',
            contentType: 'application/json; charset=UTF-8',
            headers: {
                "Authorization": "Bearer " + "!!EMPTY"
            },
            data: json
        }).done((data) => {
            promise.resolve(data);
        }).fail((xhr) => {
            if(xhr.status === 400) {
                const data = JSON.parse(xhr.responseText);
                promise.reject(data.reason);
            }
            else {
                promise.reject("Something bad happened, see console.");
            }
        });

        return promise;
    }
}