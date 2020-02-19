# PAD framework

## Wat zit er in het framework?

**Back-end(server)**
- Opzet standaard webserver met ExpressJS en NodeJS. 
    - API: Hierbij zit een  `/login`  en `/dummy` route. Deze worden al aangesproken in de front-end
    - Connectie met MySQL database. Deze staat database staat net als bij FYS ergens op een server binnen de HvA. 
- Enkele crypto helper functions

**Front-end(HTML, CSS, JS)**
- MVC setup met twee voorbeelflows: een login en een stukje dummy data
    - `views` bevat html pagina
    - `controllers` 
    - `repositories` omdat we in Javascript(ES6) geen expliciete types hebben is er niet echt een model. Een repository haalt data op en geeft het terug aan een controller
- `sessionManager.js` voor het beheren van sessies in de browser
- `networkManager.js` voor het uitvoeren van netwerk request naar de API(Back-end)

## Dependencies - vooraf installeren!

- MySQL
- NodeJS - https://nodejs.org/en/download/ - Pak de LTS versie 
- Git

## Setup

1. Clone het project via Fork. Open het geclonede project in IntelliJ. Het is een vereiste om IntelliJ te gebruiken tijdens PAD.
2. Vanuit de folder `pad-framwork` draai ```npm install``` 
2. Configureer ```server/config/config.json```
3. Configureer ```server/config/users.json``` voor het specificeren van database. Voor nu worden er twee voorbeeldtabellen uitgelezen.
 Dit zijn de `user` tabel met `username` en `password` en de `kamer` tabel met `oppervlakte` en `kamercode`
4. Draai ```nodemon server/server.js```(auto refresh on code change) of `node server/server.js`
5. Open ```src/index.html``` in de browser. Je kunt hiervoor op het chrome(of andere browser) icoontje rechtsbovenin de file klikken.

## Server en Client?

In de `server` folder vind je alles wat met de back-end/api/server te maken heeft. Door middel van het draaien van ```nodemon server/server.js``` 
komt de server te draaien op een port.

In de folder `src` vind je alle HTML/CSS en JS, ook wel de front-end. Vanuit deze front-end kun je dus een request doen naar hierboven genoemde de server. 
Bij FYS hoefde je niet zelf de server te beheren en kon je een request doen naar de FYSCloud. Bij PAD is dit dus wel het geval!

Voorbeeld uit de console bij het doen van een inlogpoging:

Doing request to http://localhost:3000/user/login
JSON: ```{"username":"test","password":"test"}```

Hier zie je dus ook dat er JSON verstuurd wordt net als by FYS.

Weet je niet helemaal meer hoe het zat met GET, POST, query parameters en URL's? Doe les 1 van deze course:

https://classroom.udacity.com/courses/ud897/ 



## Voorbeeld - WIP

`server/app.js`

app.post('/user/login', (req, res) => {

});

`src/assets/js/userRepository.js`

``  async login(username, password) {
        return await appInstance().networkManager
            .doRequest(`${this.route}/login`, {"username": username, "password": password});
    }
``

`

##ES6
- classes en functies
- `async` en `await`
- `this` scope

## Deploy PAD Cloud

Nooit `node_modules` uploaden

## Links

Bootstrap kleuren en grids

## TODO

- [ ] Error handling testen en uitbreiden
- [ ] Basis style toepassen  en Corendon vervangen
- [ ] ES6 imports scripts onderzoeken
- [ ] Doc op pad cloud + gitlab
- [ ] Browser compatibility testen

