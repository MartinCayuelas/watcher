const axios = require('axios');

class apiHelper {
    constructor() { }

    getRamdomMovieAPI(url) {
        return new Promise((resolve, reject) => {
            axios.get(url)
                .then(function (response) {
                    // handle success
                    const result = response.data
                    const index = Math.floor(Math.random() * Math.floor(result.results.length));
                    resolve(result.results[index]);
                })
                .catch(function (error) {
                    // handle error
                    console.log(error);
                    reject(error);
                })
        });
    }

    getDataMovieFromAPI(url) {
        return new Promise((resolve, reject) => {
            axios.get(url)
                .then(function (response) {
                    // handle success
                    const result = response.data
                    resolve(result.results[0]);
                })
                .catch(function (error) {
                    // handle error
                    console.log(error);
                    reject(error);
                })
        });
    }

    getListMoviesFromAPI(url) {
        return new Promise((resolve, reject) => {
            axios.get(url)
                .then(function (response) {
                    // handle success
                    const result = response.data
                    resolve(result.results);
                })
                .catch(function (error) {
                    // handle error
                    console.log(error);
                    reject(error);
                })
        });
    }
}
module.exports = new apiHelper();