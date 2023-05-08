const mongoist 		= require('mongoist');
var connection_string = '127.0.0.1:27017/weskari';

var db = mongoist(connection_string)


before((done) => {
	(async (done) => {
		try {
			await db.pyynnot.drop();
		} catch(e) {
			console.log('pyynnot kokoelmaa ei voitu dropata') // continue even if collection did not exist
		}

		try {
			await db.asiakkaat.drop();
		} catch(e) {
			console.log('asiakkaat kokoelmaa ei voitu dropata') // continue even if collection did not exist
		}

		try {
			await db.tilaukset.drop();
		} catch(e) {
			console.log('tilaukset kokoelmaa ei voitu dropata') // continue even if collection did not exist
		}

		try {
			await db.asiakkaat.createIndex({"sahkoposti":1}, {"unique":1});
			await db.asiakkaat.createIndex({"sahkoposti":"text", "sukunimi":"text", "etunimi":"text"});
			await db.pyynnot.createIndex({"teoksen_tiedot":"text", "artikkelin_tiedot":"text", "julkaisun_tiedot":"text", "huomautuksia": "text"});
		} catch(e) {
			throw("indeksin luominen ei onnistunut, testejä ei voi tehdä")
		}

	})().then(() => {
		done();
	})
});
