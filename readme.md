# PAD framework

## Wat zit er in het framework?

**Back-end(server)**
- Opzet standaard webserver met Express.JS en NodeJS. 
    - API: Hierbij zit een  `/login`  en `/room_example` route. Deze worden al aangesproken in de front-end
    - Connectie met een MySQL database. Deze database staat net als bij FYS ergens op een server binnen de HvA.
- Enkele crypto helper functions voor bijv. het hashen van een wachtwoord
- Standaard logging met foutmeldingen en andere informatie

**Front-end(HTML, CSS, JS)**
- Bootstrap 4 voorbeeld layout
- "MVC" setup met twee voorbeeldflows: een login en een stukje testdata
    - `views` bevat de HTML pagina's
    - `controllers` bevat controllers - de schakeling tussen de views en de data
    - `repositories` omdat we in Javascript(ES6) geen expliciete types hebben is er niet echt een model. Een repository bevat/haalt data op en geeft het terug aan een controller.
- `sessionManager.js` voor het beheren van sessies in de browser
- `networkManager.js` voor het uitvoeren van netwerk request(AJAX) naar jullie eigen API

## Setup

### Dependencies - vooraf installeren!

- MySQL 
- NodeJS - https://nodejs.org/en/download/ - Pak de LTS versie - 14.15.5 
- Git
- IntelliJ Ultimate Edition

### Stappen om het framework voor het eerst te draaien

1. Clone of download het project naar je computer. **Al download je het project als .zip zorg dan dat je de uitgepakte folder
hernoemt naar `pad-framework`**, anders krijg je later problemen bij het open van html in de browser
2. File -> Open de geclonede  folder in IntelliJ.
3. Met het project geopend, open nu linksonderin het tabje >_Terminal. Voor je cursor moet het pad staan van het framework. Bijv. `C:\Users\pmeijer\projects\pad-framework`
4. Typ `cd server` en druk op enter. Dit verandert het pad naar de `..pad-framework/server` folder.
5. Typ nu het commando `npm install`. Dit installeert de packages uit `package.json` zoals bijv. de `mySQL` package voor NodeJS. Al krijg je de melding dat npm niet gevonden kan worden
zorg dan dat je nogmaals controleert of NodeJS geïnstalleerd is en dat je deze via Start(Windows) een keer hebt uitgevoerd. Start vervolgens IntellIJ
nog een keer op en probeer het opnieuw. 
   - Dit kan eventueel ook vanuit IntelliJ door rechts te klikken op de `package.json` en te kiezen voor `Run 'npm install'`.
6. Als laatste zou het fijn zijn als onze server automatisch herstart bij een code wijziging. Typ hiervoor het command `npm install nodemon -g` en druk op enter. Dit
commando installeert nodemon globaal(-g) zodat je het bij elk project zou kunnen gebruiken.
7. Typ nu `cd ..` zodat je weer in de bovenliggende folder terecht komt. Nu kun je de server applicatie runnen door het commando
`nodemon server/server.js` uit te voeren. 
   - Dit kan ook via het commando `npm start` of vanuit IntelliJ door weer rechts te klikken op `package.json` en te kiezen voor `Show npm Scripts`. Dubbelklik vervolgens op `start`.
8. Nu zul je een melding krijgen over dat ``server/config/config.local.json`` niet is geconfigureerd. Open dit bestand en vul hier de gegevens in
van de database van jullie team. Deze kunnen jullie vinden op: https://hbo-ict.cloud/. Voorbeeld van ingevulde `config.local.json`:
    
   ```
    {
        "database": {
            "host": "db.hbo-ict.cloud", //Geen port
            "timeout": 30000,
            "username": "pad_oba_10",
            "password": "<wachtwoord>",
            "database": "pad_oba_10_dev" //Dev of Live
        }
    }
    ```
    _Al krijg je de connectie om wat voor reden dan ook niet werkend, gebruik dan even een lokale database. Je maakt een 
   nieuw schema aan in MySQL Workbench, deze vul je in bij `"database"`. Als `"host"` vul je in localhost. Gebruikersnaam en 
   wachtwoord heb je zelf ingesteld bij MySQL Workbench._
   
9. In de root van het project(`/pad-framework`) vind je een bestandje `testdata.sql`. Vul eerst het goede schema in bovenaan: bijv. `pad_oba_10_dev`. Zorg dan dat één van de teamleden deze SQL een keer heeft uitgevoerd in jullie database.
Dit script maakt een `user` en een `room_example` tabel aan.
10. Draai nu nogmaals `nodemon server/server.js`. Nu zou de foutmelding moeten zijn verdwenen.
11. Test of de front-end een connectie kan maken met de server die we nu hebben draaien.
Open ```src/index.html``` in IntelliJ. Lanceer deze in de browser, je kunt hiervoor op het Chrome(of andere browser) icoontje rechtsbovenin de file klikken. Als je het goed
hebt gedaan krijg je nu een inlog scherm te zien! Zorg dat je het altijd op deze manier doet om CORS policy errors te voorkomen.
12. Log in met `test` en `test`. Als je op de welkompagina komt betekent dit dat de database goed is opgezet en dat je ready-to-code bent!

## Server en Client

In de `server` folder vind je alles wat met de back-end/server te maken heeft, voor nu houden we het op de naamgeving server.
Door middel van het draaien van ```nodemon server/server.js``` komt de server te draaien op een port(denk aan infrastructures!).

In de folder `src` vind je alle HTML/CSS en JS, ook wel de front-end. Vanuit deze front-end kun je dus een request doen naar hierboven genoemde server. 
Bij FYS hoefde je niet zelf de server te beheren en kon je een request doen naar de FYSCloud API. Bij PAD ga je dit dus ook zelf doen, je gaat dus je eigen
server beheren die je eigen API bevat voor je eigen front-end

