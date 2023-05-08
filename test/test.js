

let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();


let url = "http://localhost:8103/api";

var pyynto_id = null;
var pyynto_tilattu_id = null;
var pyynto_lainassa_id = null;
var pyynto_kasittelyssa_id = null;
var pyynto_artikkeli_id = null;

var organisaatio_id = null;
var kirjasto_id = null

var tilaus1_id = null
var tilaus2_id = null

chai.use(chaiHttp);


describe('Pyynnot', () => {


	describe('/POST pyynnot', () => {
		it('luo pyynto', (done) => {
			let project = {
				asiakastyyppi: 'henkilokunta',
				hankintaehdotus_vai_kaukolainapyynto: 'kaukolainapyyntö',
				hintakatto: '6 €',
				teos_on: 'kirja',
				teoksen_tiedot: 'Lokaaliteos käsittelyssä',
				huomautuksia: '',
				mista_loysit_julkaisun_tiedot: '',
				maksaja: 'asiakas',
				etunimi: 'Matti',
				sukunimi: 'Myöhänen',
				tilaajan_sahkoposti: 'nasa@gmail.com',
				kirjastokortin_numero: '',
			};
			chai.request(url)
				.post('/pyynnot')
				.send(project)
				.end((err, res) => {
					//console.log(res.body)
					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.should.have.property('pyynto_pvm');
					res.body.should.have.property('_id');
					pyynto_kasittelyssa_id = res.body._id;
					done();
				});
		});
	});

	describe('/POST pyynnot', () => {
		it('luo pyynto', (done) => {
			let project = {
				asiakastyyppi: 'henkilokunta',
				hankintaehdotus_vai_kaukolainapyynto: 'kaukolainapyyntö',
				hintakatto: '6 €',
				teos_on: 'artikkeli',
				artikkelin_tiedot: 'Kokemuksia kaukopalveluohjelmiston kehittämisestä',
				julkaisun_tiedot: 'Kaukopalvelukehittäjien uutiset, 2020, nro 34',
				huomautuksia: 'ei ole',
				mista_loysit_julkaisun_tiedot: 'Internetistä',
				maksaja: 'laitos',
				laitos: 'Kaukopalvelujen laitos',
				etunimi: 'Matti',
				sukunimi: 'Myöhänen',
				tilaajan_sahkoposti: 'nasa@gmail.com',
				kirjastokortin_numero: '',
			};
			chai.request(url)
				.post('/pyynnot')
				.send(project)
				.end((err, res) => {
					//console.log(res.body)
					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.should.have.property('pyynto_pvm');
					res.body.should.have.property('_id');
					pyynto_artikkeli_id = res.body._id;
					done();
				});
		});
	});

	describe('/GET asiakkaat', () => {
		it('pyynnon tehnyt asiakas taytyy olla olemassa', (done) => {
			chai.request(url)
				.get('/asiakkaat?sahkoposti=nasa@gmail.com')
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('array');
					res.body.length.should.be.eql(1);
					done();
				});
		});
	});

	describe('/POST pyynnot', () => {
		it('luo pyynto (opiskelija)', (done) => {
			let project = {
				asiakastyyppi: 'opiskelija',
				hankintaehdotus_vai_kaukolainapyynto: 'kaukolainapyyntö',
				hintakatto: '6 €',
				teos_on: 'kirja',
				teoksen_tiedot: 'Lokaaliteos',
				huomautuksia: 'Tämä on juuri tullut',
				mista_loysit_julkaisun_tiedot: '',
				etunimi: 'Matti',
				sukunimi: 'Myöhänen',
				tilaajan_sahkoposti: 'ari.hayrinen@jyu.fi',
				kirjastokortin_numero: '',
			};
			chai.request(url)
				.post('/pyynnot')
				.send(project)
				.end((err, res) => {
					//console.log(res.body)
					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.should.have.property('pyynto_pvm');
					res.body.should.have.property('_id');
					pyynto_id = res.body._id;
					done();
				});
		});
	});


	describe('/POST pyynnot', () => {
		it('luo pyynto', (done) => {
			let project = {
				asiakastyyppi: 'henkilokunta',
				hankintaehdotus_vai_kaukolainapyynto: 'kaukolainapyyntö',
				hintakatto: '6 €',
				teos_on: 'kirja',
				teoksen_tiedot: 'Lokaaliteos tilattu',
				huomautuksia: 'Tämä on tilattu kaukokirjastosta',
				mista_loysit_julkaisun_tiedot: '',
				maksaja: 'asiakas',
				etunimi: 'Matti',
				sukunimi: 'Myöhänen',
				tilaajan_sahkoposti: 'nasa@gmail.com',
				kirjastokortin_numero: '',
			};
			chai.request(url)
				.post('/pyynnot')
				.send(project)
				.end((err, res) => {
					//console.log(res.body)
					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.should.have.property('pyynto_pvm');
					res.body.should.have.property('_id');
					pyynto_tilattu_id = res.body._id;
					done();
				});
		});
	});

	describe('/POST pyynnot', () => {
		it('luo pyynto', (done) => {
			let project = {
				asiakastyyppi: 'henkilokunta',
				hankintaehdotus_vai_kaukolainapyynto: 'kaukolainapyyntö',
				hintakatto: '6 €',
				teos_on: 'kirja',
				teoksen_tiedot: 'Lokaaliteos lainassa',
				huomautuksia: 'Googlella',
				mista_loysit_julkaisun_tiedot: '',
				maksaja: 'asiakas',
				etunimi: 'Matti',
				sukunimi: 'Myöhänen',
				tilaajan_sahkoposti: 'nasa@gmail.com',
				kirjastokortin_numero: '',
			};
			chai.request(url)
				.post('/pyynnot')
				.send(project)
				.end((err, res) => {
					//console.log(res.body)
					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.should.have.property('pyynto_pvm');
					res.body.should.have.property('_id');
					pyynto_lainassa_id = res.body._id;
					done();
				});
		});
	});


	describe('/POST pyynnot', () => {
		it('luo pyynto ilman tilaajan sähköpostia', (done) => {
			let project = {
				asiakastyyppi: 'henkilokunta',
				hankintaehdotus_vai_kaukolainapyynto: 'kaukolainapyyntö',
				hintakatto: '6 €',
				teos_on: 'kirja',
				teoksen_tiedot: 'Lokaaliteos lainassa',
				huomautuksia: 'Googlella',
				mista_loysit_julkaisun_tiedot: '',
				maksaja: 'asiakas',
				etunimi: 'Matti',
				sukunimi: 'Myöhänen',
				kirjastokortin_numero: '',
			};
			chai.request(url)
				.post('/pyynnot')
				.send(project)
				.end((err, res) => {
					//console.log(res.body)
					res.should.have.status(422);
					done();
				});
		});
	});

	describe('/GET pyynnot', () => {
		it('hae kaikki uuden pyynnöt', (done) => {
			chai.request(url)
				.get('/pyynnot?status=uusi')
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('array');
					res.body.length.should.be.eql(5);
					done();
				});
		});
	});


	describe('/PUT pyynnot', () => {
		it('varaa pyynto', (done) => {
			let varaus = {
				status: 'kasittelyssa',
				kasittelija: 'ari.hayrinen@jyu.fi'
			};
			chai.request(url)
				.put('/pyynnot/' + pyynto_kasittelyssa_id)
				.send(varaus)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					done();
				});
		});
	});

	describe('/PUT pyynnot', () => {
		it('varaa toinen pyynto', (done) => {
			let varaus = {
				status: 'kasittelyssa',
				kasittelija: 'ari.hayrinen@jyu.fi'
			};
			chai.request(url)
				.put('/pyynnot/' + pyynto_tilattu_id)
				.send(varaus)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					done();
				});
		});
	});

	describe('/PUT pyynnot', () => {
		it('varaa toinen pyynto', (done) => {
			let varaus = {
				status: 'kasittelyssa',
				kasittelija: 'ari.hayrinen@jyu.fi'
			};
			chai.request(url)
				.put('/pyynnot/' + pyynto_lainassa_id)
				.send(varaus)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					done();
				});
		});
	});

	describe('/GET pyynnot', () => {
		it('hae kaikki uuden pyynnöt kun yksi on otettu käsittelyyn', (done) => {
			chai.request(url)
				.get('/pyynnot?status=uusi')
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('array');
					res.body.length.should.be.eql(2);
					done();
				});
		});
	});

});




