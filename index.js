const Koa			= require('koa');
const Router		= require('koa-router');
const bodyParser	= require('koa-body');
const json			= require('koa-json')

const fs 			= require('fs').promises;
const fss 			= require('fs')
var debug 			= require('debug')('debug');
const winston 		= require('winston');
const nodemailer 	= require('nodemailer')
const mongoose 		= require('mongoose');

//const EventEmitter 	= require('events');

//var eventEmitter 	= new EventEmitter();

// TERMS
// loan requests = pyynnot
// loan orders = tilaukset


const establishMongoConnection = async (uri, options) => {
	try {
		await mongoose.connect(
			uri, options
		);
		console.log(uri + ' connection OK')
	} catch (error) {
		console.log(error);
	}
};

(async () => {
	try {
		await loadConfig()
		await initDB()

	} catch (e) {
		console.log('Could not load config.json or database, aborting...');
		console.log(e);
		process.exit(1);
	}
})();

const initDB = async() => {
	try {
		var message = new Message({_id: "tilaussaate: suomi", "saate":"Tilaisimme teoksen [[FI]] jne."});
		var resp = await message.save()
	} catch(e) {
		console.log('saate jo luotu...')
	}
	try {
		message = new Message({_id: "tilaussaate: englanti", "saate":"We order [[EN]] jne."});
		resp = await message.save()
	} catch(e) {
		console.log('saate jo luotu...')
	}
	try {	
		message = new Message({_id: "asiakas: lomakevahvistus", "saate":"Kiitos yhteydenotosta, tilauksesi on vastaanotettu. Otamme sinuun tarvittaessa yhteyttä." });
		resp = await message.save()
	} catch(e) {
		console.log('saate jo luotu...')
	}
	try {
		message = new Message({_id: "asiakas: peruutusviesti", "saate":"Hyvä asiakkaamme, Tilauksesi aineistoon [[FI]] on käsitelty, mutta se on peruttu. Perumisen syy: "});
		resp = await message.save()
	} catch(e) {
		console.log('saate jo luotu...')
	}
	try {	
		message = new Message({_id: "asiakas: saapumisilmoitus", "saate":"Tilaamasi kaukolaina on saapunut ja on noudettavissa"});
		resp = await message.save()
	} catch(e) {
		console.log('saate jo luotu...')
	}
	try {
		message = new Message({_id: "asiakas: karhu", "saate":"Pyydämme palauttamaan erääntyneen kaukolainasi. Eräpäivä: [[ERAPAIVA]] [[FI]] "});
		resp = await message.save()
	} catch(e) {
		console.log('saate jo luotu...')
	}
	try {
		message = new Message({_id: "uusimispyyntö: suomi", "saate":"Haluaisimme uusia ..."});
		resp = await message.save()
	} catch(e) {
		console.log('saate jo luotu...')
	}
	try {	
		message = new Message({_id: "uusimispyyntö: englanti", "saate":"Could you please renew the following loan [[ID]] [[EN]] Kind regards,"});
		resp = await message.save()
	} catch(e) {
		console.log('saate jo luotu...')
	}

}

const organisationSchema = new mongoose.Schema(
	{
		nimi: { type: String, required: true },
		kustannuspaikka: String,
		huomio: String
	},
	{collection: 'organisaatiot'}
);

const librarySchema = new mongoose.Schema(
	{
		nimi: { type: String, required: true, index: true },
		lyhenne: {type: String, default: '-'},
		osoite: String,
		email: String,
		huomio: String,
		lomake: String,
		puhelin: String,
		kotisivut: String
	},
	{collection: 'kirjastot'}
);

const messageSchema = new mongoose.Schema(
	{
		_id: { type: String, required: true},
		saate: String
	},
	{collection: 'saatteet'}
);

const orderSchema = new mongoose.Schema(
	{
		kirjaston_nimi: { type: String, required: true, index: true },
		kirjasto_id: { type: mongoose.Types.ObjectId, required: true },
		viesti: { type: String },
		status: String,
		pvm_saapunut: Date,
		pvm_palautettu: Date,
		pvm_erapaiva: { type: Date, index: true},
		uusittavissa: {type: String, default: 'yes'},
		info: String,
		maksu: String,
		message_id: String
	}
);

