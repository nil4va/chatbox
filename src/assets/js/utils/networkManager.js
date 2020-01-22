
/**
 * Implementation of a simple network manager
 *
 * @author Lennard Fonteijn & Pim Meijer
 */
class NetworkManager {

    doRequest(url, data = {}) {
        const promise = $.Deferred();
        const json = JSON.stringify(data);

        return $.ajax({
            url: url,
            type: "POST",
            dataType: 'json',
            contentType: 'application/json; charset=UTF-8',
            data: json
        }).done((data) => {
            promise.resolve(data);
        }).fail((xhr) => this.__onFail(xhr, promise));

    }

    /**
     * private function on fail
     * @param xhr
     * @param promise
     * @private
     */
    __onFail(xhr, promise) {
        //400 is bad request, request has been arrived at server but server cant process it into a response
        const data = JSON.parse(xhr.responseText);
        if(xhr.status === 400) {
            console.log(`bad request error 400 ${data.reason}`);
            promise.reject(data.reason);
        }
        else {
            console.log(`server error ${xhr.status} ${data.reason}`);
            promise.reject("Something bad happened, see console.");
        }
    }
}