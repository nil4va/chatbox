/**
 * Returns security config for CORS, for now all requests are supported across domains
 *
 * @author Pim Meijer
 */

function corsConfigHelper(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );

    //some more complex requests will do an "OPTIONS" request first
    if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
        return res.status(200).json({});
    }

    //call next to continue the request flow -
    next();
}

module.exports = corsConfigHelper;