Weet je niet helemaal meer hoe het zat met Server, Client, GET, POST, query parameters en URL's? Doe les 1 van de course Client-Server Communication:

https://classroom.udacity.com/courses/ud897/ 

## Voorbeeld van een flow(Welcome scherm)

<img src="readme_assets_gitlab/architecture_pad.png" width="600" height="400">

**Front-end**

`pad-framework/src`

1. `src/assets/js/app.js` is het startpunt van de front-end applicatie. Deze laadt altijd de `navBarController.js` welke verantwoordelijk is
voor de navigatie binnen de website. Deze controller vangt een klik af op een link en vraagt via `app.js` een andere controller op voor de betreffende pagina.
In dit voorbeeld is dit de `welcomeController.js`.
2. De `welcomeController.js` laadt de pagina `welcome.html` (V en C van MVC)
3. Deze controller maakt ook een instantie van `roomExampleRepostitory.js`. 
4. Via deze repository(komt nog aan bod bij OOP2) wordt er data(rooms) opgevraagd: `const roomData = await this.roomExampleRepository.get(roomId);`. Door middel van het gebruik van
 `async/await` hoeven we geen callbacks te gebruiken. De repository spreekt de `networkManager.js` aan welke uitendelijk
een `AJAX` request doet naar de server.
5. De networkManager gaat een request doen naar jullie API op jullie server. Hier worden de juiste waardes aan meegegeven zoals welke
room wordt opgevraagd. Dit wordt gedaan in JSON formaat. Je ziet dit in de console:
`Doing request to http://localhost:3000/room_example
JSON: {"id":1256}`

**Server**

`pad-framework/server`

6. De server draait bijv. op port 3000. Deze luistert of er requests binnen komen. Specifiek gebeurt dit in `server/app.js`. 
7. In dit geval zal de volgende route getriggered worden: `app.post('/room_example', (req, res) => { .. }`. Dit is een stukje code dat gebruik
maakt van `Express.JS`. In de course over NodeJS(zie studiehandleiding en links onderop) vind je meer over Express.JS.
8. Zoals je ziet verwachten we hier een `POST` request. Uit de `req` parameter kunnen we de JSON vissen die uit de front-end verstuurd is(id van room).
9. Binnen deze route kunnen we gebruik maken van `databaseHelper.js`. Dit script beheert de connectie naar de MySQL database. De functie `handleQuery(..)` kan een stukje data ophalen uit de database.
10. De laatste stap is om binnen deze route in `app.js` de data ook weer in JSON formaat terug te geven aan de front-end: `res.status(httpOkCode).json(data);`
Let ook op dat je ook altijd wat terug moet geven als het fout gaat: `(err) => res.status(badRequestCode).json({reason: err})`

Zie verder in de `welcomeController.js` hoe deze data dan weer op het scherm getoond wordt. Let wel op dat dit asynchroon(`async`) gebeurt. 


## Links/E-learning

### NodeJS/Express/NPM

- Learning Node.js https://www.linkedin.com/learning/learning-node-js-2
    - Chapter 1, 2 en 4 → Dit zijn de essentials binnen het NodeJS ecosysteem die je nodig hebt tijdens het project. Hier leer je
    meer over de basis van NodeJS, NPM(packages.json) en Express.JS.
    - Chapter 7,8 en 9 → Deze hoofdstukken gaan in op de wat moeilijkere concepten zoals asynchrone code, software testen en error handling.
    
### Client-Server Communication
    
https://classroom.udacity.com/courses/ud897/ 

In ieder geval les 1 is belangrijk. Les 5 over security is ook interessant, hier kom je ook meer te weten over wat CORS(`server/utils/corsConfigHelper.js`) is. 

### ES6

- ES6 – Een nieuwe versie van Javascript die in de front-end gebruiken https://classroom.udacity.com/courses/ud356
    - Lesson 1: 1tm5 + 10tm13 → Dit is het minimum van les 1, de rest is zeker ook interessant!
    - Lesson 2: 1tm9 + 12tm21 → Classes en Inheritance, nieuwe manier van functies schrijven t.o.v. FYS en het gebruik van het “this” keyword

### Bootstrap - layout toolkit voor HTML/CSS en JS

Hoe richt ik mijn layout in?

https://getbootstrap.com/docs/4.4/layout/grid/

Hoe verander ik padding/marging?

https://getbootstrap.com/docs/4.4/utilities/spacing/

Hoe verander ik kleuren?

https://getbootstrap.com/docs/4.4/utilities/colors/

Teksten

https://getbootstrap.com/docs/4.4/utilities/text/


## Troubleshooting

_Bij het runnen van de server krijg ik de melding port already in use:_

Eindig het proces node in taakbeheer en draai de server nog een keer.

_Ik krijg errors in de console:_

![Image description](readme_assets_gitlab/error_example_readme.png)

Het is hierbij van belang dat je goed kijkt wat er misgaat. Het kan nameelijk zoals in dit geval zo zijn dat er 
ook iets in het servergedeelte niet goed staat. Hier wordt een niet bestaand veld gequery'ed.

_Connection limit error:_

https://www.youtube.com/watch?v=e8psB6jmDYs&list=PLvltGXy557e6KYqvUltMopI5udp8i6GaK&index=7&ab_channel=HBO-ICT

## Deployen naar PAD Cloud
- https://www.youtube.com/watch?v=g38Nh6JWrGc&list=PLvltGXy557e6KYqvUltMopI5udp8i6GaK&index=6&ab_channel=HBO-ICT
- Nooit `node_modules` uploaden