const requestSchema = new mongoose.Schema(
	{
		asiakastyyppi: { type: String, required: true },
		hankintaehdotus_vai_kaukolainapyynto: String,
		etunimi: String,
		hintakatto: String,
		huomautuksia: String,
		laitos: String,
		kustannuspaikka: String,
		maksaja: { type: String, required: true },
		maksaja_info: String,
		maksaja_varmistettu: {type: mongoose.Types.ObjectId, ref:'organisaatio'},
		mista_loysit_julkaisun_tiedot: String,
		projekti: String,
		status: { type: String, required: true, default: 'uusi' },
		tilaaja: { type: mongoose.Types.ObjectId, ref: 'asiakas' },
		tilaajan_sahkoposti: { type: String, required: true},
		pyynto_pvm: { type: String, required: true },
		tilaukset: [orderSchema],
		tilaus_saatu: orderSchema,
		teos_on: String,
		teoksen_tiedot: {type: String, index: true},
		julkaisun_tiedot: String,
		sivut: String,
		sukunimi: String,
		tarvitaan_viimeistaan: String,
		kirjastokortin_numero: String,
		kasittelija: String,
		karhut: Array,
		_id: { type: String, required: true }
	},
	{collection: 'pyynnot'}
);

const clientSchema = new mongoose.Schema(
	{
		sahkoposti: { type: Array, required: true, index: true },
		sukunimi: String,
		etunimi: String,
		kirjastokortin_numero: String,
		huomio: String,
		ulkopuolinen: Boolean,
		puhelin: String,
		osoite: String
	},
	{collection: 'asiakkaat'}
);

clientSchema.index({sukunimi: 'text', etunimi: 'text', sahkoposti: 'text'});
organisationSchema.index({nimi: 'text', huomio: 'text'});
librarySchema.index({nimi: 'text', osoite: 'text', lyhenne: 'text'});
requestSchema.index({
	teoksen_tiedot: 'text',
	julkaisun_tiedot: 'text',
	tilaajan_sahkoposti: 'text',
	sukunimi: 'text',
	huomautuksia: 'text'
});

const Organisation = mongoose.model('organisaatio', organisationSchema);
const Library = mongoose.model('kirjasto', librarySchema);
const Client = mongoose.model('asiakas', clientSchema);
const Message = mongoose.model('saate', messageSchema);
const LoanRequest = mongoose.model('pyynto', requestSchema);
const LoanOrder = mongoose.model('tilaus', orderSchema);



var app				= new Koa();
var router			= new Router();
let config;
let db;



// EMAIL
const transport = {
	host: "smtp.jyu.fi",
	port:25,
	secure:false,
	tls: { minVersion: 'TLSv1' }
}
const transporter = nodemailer.createTransport(transport)

// LOGGING
require('winston-daily-rotate-file');

var rotatedLog = new (winston.transports.DailyRotateFile)({
	filename: 'logs/weskari-%DATE%.log',
	datePattern: 'YYYY-MM',
	zippedArchive: false,
	maxSize: '20m'
});

const logger = winston.createLogger({
	format: winston.format.combine(
		winston.format.timestamp(),
		winston.format.prettyPrint()
	),
	transports: [
		new winston.transports.Console(),
		rotatedLog
	]
});
logger.info('Weskari started');
// LOGGING ENDS


//Set up body parsing middleware
app.use(bodyParser({
	multipart: true,
	urlencoded: true
}));


app.use(json({ pretty: true, param: 'pretty' }))
app.use(require('koa-static')('public'));

// check that user has rights to use app
app.use(async function handleError(context, next) {
	if(process.env.DEV) context.request.headers.mail = 'ari.hayrinen@jyu.fi'; // for testing
	if(context.path === '/api/pyynnot' && context.method === 'POST') {
		await next()
	} else if(config.users.includes(context.request.headers.mail)) {
		await next();
	} else {
		logger.error('access denied for user: ' + context.request.headers.mail)
		context.status = 403
		context.body = {'error': 'Sinulla ei ole oikeuksia Weskarin käyttöön.'};
	}
});


// catch errors in routes
app.use(async function handleError(context, next) {

	try {
		await next();
	} catch (error) {
		context.status = 500;
		var error_msg = error
		if(error.status) context.status = error.status
		if(error.message) error_msg = error.message

		logger.error({
			user:context.request.headers.mail,
			message: error_msg,
			params: context.params,
			path: context.path,
			body: context.request.body,
			error: error
		});
		context.body = {'error':error_msg};

		debug(error.stack);
	}
});

// async function setDefaultResponse (ctx, next) {
//     await next();

//     if (!ctx.body) {
// 		const stream = fss.createReadStream(path.join(__dirname, '/public', 'index.html'))
// 		ctx.type = 'text/html; charset=utf-8'
// 		ctx.body = stream
//     }
// };

// app.use(setDefaultResponse)






/********************* ROUTES *************************/
router.get('/api/config', function (ctx) {
	ctx.body = {
		users: config.users
	};
});


router.post('/api/config/reload', async function (ctx) {
	await loadConfig();
	ctx.body = {'status': 'Config loaded'};
})


router.get('/api/auth', function (ctx) {
	ctx.body = {
		shibboleth: {user:ctx.request.headers.mail}
	};
});


