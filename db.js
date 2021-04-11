var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost";

module.exports = {
    client: new MongoClient(url, { useUnifiedTopology: true }),
    async connect() {
        try {
            await this.client.connect();
            console.log("Connection with Data Base stable");
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
}
