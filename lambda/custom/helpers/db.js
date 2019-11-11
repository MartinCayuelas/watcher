const AWS = require('aws-sdk');
AWS.config.update({ region: "us-east-1" });
const tableName = "watcher";

const docClient = new AWS.DynamoDB.DocumentClient();

class dbHelper {
    constructor() { }

    addUser(userID) {
        return new Promise((resolve, reject) => {
            const params = {
                TableName: tableName,
                Item: {
                    'idClient': userID,
                    'MoviesSeen': [],
                    'MoviesToSee': []
                }
            };
            docClient.put(params, (err, data) => {
                if (err) {
                    console.log("Unable to insert =>", JSON.stringify(err))
                    return reject("Unable to insert");
                }
                console.log("Saved Data, ", JSON.stringify(data));
                resolve(data);
            });
        });
    }
    addMovieSeen(movie, userID) {
        return new Promise((resolve, reject) => {
            const params = {
                TableName: tableName,
                Key: {
                    "idClient": userID,
                },
                UpdateExpression: "SET #m = list_append(#m, :vals)",
                ExpressionAttributeNames: {
                    "#m": "MoviesSeen"
                },
                ExpressionAttributeValues: {
                    ":vals": [movie]
                },
                ReturnValues: "UPDATED_NEW"
            };
            docClient.update(params, (err, data) => {
                if (err) {
                    console.log("Unable to insert =>", JSON.stringify(err));
                    return reject("Unable to insert");
                }
                console.log("Saved Data, ", JSON.stringify(data));
                resolve(data);
            });
        });
    }
    addMovieToSee(movie, userID) {
        return new Promise((resolve, reject) => {
            const params = {
                TableName: tableName,
                Key: {
                    "idClient": userID,
                },
                UpdateExpression: "SET #m = list_append(#m, :vals)",
                ExpressionAttributeNames: {
                    "#m": "MoviesToSee"
                },
                ExpressionAttributeValues: {
                    ":vals": [movie]
                },
                ReturnValues: "UPDATED_NEW"
            };
            docClient.update(params, (err, data) => {
                if (err) {
                    console.log("Unable to insert =>", JSON.stringify(err));
                    return reject("Unable to insert");
                }
                console.log("Saved Data, ", JSON.stringify(data));
                resolve(data);
            });
        });
    }

    getMovies(userID) {
        return new Promise((resolve, reject) => {
            const params = {
                TableName: tableName,
                KeyConditionExpression: "#idClient = :user_id",
                ExpressionAttributeNames: {
                    "#idClient": "idClient"
                },
                ExpressionAttributeValues: {
                    ":user_id": userID
                }
            };
            docClient.query(params, (err, data) => {
                if (err) {
                    console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                    return reject(JSON.stringify(err, null, 2));
                }
                console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
                resolve(data.Items);
            });
        });
    }


    removeMovieFromMoviesToSee( movies, userID) {
        console.log("begin DELETE");

        return new Promise((resolve, reject) => {
            const params = {
                TableName: tableName,
                Key: {
                    "idClient": userID,
                },
                UpdateExpression: "SET #m = :vals",
                ExpressionAttributeNames: {
                    "#m": "MoviesToSee"
                },
                ExpressionAttributeValues: {
                    ":vals": movies
                },
                ReturnValues: "UPDATED_NEW"
            };
            docClient.update(params, (err, data) => {
                if (err) {
                    console.log("Unable to insert =>", JSON.stringify(err));
                    return reject("Unable to insert");
                }
                console.log("Saved Data, ", JSON.stringify(data));
                resolve(data);
            });
        });
    }

}
module.exports = new dbHelper();