router.get('/api/pyynnot', async function (ctx) {
	var q = createQuery(ctx)
	debug(q)
	var p = await LoanRequest.find(q.query).sort(q.sort).populate('tilaaja').exec()
	ctx.body = p;
});


router.get('/api/pyynnot/overdue_loans', async function (ctx) {
	const fields = {
		teoksen_tiedot:1,
		tilaaja: 1,
		status: 1,
		"tilaus_saatu.pvm_erapaiva": 1,
		"tilaus_saatu.kirjaston_nimi": 1,
		"tilaus_saatu.info": 1
	}
	var resp = await LoanRequest.find({
		$and: [
			{"tilaus_saatu.pvm_erapaiva": {$lte: new Date()}},
			{"tilaus_saatu.status": "lainassa"}
		 ]
	 }, fields).sort({"tilaus_saatu.pvm_erapaiva":1}).populate('tilaaja').exec();
	ctx.body = resp
});


router.get('/api/pyynnot/coming_overdue_loans', async function (ctx) {
	const fields = {
		teoksen_tiedot:1,
		tilaaja: 1,
		status: 1,
		"tilaus_saatu.pvm_erapaiva": 1,
		"tilaus_saatu.kirjaston_nimi": 1,
		"tilaus_saatu.info": 1
	}
	var resp = await LoanRequest.find({
		$and: [
			{"tilaus_saatu.pvm_erapaiva": {$gte: new Date(), $lte: new Date(new Date().setDate(new Date().getDate()+30))}},
			{"tilaus_saatu.status": "lainassa"}
		 ]
	 }, fields).sort({"tilaus_saatu.pvm_erapaiva":1}).populate('tilaaja').exec();
	ctx.body = resp
});




router.get('/api/pyynnot/loan_count', async function (ctx) {

	const count = await LoanRequest.countDocuments({"status": "lainassa"}).exec();
	ctx.body = count
});


router.get('/api/pyynnot/:id', async function (ctx) {
	if(typeof ctx.params.id == "number") ctx.params.id = ctx.params.id.toString()
	const loan_request = await LoanRequest.findOne({_id: ctx.params.id}).populate('tilaaja').populate('maksaja_varmistettu').exec();
	if(!loan_request) throw({status: 404})
	ctx.body = loan_request;
});


router.post('/api/pyynnot', async function (ctx) {
	var external_client = false
	var body = getBody(ctx.request.body)
	var email = body.tilaajan_sahkoposti
	// mark request that was made behalf of external user
	if(config.users.includes(body.tilaajan_sahkoposti)) {
		body.tilaajan_sahkoposti =  '_external_' + body.tilaajan_sahkoposti
		external_client = true
	}

	// if there is no payer information, then assume that user pays himself
	if(!body.maksaja || body.maksaja == '') body.maksaja = 'asiakas'

	// find client
	var client = null
	var client_query = await Client.find({sahkoposti:body.tilaajan_sahkoposti}).exec()
	if(client_query.length == 0 && !external_client) {
		var client_data = {
			sahkoposti: [body.tilaajan_sahkoposti],
			sukunimi: body.sukunimi,
			etunimi: body.etunimi,
			kirjastokortin_numero: body.kirjastokortin_numero
		}
		client = new Client(client_data);
		await client.save()
	} else {
		client = client_query[0]
	}

	body.pyynto_pvm = getToday()
	body._id = await generateID(body.pyynto_pvm) // get daily counter
	const request = new LoanRequest(body);
	if(client) request.tilaaja = client._id
	else request.tilaaja = null
	// article has now more own field -> FIXAA LOMAKE
	if(body.teos_on === 'artikkeli') {
		if(body.maksaja && (body.maksaja == 'maksan_itse' || body.maksaja == 'maksan itse')) request.maksaja = 'asiakas'
		request.teoksen_tiedot = body.artikkelin_tiedot + '. ' + body.julkaisun_tiedot
		if(body.sivut) request.teoksen_tiedot = request.teoksen_tiedot + ', ' + body.sivut
		//request.artikkelin_tiedot = null
		//request.julkaisun_tiedot = null
	}
	let error = request.validateSync();
	if(error) throw({message:'Tietojen validointi epäonnistui:' + error, status: 422})
	var resp = await request.save()

	if(!process.env.DEV) { // do not send emails on local testing
		var note = ''
		var message = await Message.findOne({_id:'asiakas: lomakevahvistus'}).exec()
		if(message) {
			note = message.saate.replace(/\[\[ID\]\]/g, 'ID: ' + request._id)
			note = note.replace('[[FI]]', getItemInfoText(request, 'fi'))
			note = note.replace('[[EN]]', getItemInfoText(request, 'en'))
		} else {
			note = getItemInfoText(request, 'fi')
		}
		if(email) {
			await sendMail( email, 'kaukolainapyyntösi / Your Interlibrary Loan Request', note)
		} else {
			throw("Sähköpostia ei ole määritelty")
		}
	}

	ctx.body = resp
});


