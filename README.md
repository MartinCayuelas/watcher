![WATCHER-LOGO](https://user-images.githubusercontent.com/23449337/68150609-62acea80-ff40-11e9-9b2c-ab79f34eba11.png)

## Description

Watcher is a skill that allows you to manage your movies using playlists. You can request a film of your choice or find out what you have watched recently.

This project is realized within the framework of a Web Intelligence course by Martin **Cayuelas**, Nicolas **Guary**, Nathan **Guillaud**, Théo **Ponthieu**.


## Features


### Movies
#### Random
- Random movies

- Listen to the synopsis of this last one

- Watch this last one

- Add it to the waiting list
#### With choice
- Search for information on a film of your choice

- Watch a movie of your choice

- Add a film of your choice to the waiting list
  
- Ask for another movie if the last request is not suitable

- Request current popular movies
  

### Stats
-  Know how many movies the user has watched and how many movies he has left on his waiting list.
#### Movies Seen
- Firts movie seen
- Last movie seen
- All movies seen

#### Movies in the waiting list
- All films in waiting
- Give Y movies to watch

-------------

## Usage And Setup

To use and install, first of all you must clone the project

```
git clone https://github.com/MartinCayuelas/watcher.git
cd watcher
```

![#f03c15](https://placehold.it/15/f03c15/000000?text=+) You must install `ask-cli` and have Node.js (`node --version`to see) on your computer. 
Follow the link: https://developer.amazon.com/docs/smapi/quick-start-alexa-skills-kit-command-line-interface.html 

![#f03c15](https://placehold.it/15/f03c15/000000?text=+) After that, you need to have an account on **AWS** and one other on **Alexa console developper**.
You need your AWS credentials (Key and private key).
After that, use VSCode for example: https://docs.aws.amazon.com/fr_fr/toolkit-for-vscode/latest/userguide/welcome.html

![#f03c15](https://placehold.it/15/f03c15/000000?text=+) In the terminal, run `ask init` to create your profile and save your credentials.
Once completed, do `ask deploy` and this should start the deployment. A skill will be created and an associated lambda and the `/.ask/config` file will contain the information.

![#f03c15](https://placehold.it/15/f03c15/000000?text=+) To finish it will be **necessary** to set up your database on AWS with DynamoDB. To do this, you need:
- Your userID (retrievable with `aws iam get-user --user-name YourUserName`)
- The database tables:
  - TableName: watcher
  - columns: idClient (int), MoviesToSee (List[String]), MoviesSeen (List[String])

![#f03c15](https://placehold.it/15/f03c15/000000?text=+) Finally an account on **TMDB** (https://www.themoviedb.org) and create your API key to put in an `.env`file at the root `/` project (` API_KEY=YourKeyOfTheApi`)



