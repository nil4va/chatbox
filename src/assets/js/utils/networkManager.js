
/**
 * Implementation of a simple network manager
 *
 * @author Lennard Fonteijn & Pim Meijer
 */
class NetworkManager {
    doRequest(route, data = {}) {
        const json = JSON.stringify(data);

        //TODO: for requests on same host - server is always same host - validate if its best solution
        const serverPort = 3000;
        const baseUrl = `${location.protocol}//${location.hostname}:${serverPort}`;

        const url = baseUrl + route;

        console.log(`Doing request to ${url}\nJSON: ${json}`);

        return new Promise((resolve, reject) => {

            $.ajax({
                url: url,
                type: "POST",
                dataType: 'json',
                contentType: 'application/json; charset=UTF-8',
                data: json,
                success: resolve,
                error: (xhr, ajaxOptions, thrownError) => this.__onFail(xhr, reject)
            });
        });

    }

    /**
     * general fail handler which is always executed, error handling in view or controller
     * @param xhr
     * @param reject callback from Promise
     * @private
     */
    __onFail(xhr, reject) {
        //400 is bad request, request has been arrived at server but server cant process it into a response
        console.log(xhr);
        const data = JSON.parse(xhr.responseText);
        if(xhr.status === 400) {
            console.log(`bad request error 400 ${data.reason}`);
        }

        reject({code: xhr.status, reason: data.reason});
    }
}