router.put('/api/pyynnot/:id', async function (ctx) {
	var update = getBody(ctx.request.body)
	var resp = await LoanRequest.updateOne({ _id: ctx.params.id }, update,  { runValidators: true });
	ctx.body = resp
});


router.post('/api/pyynnot/:id/karhu', async function (ctx) {
	if(typeof ctx.params.id == "number") ctx.params.id = ctx.params.id.toString()
	const loan_request = await LoanRequest.findOne({_id: ctx.params.id}).populate('tilaaja').exec();

	var body = getBody(ctx.request.body)
	if(loan_request.tilaaja.sahkoposti && body.notice) {
		await sendMail( loan_request.tilaaja.sahkoposti, 'erääntynyt laina / Overdue Notice', body.notice)
	} else {
		throw("Tilaajalla ei ole sähköpostiosoitetta (tai saate on tyhjä)!")
	}

	loan_request.karhut.push(getToday())
	loan_request.save()
	ctx.body = loan_request.karhut
});


router.get('/api/asiakkaat', async function (ctx) {
	var q = createQuery(ctx)
	console.log(q)
	var p = await Client.find(q.query).sort(q.sort).exec()
	ctx.body = p;
});


router.get('/api/kirjastot', async function (ctx) {
	var q = createQuery(ctx)
	var p = await Library.find(q.query).sort(q.sort).exec()
	ctx.body = p;
});



router.get('/api/organisaatiot', async function (ctx) {
	var q = createQuery(ctx)
	var p = await Organisation.find(q.query).sort(q.sort).exec()
	ctx.body = p;
});


router.get('/api/organisaatiot/:id', async function (ctx) {
	const organisation = await Organisation.findOne({_id: ctx.params.id}).exec();
	ctx.body = organisation;
});


router.get('/api/saatteet', async function (ctx) {
	var q = createQuery(ctx)
	debug(q)
	var p = await Message.find(q.query).sort(q.sort).exec()
	ctx.body = p;
});


router.get('/api/saatteet/:id', async function (ctx) {
	const message = await Message.findOne({_id: ctx.params.id}).exec();
	ctx.body = message;
});


router.post('/api/saatteet', async function (ctx) {
	const message = new Message(getBody(ctx.request.body));
	let error = message.validateSync();
	if(error) throw({message:'Tietojen validointi epäonnistui. ' + error._message, status: 422})
	var resp = await message.save()
	ctx.body = resp
});


router.put('/api/saatteet/:id', async function (ctx) {
	var update = getBody(ctx.request.body)
	var resp = await Message.updateOne({ _id: ctx.params.id }, update);
	ctx.body = resp
});


router.get('/api/asiakkaat/:id', async function (ctx) {
	const client = await Client.findOne({_id: ctx.params.id}).exec();
	ctx.body = client;
});

router.delete('/api/asiakkaat/:id', async function (ctx) {
	const query = { tilaaja: ctx.params.id }
	const requests = await LoanRequest.find(query).exec();
	var active = requests.some(obj => obj.status === "lainassa" || obj.status === "tilattu" || obj.status === "kasittelyssa" || obj.status === "uusi");
	if(!active) {
		try {
			const loans = await LoanRequest.find(query).remove().exec();
			const client = await Client.deleteOne({_id: ctx.params.id}).exec();
			ctx.body = client;
		} catch (e) {
			console.log(e.message)
			ctx.status = 500
			ctx.body = {error: e.message}
		}

	} else {
		ctx.status = 409
		ctx.body = {error: 'asiakkaalla on aktiivia lainoja/pyyntöjä'}
	}

});


router.get('/api/tilastot/:year', async function (ctx) {
	var year = parseInt(ctx.params.year)
	const stats = await LoanRequest.aggregate([
		{
		  $project: {
			year: { $year: "$tilaus_saatu.pvm_saapunut" },
			kirjaston_nimi: "$tilaus_saatu.kirjaston_nimi",
			kirjasto_id: "$tilaus_saatu.kirjasto_id"
		  }
		},
		{
			$match: {
			  year: { $in: [year-1, year] }
			}
		  },
		{
		  $group: {
			_id: { year: "$year", kirjasto_id: "$kirjasto_id" },
			count: { $sum: 1 },
			kirjaston_nimi: { $first: "$kirjaston_nimi" }
		  }
		},
		{
		  $project: {
			_id: 0,
			year: "$_id.year",
			kirjasto_id: "$_id.kirjasto_id",
			kirjaston_nimi: 1,
			count: 1
		  }
		},
		{
		  $sort: { year: -1, count: -1 }
		}
	  ]).exec();
	ctx.body = stats;
});