describe('Asiakkaat', () => {


	describe('/POST asiakkaat', () => {
		it('luo asiakas', (done) => {
			let project = {
				sukunimi: 'Mocha',
				etunimi: 'Chai',
				sahkoposti: 'chai@mocha.com',
				huomio: 'testauksen testiasiakas',
				kirjastokortin_numero: '',
			};
			chai.request(url)
				.post('/asiakkaat')
				.send(project)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.should.have.property('_id');
					done();
				});
		});
	});

	describe('/POST asiakkaat', () => {
		it('yritä luoda asiakas joka on jo olemassa', (done) => {
			let project = {
				sukunimi: 'Mocha',
				etunimi: 'Chai',
				sahkoposti: 'chai@mocha.com',
				huomio: 'testauksen testiasiakas',
				kirjastokortin_numero: '',
			};
			chai.request(url)
				.post('/asiakkaat')
				.send(project)
				.end((err, res) => {
					res.should.have.status(500);
					done();
				});
		});
	});

});



describe('Kirjastot', () => {

	describe('/POST kirjastot', () => {
		it('luo kirjasto', (done) => {
			let project = {
				nimi: 'Testikirjasto 1',
				lyhenne: 'testi1',
				email: 'chai@mocha.com',
				osoite: 'www.testi1.fi'
			};
			chai.request(url)
				.post('/kirjastot')
				.send(project)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.should.have.property('_id');
					kirjasto_id = res.body._id;
					done();
				});
		});
	});

	describe('/PUT kirjastot', () => {
		it('muokkaa kirjaston tietoja', (done) => {
			let edit = {
				email: 'muokattu@gmail.com',
				osoite: 'muokattu osoite'
			};
			chai.request(url)
				.put('/kirjastot/' + kirjasto_id)
				.send(edit)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					done();
				});
		});
	});

	describe('/GET kirjastot', () => {
		it('pitää sisältää muutokset', (done) => {
			chai.request(url)
				.get('/kirjastot/' + kirjasto_id)
				.end((err, res) => {
					console.log(kirjasto_id)
					res.should.have.status(200);
					res.body.should.be.a('object');
					chai.expect(res.body).to.have.property("email", "muokattu@gmail.com");
					chai.expect(res.body).to.have.property("osoite", "muokattu osoite");
					done();
				});
		});
	});

});




