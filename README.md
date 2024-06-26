 # Kaukolainojen hallintaohjelmisto Weskari

Weskari on Jyväskylän yliopiston Avoimen tiedon keskuksen kehittämä ohjelmisto kaukolainojen hallinnointiin. 


![pääsivu](docs/main.png)

Bugiraportteja otetaan vastaan githubin issueina: [creating issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/creating-an-issue)

Avoimen tiedon keskus ei tarjoa käyttäjätukea, vaan ohjelmisto on käytettävissä sellaisenaan.



## Quick start kokeilemiseen

    git clone https://github.com/OSC-JYU/weskari.git
    cd weskari
    docker-compose up

Weskarin wirkailijakäyttölliittymä löytyy osoitteesta http://localhost:8080

Weskarissa ei tällä hetkellä ole asiakaslomaketta, vaan se täytyy kehittää itse.

Voit kuitenkin testata toiminnallisuutta ajamalla seuraavan komennon weskari -hakemistossa:

    curl -X POST -H "Content-Type: application/json" -d @test/request.json http://localhost:8080/api/pyynnot



## lokaali kehittäminen ilman dockeria

Hae koodit ja asenna riippuvuudet:

    git clone https://github.com/OSC-JYU/weskari.git
    cd weskari
    npm install

config.json -tiedostossa määritellään mongo-tietokantayhteys. Attribuutin "db" arvo määrää mitä yhteyttä käytetään.

HUOM! Voidaan yliajaa ympäristömuuttujalla. kts. Makefile


	"db": "docker",
	"remote": {
		"user": "USER",
		"password": "PASS",
		"db_name": "weskari",
		"db_url": "URL"
	},
	"docker": {
		"db_name": "weskari",
		"db_url": "weskari_mongo"
	},
	"local": {
		"db_name": "weskari",
		"db_url": "127.0.0.1"
	}


Sitten käyntiin:


    DEBUG=debug DEV=1 nodemon index.js


mene selaimella http://localhost:8103


Jotta kokotekstihaut toimii, niin niiden indeksit pitää olla luotuna:

https://www.mongodb.com/docs/manual/core/link-text-indexes/#std-label-text-search-on-premises

## config
 Config.json tiedoston *users* -kentässä määritellään sallitut käyttäjät. Käyttäjän lisäämisen jälkeen pitää kutsua config/reload enpointtia, jotta muutokset tulevat voimaan.

    curl -X POST -H "mail: ari.hayrinen@jyu.fi" http://localhost:8103/api/config/reload

tai selaimen dev-toolsseissa:

    fetch('https://tools.oscapps.jyu.fi/s/weskari/api/api/config/reload', {method: "POST"})
    .then(res => res.json())
    .then(console.log)

## Endpointit

TODO: lisää swagger-file