router.get('/api/kirjastot/:id', async function (ctx) {
	const library = await Library.findOne({_id: ctx.params.id}).exec();
	if(!library) ctx.body = {no:1}
	else ctx.body = library;
});

router.get('/api/kirjastot/:id/loans', async function (ctx) {
	const fields = {
		teoksen_tiedot:1,
		tilaaja: 1,
		status: 1,
		"tilaus_saatu.pvm_erapaiva": 1,
		"tilaus_saatu.kirjasto_id": 1,
		"tilaus_saatu.info": 1
	}
	console.log(ctx.params.id)
	var status = 'lainassa'
	if(ctx.request.query.status) {
		if(['arkistoitu'].includes(ctx.request.query.status))
			status = ctx.request.query.status
	}
	var resp = await LoanRequest.find({
		$and: [
			{"tilaus_saatu.kirjasto_id": ctx.params.id},
			{"status": status}
		 ]
	 }, fields).sort({"tilaus_saatu.pvm_erapaiva":-1}).populate('tilaaja').exec();
	ctx.body = resp
});

router.post('/api/asiakkaat', async function (ctx) {
	const client = new Client(getBody(ctx.request.body));
	let error = client.validateSync();
	if(error) throw({message:'Tietojen validointi epäonnistui. ' + error._message, status: 422})
	var resp = await client.save()
	ctx.body = resp
});


router.put('/api/asiakkaat/:id', async function (ctx) {
	var update = getBody(ctx.request.body)
	var resp = await Client.updateOne({ _id: ctx.params.id }, update);
	ctx.body = resp
});


router.post('/api/organisaatiot', async function (ctx) {
	const org = new Organisation(getBody(ctx.request.body));
	//org._id = await createID('organisation')
	let error = org.validateSync();
	if(error) throw({message:'Tietojen validointi epäonnistui:' + error._message, status: 422})
	var resp = await org.save()
	ctx.body = resp
});


router.put('/api/organisaatiot/:id', async function (ctx) {
	var update = getBody(ctx.request.body)
	var resp = await Organisation.updateOne({ _id: ctx.params.id }, update);
	ctx.body = resp
});


// end point for updating due date
router.put('/api/pyynnot/:pyynto/due_date', async function (ctx) {
	var loan_request = await LoanRequest.findOne({ _id: ctx.params.pyynto }).exec()
	if(loan_request && loan_request.tilaus_saatu && isValidDate(ctx.request.body.due_date)) {
		loan_request.status = 'lainassa'
		loan_request.tilaus_saatu.status = 'lainassa'
		loan_request.tilaus_saatu.pvm_erapaiva = ctx.request.body.due_date
		loan_request.tilaus_saatu.uusittavissa = ctx.request.body.uusittavissa
		loan_request.tilaus_saatu.info = ctx.request.body.info
		const resp = await loan_request.save()
		ctx.body = resp
	} else {
		throw('Eräpäivän asettaminen epäonnistui: ' + ctx.request.body.due_date)
	}
});


// end point for marking order as returned
router.put('/api/pyynnot/:pyynto/returned', async function (ctx) {
	var loan_request = await LoanRequest.findOne({ _id: ctx.params.pyynto }).exec()
	if(loan_request && loan_request.tilaus_saatu) {
		loan_request.tilaus_saatu.status = 'palautettu'
		loan_request.tilaus_saatu.pvm_palautettu = Date.now()
		// set status for loan loan_request to 'arkistoitu' (archived)
		loan_request.status = 'arkistoitu'
		const resp = await loan_request.save()
		ctx.body = resp
	} else {
		throw('Tilauksen päivittäminen epäonnistui')
	}
});


router.post('/api/pyynnot/:pyynto/tilaukset', async function (ctx) {
	var body = getBody(ctx.request.body)
	// check that there is a loan request and it is not archived
	const loan_request = await LoanRequest.findOne({_id: ctx.params.pyynto}).exec();
	if(!loan_request || loan_request.status === 'arkistoitu') {
		logger.error('Pyyntöä ei löytynyt tai pyynnölle ei voi tehdä tilauksia:' + ctx.params.pyynto )
		throw('Pyyntöä ei löytynyt tai pyynnölle ei voi tehdä tilauksia:' + ctx.params.pyynto )
	}

	const library = await Library.findOne({_id: body.kirjasto_id}).exec();
	if(!library) {
		throw('Kirjastoa ei löytynyt:' + body.kirjasto_id )
	}

	const order = new LoanOrder(body);
	order.status = 'tilattu'
	order.kirjaston_nimi = `${library.nimi} (${library.lyhenne})`
	loan_request.tilaukset.push(order);

	let error = loan_request.validateSync();
	if(error) throw({message:'Tietojen validointi epäonnistui:' + error._message, status: 422})
	loan_request.status = 'tilattu'


	// SEND MAIL
	if(config.db !== 'local' && !process.env.DEV && body.send_mail == 'yes') { // do not send emails on local testing or if explicitly denied
		if(library.email && order.viesti) {
			var subject = 'kaukolainapyyntö'
			if(order.message_id == 'tilaussaate: englanti') subject = 'Interlibrary Loan Request'
			await sendMail( library.email, subject, order.viesti, 'kaukopal@library.jyu.fi')
		} else {
			throw("Sähköpostia ei ole määritelty")
		}
	} else {
		console.log('Not sending mails on local development')
	}

	var resp = await loan_request.save()

	ctx.body = order
});


