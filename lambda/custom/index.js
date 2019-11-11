const Alexa = require('ask-sdk-core');
const i18n = require('i18next');
const languageStrings = require('./helpers/languageStrings');
const samplesHelper = require('./helpers/samples');
const dbHelper = require('./helpers/db');
const apiHelper = require('./helpers/api');
require('dotenv').config()

let LAST_MOVIE_ASKED;
let LAST_MOVIE_ASKED_OVERVIEW;

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const index = Math.floor(Math.random() * Math.floor(samplesHelper.launcherSamples.length));
        const speakOutput = samplesHelper.launcherSamples[index];

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const StatsProfildIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'StatsProfilIntent';
    },
    async handle(handlerInput) {
        let speakOutput = "Profil";
        const userID = handlerInput.requestEnvelope.context.System.user.userId;
        const data = await dbHelper.getMovies(userID);
        const moviesSeen = data[0].MoviesSeen;
        const moviesToSee = data[0].MoviesToSee;
        speakOutput = `Vous avez vu à ce jour, ${moviesSeen.length} films. Il vous reste ${moviesToSee.length} films dans votre liste de visionnage!`

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const MoviesSeenIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'MoviesSeenIntent';
    },
    async handle(handlerInput) {

        const numberOfMoviesWanted = handlerInput.requestEnvelope.request.intent.slots.nombreFilms.value;
        const position = handlerInput.requestEnvelope.request.intent.slots.positionFilm.value;
        let speakOutput;
        const userID = handlerInput.requestEnvelope.context.System.user.userId;
        const data = await dbHelper.getMovies(userID);
        const moviesSeen = data[0].MoviesSeen;

        if (numberOfMoviesWanted != undefined) {
            let max = numberOfMoviesWanted;
            if (numberOfMoviesWanted > moviesSeen.length) {
                max = moviesSeen.length;
            } else if (numberOfMoviesWanted < 1) {
                max = 1
            }
            speakOutput = "Vous avez vu : ";
            moviesSeen.reverse().slice(0, max).map(movie => speakOutput = speakOutput + movie + ", ");
        } else {
            if (position.toString() === "premier") {
                speakOutput = "Le premier film était ";
                speakOutput = speakOutput + "" + moviesSeen[0]
            } else if (position.toString() === "dernier") {
                speakOutput = "Votre dernier film est  ";
                speakOutput = speakOutput + "" + moviesSeen[moviesSeen.length - 1]
            } else {
                speakOutput = "Vous avez regardé : ";
                moviesSeen.reverse().slice(0, moviesSeen.length).map(movie => speakOutput = speakOutput + movie + ", ");
            }
        }

        if (moviesSeen.length == 0) {
            speakOutput = "Votre liste est vide. Regardez un film !"
        }
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const MoviesToSeeIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'MoviesToSeeIntent';
    },
    async handle(handlerInput) {

        const numberOfMoviesWanted = handlerInput.requestEnvelope.request.intent.slots.nombreFilms.value;
        const position = handlerInput.requestEnvelope.request.intent.slots.positionFilm.value;
        let speakOutput = "";
        const userID = handlerInput.requestEnvelope.context.System.user.userId;
        const data = await dbHelper.getMovies(userID);
        const moviesToSee = data[0].MoviesToSee;

        if (numberOfMoviesWanted != undefined) {
            let max = numberOfMoviesWanted;
            if (numberOfMoviesWanted > moviesToSee.length) {
                max = moviesToSee.length;
            } else if (numberOfMoviesWanted < 1) {
                max = 1
            }
            moviesToSee.reverse().slice(0, max).map(movie => speakOutput = speakOutput + movie + ", ");
            speakOutput = speakOutput + " sont en attente!";
        } else if (position != undefined) {
            if (position.toString() === "premier") {
                speakOutput = "Le premier film de la liste est : " + moviesToSee[0];
            } else if (position.toString() === "dernier") {
                speakOutput = "Votre dernier film en attente est : " + moviesToSee[moviesToSee.length - 1];
            } else {
                speakOutput = "Votre liste est composée de : ";
                moviesToSee.reverse().slice(0, moviesToSee.length).map(movie => speakOutput = speakOutput + movie + ", ");
            }
        } else {
            moviesToSee.reverse().slice(0, moviesToSee.length).map(movie => speakOutput = speakOutput + movie + ", ");
            speakOutput = speakOutput + " sont en attente!";
        }

        if (moviesToSee.length == 0) {
            speakOutput = "Votre liste est vide. Ajoutez un film !"
        }

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const RandomMovieIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'RandomMovieIntent';
    },
    async handle(handlerInput) {
        let speakOutput;
        const randomPage = Math.floor(Math.random() * Math.floor(10));
        const randomSample = Math.floor(Math.random() * Math.floor(samplesHelper.choiceSamples.length));
        const url = `https://api.themoviedb.org/3/discover/movie?api_key=${process.env.API_KEY}&language=fr&sort_by=popularity.desc&include_adult=false&include_video=false&page=${randomPage}`
        const datas = await apiHelper.getRamdomMovieAPI(url);

        LAST_MOVIE_ASKED = datas.title;
        LAST_MOVIE_ASKED_OVERVIEW = datas.overview + `<break time="0.5s"/>  Sorti le ${datas.release_date}`;
        speakOutput = samplesHelper.choiceSamples[randomSample] + " " + datas.title + ".\n";
        speakOutput = speakOutput + "Que souhaitez vous faire?";

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const GetPopularMoviesIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetPopularMoviesIntent';
    },
    async handle(handlerInput) {
        let speakOutput = "Les films du moment sont : ";
        const url = `https://api.themoviedb.org/3/movie/popular?api_key=${process.env.API_KEY}&language=fr&page=1`
        const datas = await apiHelper.getListMoviesFromAPI(url);


        datas.slice(0, 3).map(movie => speakOutput = speakOutput + movie.title + ", ");

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const GetInfosMovieIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetInfosMovieIntent';
    },
    async handle(handlerInput) {
        let speakOutput;
        const movie = handlerInput.requestEnvelope.request.intent.slots.film.value;
        if (movie == undefined) {
            speakOutput = LAST_MOVIE_ASKED_OVERVIEW + `<break time="0.5s"/>\n Que souhaitez vous? Le regarder, l'ajouter à votre liste de visionnage ou changer de film?`
        } else {
            const url = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.API_KEY}&query=${movie.toString()}&language=fr`;
            const datas = await apiHelper.getDataMovieFromAPI(url);
            LAST_MOVIE_ASKED = datas.title;
            LAST_MOVIE_ASKED_OVERVIEW = datas.overview + `<break time="0.5s"/>  Sorti le ${datas.release_date}`;
            speakOutput = LAST_MOVIE_ASKED_OVERVIEW + `<break time="0.5s"/>\n Que souhaitez vous? Le regarder, l'ajouter à votre liste de visionnage ou changer de film?`
        }

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();

    }
};

const WatchMovieIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'WatchMovieIntent';
    },
    async handle(handlerInput) {
        const userID = handlerInput.requestEnvelope.context.System.user.userId;
        const movie = handlerInput.requestEnvelope.request.intent.slots.film.value;
        const data = await dbHelper.getMovies(userID);
        const moviesSeen = data[0].MoviesSeen;
        if (movie == undefined) {
            try {
                const alreadyExist = data[0].MoviesToSee.includes(LAST_MOVIE_ASKED);
                if (!moviesSeen.includes(LAST_MOVIE_ASKED)) {
                    const a = await dbHelper.addMovieSeen(LAST_MOVIE_ASKED, userID);
                }
                if (alreadyExist === true) {
                    const moviesTosave = data[0].MoviesToSee.filter(movie => movie != LAST_MOVIE_ASKED);
                    const r = await dbHelper.removeMovieFromMoviesToSee(moviesTosave, userID);
                }
                const speechText = `Votre film ${LAST_MOVIE_ASKED} a été ajouté! Visionnage en cours`;
                return handlerInput.responseBuilder
                    .speak(speechText)
                    .reprompt(speechText)
                    .getResponse();
            }
            catch (err) {
                console.log("Error occured while saving movie", err);
                const speechText_1 = "Problème dans la requête. Merci de retenter!";
                return handlerInput.responseBuilder
                    .speak(speechText_1)
                    .reprompt(speechText_1)
                    .getResponse();
            }
        } else {
            const url = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.API_KEY}&query=${movie.toString()}&language=fr`;
            const datas = await apiHelper.getDataMovieFromAPI(url);
            LAST_MOVIE_ASKED = datas.title;
            LAST_MOVIE_ASKED_OVERVIEW = datas.overview + `<break time="0.5s"/>  Sorti le ${datas.release_date}`;
            const alreadyExist = data[0].MoviesToSee.includes(LAST_MOVIE_ASKED);

            if (!moviesSeen.includes(LAST_MOVIE_ASKED)) {
                const a = await dbHelper.addMovieSeen(LAST_MOVIE_ASKED, userID);
            }
            if (alreadyExist === true) {
                const moviesTosave = data[0].MoviesToSee.filter(movie => movie != LAST_MOVIE_ASKED);
                const r = await dbHelper.removeMovieFromMoviesToSee(moviesTosave, userID);
            }
            const speechText = `Votre film ${LAST_MOVIE_ASKED} a été ajouté! Visionnage en cours`;
            return handlerInput.responseBuilder
                .speak(speechText)
                .reprompt(speechText)
                .getResponse();
        }
    }
};

const AddListToSeeIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AddListToSeeIntent';
    },
    async handle(handlerInput) {
        const userID = handlerInput.requestEnvelope.context.System.user.userId;
        const data = await dbHelper.getMovies(userID);
        const moviesToSee = data[0].MoviesToSee;
        try {
            const movie = handlerInput.requestEnvelope.request.intent.slots.film.value;
            if (movie == undefined) {
                if (!moviesToSee.includes(LAST_MOVIE_ASKED)) {
                    await dbHelper.addMovieToSee(LAST_MOVIE_ASKED, userID);
                }
                const speechText = `Votre film ${LAST_MOVIE_ASKED} a été ajouté à votre liste de films à voir!`;
                return handlerInput.responseBuilder
                    .speak(speechText)
                    .reprompt(speechText)
                    .getResponse();
            } else {
                const url = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.API_KEY}&query=${movie.toString()}&language=fr`;
                const datas = await apiHelper.getDataMovieFromAPI(url);
                LAST_MOVIE_ASKED = datas.title;
                LAST_MOVIE_ASKED_OVERVIEW = datas.overview + `<break time="0.5s"/>  Sorti le ${datas.release_date}`;
                if (!moviesToSee.includes(LAST_MOVIE_ASKED)) {
                    await dbHelper.addMovieToSee(LAST_MOVIE_ASKED, userID);
                }
                const speechText = `Votre film ${LAST_MOVIE_ASKED} a été ajouté à votre liste de films à voir!`;
                return handlerInput.responseBuilder
                    .speak(speechText)
                    .reprompt(speechText)
                    .getResponse();
            }
        }
        catch (err) {
            console.log("Error occured while saving movie", err);
            const speechText_1 = "Problème dans la requête. Merci de retenter!";
            return handlerInput.responseBuilder
                .speak(speechText_1)
                .reprompt(speechText_1)
                .getResponse();
        }
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = handlerInput.t('HELP_MSG');

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const random = Math.floor(Math.random() * Math.floor(samplesHelper.endSamples.length));
        const speakOutput = samplesHelper.endSamples[random]

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = handlerInput.t('FALLBACK_MSG');

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = handlerInput.t('REFLECTOR_MSG', { intentName: intentName });

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = handlerInput.t('ERROR_MSG');
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};


// This request interceptor will bind a translation function 't' to the handlerInput
const LocalisationRequestInterceptor = {
    process(handlerInput) {
        i18n.init({
            lng: Alexa.getLocale(handlerInput.requestEnvelope),
            resources: languageStrings
        }).then((t) => {
            handlerInput.t = (...args) => t(...args);
        });
    }
};
/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        StatsProfildIntentHandler,
        MoviesSeenIntentHandler,
        MoviesToSeeIntentHandler,
        RandomMovieIntentHandler,
        GetPopularMoviesIntentHandler,
        GetInfosMovieIntentHandler,
        WatchMovieIntentHandler,
        AddListToSeeIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .addRequestInterceptors(
        LocalisationRequestInterceptor)
    .withCustomUserAgent('sample/hello-world/v1.2')
    .lambda();
