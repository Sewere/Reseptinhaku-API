const express = require('express');
const app = express();
const db = require('./database.js');
const validUrl = require('valid-url');
const body_parser = require('body-parser');
const cors = require('cors');

app.use(body_parser.json()); // for parsing application/json
app.use(body_parser.urlencoded({urlencoded:true})); // for parsing application/x-www-form-urlencoded
app.use(cors());

//-----------------------REST-KÄSITTELYT---------------------
//---GET-Resepti-hakukriteerein--
app.get('/haku/', async function(req, res){
    //GET: http://localhost:8081/haku?erityis=laktoositon&aines=porkkana,peruna&rajaus=pieru
    let kysely = req.query;
    console.log("Koko kysely:");
    console.log(kysely);
    //---Hakusanojen taltiointi ja kyselyt----------
    const ainesLista = req.query["aines"];
    const rajausLista = req.query["rajaus"];
    const erityisLista = req.query["erityis"];

    let jsonKysely = kyselynMuodostus(ainesLista, rajausLista, erityisLista);
    let SQLtulos;
    try {
        SQLtulos = await db.getReseptiKriteerein(jsonKysely);
    } catch (err) {
        res.status(500).send("Tietokantaan ei saatu yhteyttä.");
    }
    console.log("SQL Hakutulokset:");
    console.log(SQLtulos);
    if (SQLtulos === undefined){
        res.status(400).send("Reseptejä ei löytynyt.");
    } else {
        res.send(SQLtulos);
    }
});
//GET kaikki reseptit
app.get('/haku/reseptit', async function(req, res){
    let SQLtulos;
    try {
        SQLtulos = await db.getReseptit();
    } catch (err) {
        res.status(500).send("Tietokantaan ei saatu yhteyttä.");
    }
    res.send(SQLtulos);
});
//GET kaikki ainekset
app.get('/haku/ainekset', async function(req, res){
    let SQLtulos;
    try {
        SQLtulos = await db.getAinekset(null);
    } catch (err) {
        res.status(500).send("Tietokantaan ei saatu yhteyttä.");
    }

    res.send(SQLtulos);
});
//POST lisää
app.post('/lisaa/', async function(req, res){
    let jsonPost = req.body;
    console.log(jsonPost);
    let tarkistettavaUrl = jsonPost.resepti.resepti;
    let veg = jsonPost.resepti.vegaaninen;
    let lak = jsonPost.resepti.laktoositon;
    let glut = jsonPost.resepti.gluteeniton;

    //Validoidaan reseptin url
    if (!validUrl.isUri(tarkistettavaUrl)){
        console.log("Reseptin url ei ole kelvollinen.");
        res.status(400).send("Reseptin url ei ole kelvollinen.");
    //varmistetaan, että erikoisruokavalioiden arvot ovat oikeassa muodossa.
    } else if ((veg!==0&&veg!==1)||(lak!==0&&lak!==1)||(glut!==0&&glut!==1)) {
        console.log("Erikoisruokavalion muoto väärä");
        res.status(400).send("Erityisruokavalioiden muoto ei kelpaa.");
    } else {
        let tulos;
        try {
            tulos = await db.createResepti(jsonPost);
        } catch (err) {
            res.status(500).send("Tietokantaan ei saatu yhteyttä.");
        }
        if(tulos){
            console.log("Resepti luotu tietokantaan!");
            res.send("Reseptin lisätty tietokantaan.");
        }
        else{
            console.log("Reseptin luonti epäonnistui.");
            res.status(400).send("Reseptin luonti epäonnistui");
        }
    }
});
//DELETE poista resepti
app.delete('/poista', async function(req, res){
    //DELETE: http://localhost:8081/poista?url=http://www.pieru.fi
    let kysely = req.query;
    console.log("Koko kysely:");
    console.log(kysely);
    const poistettava = req.query["url"];
    console.log(poistettava);

    let SQLtulos = await db.deleteResepti(poistettava);
    console.log("SQL Hakutulokset:");
    console.log(SQLtulos);
    if (SQLtulos == false){
        res.status(400).send("Reseptejä ei löytynyt.");
    } else {
        res.send("Resepti poistettu onnistuneesti!");
    }
});
//Ei sallitut tavat
app.all('/', function(req, res){
    res.status(404).send('Wrong endpoint!');
});
app.all('/lisaa/', function(req, res){
    res.status(405).send('Allowed methods: POST');
});
app.all('/haku/', function(req, res){
    res.status(405).send('Allowed methods: GET');
});
app.all('/haku/reseptit', function(req, res){
    res.status(405).send('Allowed methods: GET');
});
app.all('/haku/ainekset', function(req, res){
    res.status(405).send('Allowed methods: GET');
});
app.all('/poista', function(req, res){
    res.status(405).send('Allowed methods: DELETE');
});
var server = app.listen(8081, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log("Reseptinhaku-API listening at http://%s:%s", host, port);
});

//---Katotaan mitä hakukriteerejä löytyy ja yhdistetään niistä JSON tietokannalle
function kyselynMuodostus(ainesLista, rajausLista, erityisLista){
    let SQLhaku = "{";
    //AINESOSILLA
    if(ainesLista != null){
        console.log("Ainesosat: "+ainesLista);
        var lista = ainesLista.split(",");
        var nro = lista.length-1;
        SQLhaku += '"ainekset":[';
        for(var a in lista){
            SQLhaku += '"'+lista[a];
            if(a == nro){
                SQLhaku += '"], ';
            }
            else{
                SQLhaku += '",';
            }
        }
    }
    else{
        console.log("Ei aineksia valittu");
        SQLhaku += '"ainekset": null, ';
    }
    //RAJAAVAT AINESOSAT
    if(rajausLista != null){
        lista = rajausLista.split(",");
        nro = lista.length-1;
        SQLhaku += '"rajaukset":[';
        for(var e in lista){
            SQLhaku += '"'+lista[e];
            if(e == nro){
                SQLhaku += '"], ';
            }
            else{
                SQLhaku += '",';
            }
        }
        //{"ainekset":['porkkana'], "rajaukset":['pieru','sipuli'], "erityis":{"vegaaninen":0,"laktoositon":1, "gluteeniton":1}};
    }
    else{
        SQLhaku += '"rajaukset": null, ';
    }
    //ERITYISRUOKAVALIO
    if (erityisLista != null) {
        console.log("Erityisruokavalio: "+erityisLista);
        lista = erityisLista.split(",");
        SQLhaku += '"erityis":{';
        var vegaani = false, laktoositon = false, gluteeniton = false;
        //Tarkastetaan mitä erityisruokavalioita on valittu
        for(var i in lista){
            if(lista[i] == 'vegaaninen'){
                vegaani = true;}
            if(lista[i] == 'laktoositon'){
                laktoositon = true;}
            if(lista[i] == 'gluteeniton'){
                gluteeniton = true;}
        }
        if (vegaani){
            SQLhaku += '"vegaaninen":1,';
        }
        else{
            SQLhaku += '"vegaaninen":0,';
        }
        if (laktoositon){
            SQLhaku += '"laktoositon":1,';
        }
        else{
            SQLhaku += '"laktoositon":0,';
        }
        if (gluteeniton){
            SQLhaku += '"gluteeniton":1}}';
        }
        else{
            SQLhaku += '"gluteeniton":0}}';
        }
    }
    else{
        SQLhaku += '"erityis":{"vegaaninen":0,"laktoositon":0, "gluteeniton":0}}';
    }
    let jsonKysely = JSON.parse(SQLhaku);
    console.log("Hakukyselyn Jsonoitu muoto");
    console.log(jsonKysely);
    return jsonKysely;
}