// end point for marking order as arrived
router.put('/api/pyynnot/:pyynto/tilaukset/:id/arrived', async function (ctx) {
	var loan_request = await LoanRequest.findOne({ _id: ctx.params.pyynto }).populate('tilaaja').exec()
	var update = getBody(ctx.request.body)
	loan_request.tilaus_saatu = loan_request.tilaukset.id(ctx.params.id)
	loan_request.tilaus_saatu.pvm_saapunut = Date.now()
	loan_request.tilaus_saatu.maksu = update.maksu
	// set status for loan loan_request to 'lainassa' (in loan)
	if(loan_request.teos_on === 'kirja') {
		loan_request.tilaus_saatu.status = 'lainassa'
		loan_request.tilaus_saatu.pvm_erapaiva = update.erapaiva
		loan_request.status = loan_request.tilaus_saatu.status
		loan_request.validateSync()
	} else if(loan_request.teos_on === 'artikkeli') {
		loan_request.tilaus_saatu.status = 'arkistoitu'
		loan_request.status = 'arkistoitu'
	}
	// remove order from order list
	await loan_request.tilaukset.pull({ _id: ctx.params.id });

	// SEND MAIL
	if(update.laheta_saapumisilmoitus == 'yes') {
		var message = await Message.findOne({_id:'asiakas: saapumisilmoitus'}).exec()
		if(!message) throw('saapumisilmoitussaatetta ei löytynyt')
		var viesti = message.saate.replace(/\[\[ID\]\]/g, 'ID: ' + loan_request._id)
		viesti = viesti.replace('[[FI]]', getItemInfoText(loan_request, 'fi'))
		viesti = viesti.replace('[[EN]]', getItemInfoText(loan_request, 'en'))
		viesti = viesti.replace(/\[\[ERAPAIVA\]\]/g, formatDate(loan_request.tilaus_saatu.pvm_erapaiva, 'reverse', '.'))
		// do not send emails on local testing
		if(config.db === 'local') {
			console.log(viesti) // for development purposes
		} else if(loan_request.tilaaja) {
			await sendMail( loan_request.tilaaja.sahkoposti, 'saapumisilmoitus/notice of arrival', viesti)
		} else {
			throw("sähköpostin lähettäminen epäonnistui")
		}
	} else {
		console.log('en lähetä saapumisilmoitusta')
	}

	const resp = await loan_request.save()

	ctx.body = resp
});


router.put('/api/pyynnot/:pyynto/tilaukset/:id/not_available', async function (ctx) {
	var loan_request = await LoanRequest.findOne({ _id: ctx.params.pyynto }).exec()
	var order = loan_request.tilaukset.id(ctx.params.id)
	// we must set loan_request status according to order.status
	var tilatut = loan_request.tilaukset.filter(tilaus => tilaus.status == 'tilattu')
	if(tilatut.length > 1) loan_request.status = 'tilattu'
	else loan_request.status = 'kasittelyssa'

	order.status = 'ei_saatavilla'
	const resp = await loan_request.save()
	ctx.body = resp
});


router.put('/api/pyynnot/:pyynto/cancelled', async function (ctx) {
	var update = getBody(ctx.request.body)
	var loan_request = await LoanRequest.findOne({ _id: ctx.params.pyynto }).populate('tilaaja').exec()
	loan_request.status = 'peruttu'
	loan_request.pvm_peruttu = Date.now()
	loan_request.peruutuksen_syy = update.peruutuksen_syy
	const resp = await loan_request.save()

	// SEND MAIL
	if(config.db !== 'local' && update.laheta_peruutusilmoitus === 'yes') { // do not send emails on local testing
		if(loan_request.tilaaja.sahkoposti) {
			await sendMail( loan_request.tilaaja.sahkoposti, 'kaukolainapyynnön peruminen / Cancellation of Your Interlibrary Loan Request', update.peruutuksen_syy)
		} else {
			logger.error('Peruutusviestin vastaanottajalla ei ole sähköpostiosoitetta! ')
			//throw('Tilaajalla ei ole sähköpostiosoitetta!')
		}
	}
	ctx.body = resp
});


