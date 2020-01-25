# PAD framework

## Features
- MySQL connector
- Voorbeeld routes met queries i.c.m. Express
- Enkele crypto helper functions
- MVC setup in front end met ES6, cookiemanager, networkmanager
- ..
## Dependencies - vooraf installeren!

- MySQL
- NodeJS - https://nodejs.org/en/download/ - Pak de LTS versie 
- Git

## Setup

1. Clone het project. En open deze in IntelliJ
2. Vanuit de root: draai ```npm install``` gebruik ```-g``` voor global install vanuit de root van het project
2. Configureer ```server/config/config.json```
3. Configureer ```server/config/users.json``` voor het specificeren van database. Voor nu worden er twee voorbeeldtabellen uitgelezen.
 Dit zijn de `user` tabel met `username` en `password` en de `kamer` tabel met `oppervlakte` en `kamercode`
4. Draai ```nodemon server/server.js```(auto refresh on code change) of `node server/server.js`
5. Open ```src/index.html``` in de browser


## TODO

- [ ] Error handling testen en uitbreiden
- [ ] Environment config voor url's, libs, PAD cloud
- [ ] Basis style toepassen  en Corendon vervangen
- [ ] ES6 imports scripts onderzoeken
- [ ] Doc op pad cloud + gitlab
- [ ] Browser compatibility testen