describe('Organisaatiot', () => {

	describe('/POST organisaatiot', () => {
		it('luo organisaatio', (done) => {
			let project = {
				nimi: 'mongoose',
				kustannuspaikka: '6666',
				huomio: 'huomio tästä organisaatiosta'
			};
			chai.request(url)
				.post('/organisaatiot')
				.send(project)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.should.have.property('_id');
					organisaatio_id = res.body._id;
					done();
				});
		});
	});


	describe('/POST organisaatiot', () => {
		it('should reject empty name for organisation', (done) => {
			let project = {
				kustannuspaikka: '66661',
				huomio: 'tätä ei pitäisi olla'
			};
			chai.request(url)
				.post('/organisaatiot')
				.send(project)
				.end((err, res) => {
					res.should.have.status(422);
					done();
				});
		});
	});


	describe('/PUT organisaatiot', () => {
		it('muokkaa organisaation tietoja', (done) => {
			let edit = {
				nimi: 'Kaukopalvelujen laitos',
				huomio: 'MUOKATTU huomio'
			};
			chai.request(url)
				.put('/organisaatiot/' + organisaatio_id)
				.send(edit)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					done();
				});
		});
	});

	describe('/GET organisaatiot', () => {
		it('pitää sisältää muutokset', (done) => {
			chai.request(url)
				.get('/organisaatiot/' + organisaatio_id)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					chai.expect(res.body).to.have.property("nimi", "Kaukopalvelujen laitos");
					chai.expect(res.body).to.have.property("huomio", "MUOKATTU huomio");
					done();
				});
		});
	});

});