router.put('/api/pyynnot/:pyynto/tilaukset/:id', async function (ctx) {
	var loan_request = await LoanRequest.findOne({ _id: ctx.params.pyynto }).exec()
	var order = loan_request.tilaukset.id(ctx.params.id)
	var update = getBody(ctx.request.body)
	order.set(update)
	const resp = await loan_request.save()
	ctx.body = resp
});


router.post('/api/kirjastot', async function (ctx) {
	const library = new Library(getBody(ctx.request.body));
	let error = library.validateSync();
	if(error) throw({message:'Tietojen validointi epäonnistui:' + error._message, status: 422})
	var resp = await library.save()
	ctx.body = resp
});


router.put('/api/kirjastot/:id', async function (ctx) {
	var update = getBody(ctx.request.body)
	var resp = await Library.updateOne({ _id: ctx.params.id }, update);
	ctx.body = resp
});

router.delete('/api/kirjastot/:id', async function (ctx) {

	const query = { "tilaus_saatu.kirjasto_id": ctx.params.id }
	var requests = await LoanRequest.find(query).exec()

	var active = requests.some(obj => obj.status === "lainassa");
	if(!active) {
		try {
			const loans = await LoanRequest.find(query).remove().exec();
			const client = await Library.deleteOne({_id: ctx.params.id}).exec();
			ctx.body = client;
		} catch (e) {
			console.log(e.message)
			ctx.status = 500
			ctx.body = {error: e.message}
		}

	} else {
		ctx.status = 409
		ctx.body = {error: 'kirjastolla on aktiivia lainoja/pyyntöjä'}
	}

});



/********************* ROUTES END *************************/

function getBody(body) {
	if(typeof body === 'string') return JSON.parse(body)
	else return body
}


async function generateID(date) {

	var count = await LoanRequest.find({"pyynto_pvm": date}).exec()
	return date + '_' + (count.length + 1)
}

function isValidDate(s) {
	// Assumes s is "yyyy-dd-mm"
	if ( ! /^\d\d\d\d\-\d\d\-\d\d$/.test(s) ) {
		return false;
	}
	const parts = s.split('-').map((p) => parseInt(p, 10));
	parts[1] -= 1;
	const d = new Date(parts[0], parts[1], parts[2]);
	return d.getMonth() === parts[1] && d.getDate() === parts[2] && d.getFullYear() === parts[0];
}

function getDate(uuid) {
	var date = new Date( parseInt( uuid.substring(0,8), 16 ) * 1000 )
	var formatted = new Intl.DateTimeFormat('fi-FI').format(date);
	return formatted
}

function formatDate(date, reverse, comb) {
	if(!comb) comb = '.'
	var out = []
	if(date) {
		var d = new Date(date)
		if(d instanceof Date && isFinite(d)) {
			out.push(d.getFullYear())
			out.push((d.getMonth() + 1).toString().padStart(2, "0"))
			out.push(d.getDate().toString().padStart(2, "0"))
			if(reverse) return out.reverse().join(comb)
			else return out.join(comb)
		} else {
			return date
		}
	} else {
		return '-'
	}
}

function getToday() {
	var today = new Date();
	return (today.getFullYear() + '.' + ('0' + (today.getMonth()+1)).slice(-2) + '.' + ('0' + (today.getDate())).slice(-2));
}


async function loadConfig() {
	console.log('Lataan config -tiedostoa')
	const file = await fs.readFile('./config.json', 'utf8');
	config = JSON.parse(file);

	var options = {}
	var uri = ''
	var db_name = 'weskari'

	if(process.env.DB) config.db = process.env.DB;
	if(process.env.DB_NAME) db_name = process.env.DB_NAME;
	if(process.env.MAILER) config.mailer = process.env.MAILER;
	
	var connection_string = ''
	if(config.db === 'local') {
		uri = `mongodb://127.0.0.1:27017/${db_name}`;
		options = {
			useNewUrlParser: true
		}
	} else if(config.db === 'docker') {
		uri = `mongodb://${process.env.DB_URL}:27017/${db_name}`;
		options = {
			useNewUrlParser: true
		}
	} else if (config.db === 'remote') {
		uri = `mongodb://${process.env.DB_URL}:27017/${process.env.DB_NAME}`
		options = {
			useNewUrlParser: true,
			ssl: true,
			sslValidate: false,
			useUnifiedTopology: true,
			user: process.env.DB_USER,
			pass: process.env.DB_PASSWORD,
			authSource: process.env.DB_NAME
	  }
	}
	console.log(uri)
	debug(uri)
	console.log('connecting to mongo...')
	await establishMongoConnection(uri, options)
	console.log('Done')
}

async function sendMSGraphMail(email, subject, message, replyto) {
	// auth
	const {default: got} = await import('got')

	var auth_url = "https://login.microsoftonline.com/e9662d58-caa4-4bc1-b138-c8b1acab5a11/oauth2/v2.0/token"

	const data = await got.post(auth_url, {
		form: {
				grant_type: 'client_credentials',
				client_id: process.env.MS_CLIENT_ID,
				client_secret: process.env.MS_CLIENT_SECRET,
				scope: 'https://graph.microsoft.com/.default',
				grant_type: 'client_credentials'
		}
	}).json();

	const mail = {

	    "message": {
	        "subject": subject,
	        "body": {
	            "contentType": "Text",
	            "content": message
	        },
	        "toRecipients": [
	            {
	                "emailAddress": {
	                    "address": email
	                }
	            }
	        ]
	    }
	}

	if(Array.isArray(email)) {
		var recipients = []
		for(var address of email) {
			recipients.push({emailAddress: {address: address}})
		}
		mail.message.toRecipients = recipients
	}

	if(replyto) {
		mail.message.replyTo =  [
			{
				"emailAddress": {
					"address": replyto
				}
			}
		]
	}



	const sendmail_url = 'https://graph.microsoft.com/v1.0/users/a7aa2738-bf7f-4149-9ed4-92f49272797b/sendMail'


	const sent = await got.post(sendmail_url, {
		json: mail,
		hooks: {
			beforeRequest: [
				opts => {
					opts.headers['Authorization'] = 'Bearer ' + data.access_token;
				}
			]
		}
	}).json()


}

async function sendMail(email, subject, message, replyto) {
	if(config.db !== 'local') {  // do not try to send posts in local development
		if(config.mailer === 'ms-graph') {
			console.log('Sending mail via MS-graph')
			await sendMSGraphMail(email, subject, message, replyto)
		} else if(config.mailer === 'smtp') {
			var address = email
			if(Array.isArray(email)) address = email.join(', ')
			try {
				const mail = {
					from: config.smtp_from,
					to: address,
					subject: subject,
					text: message
				}
				if(replyto) mail.replyTo = replyto
				let sentmail = await transporter.sendMail(mail)
			} catch(e) {
				logger.error(e)
				throw('Sähköpostin lähettäminen epäonnistui')
			}
		} else {
			throw('Sähköpostiasetuksia ei ole määritelty!')
		}
	}
}


function getItemInfoText(request, lang) {

	var lang_info = {
		'teoksen_tiedot': {'en':'title', 'fi': 'teos'},
		'sivut': {'en':'pages', 'fi': 'sivut'},
		'julkaisun_tiedot': {'en': 'publication', 'fi': 'julkaisu'}
	}

	if(request.teos_on == 'kirja') {
		return lang_info['teoksen_tiedot'][lang] + ': ' + request.teoksen_tiedot
	} else {
		var line = lang_info['teoksen_tiedot'][lang] + ': ' + request.teoksen_tiedot
		line += '\n' + lang_info['julkaisun_tiedot'][lang] + ': ' + request.julkaisun_tiedot
		if ( request.sivut) line += '\n' + lang_info['sivut'][lang] + ': ' + request.sivut
		return line
	}
}


function createQuery(ctx) {
	var q = {query: {}, keys: {}, sort: {}, limit: 1000, skip: 0}
	var regex = new RegExp(["^", ctx.query.value].join(""), "i");
	var excludes = ['sort', 'limit', 'skip', 'keys', 'reverse', 'search']

	for(var p in ctx.request.query) {
		if(!excludes.includes(p)) {
			// by default we use regex
			if(ctx.request.query[p].includes('*')) {
				var regex = new RegExp(["^", ctx.request.query[p]].join("").replace('*',''), "i");
				q.query[p] = {$regex: regex}
			} else {
				q.query[p] = ctx.request.query[p]
			}
		}
	}

	if(ctx.request.query.keys) {
		var splitted = ctx.request.query.keys.split(',');
		for(var key of splitted) {
			q.keys[key.trim()] = 1;
		}
	}

	if(ctx.request.query.search) q.query['$text'] =  { $search: ctx.request.query.search };
	if(ctx.request.query.sort) q.sort[ctx.request.query.sort] = 1;
	if(ctx.request.query.reverse) q.sort[ctx.request.query.sort] = -1;
	if(ctx.request.query.limit) q.limit = parseInt(ctx.request.query.limit);
	if(ctx.request.query.skip) q.skip = parseInt(ctx.request.query.skip);
	return q;
}

app.use(router.routes());

var set_port = process.env.PORT || 8103
var server = app.listen(set_port, function () {
   var host = server.address().address
   var port = server.address().port

   console.log('Weskari käynnissä osoitteessa http://%s:%s', host, port)
})