describe('Tilaukset', () => {

	describe('/POST tilaukset', () => {
		it('luo tilaus', (done) => {
			let tilaus = {
				info: "Testitilaus",
				kirjasto_id: kirjasto_id,
				kirjaston_nimi: "Testikirjasto 1",
				viesti: "Tilaisin opuksen ..fghjklö"
			};
			chai.request(url)
				.post('/pyynnot/' + pyynto_tilattu_id + '/tilaukset')
				.send(tilaus)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.should.have.property('_id');
					tilaus1_id = res.body._id;
					done();
				});

		});
	});

	describe('/POST tilaukset', () => {
		it('luo tilaus', (done) => {
			let tilaus = {
				info: "Testitilaus testikirjastosta",
				kirjasto_id: kirjasto_id,
				kirjaston_nimi: "Testikirjasto 1",
				viesti: "Tilaisin opuksen ..jotain"
			};
			chai.request(url)
				.post('/pyynnot/' + pyynto_lainassa_id + '/tilaukset')
				.send(tilaus)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.should.have.property('_id');
					tilaus2_id = res.body._id;
					done();
				});

		});
	});

	describe('/POST tilaukset', () => {
		it('tilauksen olemattomalle pyynnolle pitää epäonnistua', (done) => {
			let tilaus = {
				info: "Tilaus olemattomalle pyynnölle",
				kirjasto_id: kirjasto_id,
				kirjaston_nimi: "Testikirjasto 1",
				viesti: "Tämä pitää epäonnistua"
			};
			chai.request(url)
				.post('/pyynnot/0000/tilaukset')
				.send(tilaus)
				.end((err, res) => {
					res.should.have.status(500);
					done();
				});

		});
	});

	describe('/POST tilaukset', () => {
		it('tilauksen olemattomalle kirjastolle pitää epäonnistua', (done) => {
			let tilaus = {
				info: "Tilaus olemattomalle pyynnölle",
				kirjasto_id: '0000',
				kirjaston_nimi: "Minua ei ole",
				viesti: "Tämä pitää epäonnistua"
			};
			chai.request(url)
				.post('/pyynnot/' + pyynto_tilattu_id + '/tilaukset')
				.send(tilaus)
				.end((err, res) => {
					res.should.have.status(500);
					done();
				});

		});
	});

	describe('/PUT tilaukset/arrived', () => {
		it('pitää merkitä tilaus saapuneeksi', (done) => {
			let tilaus = {
				erapaiva: "2021-12-22",
				status: "saapunut"
			};
			chai.request(url)
				.put('/pyynnot/' + pyynto_lainassa_id + '/tilaukset/' + tilaus2_id + "/arrived")
				.send(tilaus)
				.end((err, res) => {
					console.log(tilaus1_id)
					res.should.have.status(200);
					done();
				});

		});
	});

	describe('/GET pyynnot', () => {
		it('pyynnön pitää olla tilassa "lainassa"', (done) => {
			chai.request(url)
				.get('/pyynnot/' + pyynto_lainassa_id)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					console.log(res.body)
					chai.expect(res.body).to.have.property("status", "lainassa");
					chai.expect(res.body.tilaus_saatu).to.have.property("pvm_erapaiva");
					done();
				});
		});
	});
});


describe('Lainat', () => {



	describe('/PUT pyynnot', () => {
		it('yrittää asettaa epäkelvon eräpäivän', (done) => {
			let tilaus = {
				"due_date": "12-12ddsssssb.s2024"
			};
			chai.request(url)
				.put('/pyynnot/' + pyynto_lainassa_id + '/due_date')
				.send(tilaus)
				.end((err, res) => {
					res.should.have.status(500);
					done();
				});

		});
	});


});
