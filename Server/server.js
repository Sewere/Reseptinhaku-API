var express = require('express');
var app = express();
const db = require('./database.js');

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

//-----------------------REST-KÄSITTELYT---------------------
//---GET-Resepti-hakukriteerein--
app.get('/haku/', async function(req, res){
    //GET: http://localhost:8081/haku?erityis=laktoositon&aines=porkkana,peruna&rajaus=pieru
    let kysely = req.query;
    console.log("Koko kysely:");
    console.log(kysely);
    res.header("Access-Control-Allow-Origin", "*");
    //---Hakusanojen taltiointi ja kyselyt----------
    const ainesLista = req.query["aines"];
    const rajausLista = req.query["rajaus"];
    const erityisLista = req.query["erityis"];

    let jsonKysely = kyselynMuodostus(ainesLista, rajausLista, erityisLista);
    let SQLtulos = await db.getReseptiKriteerein(jsonKysely);
    console.log("SQL Hakutulokset:");
    res.send(SQLtulos);
});
//GET kaikki reseptit
app.get('/haku/reseptit', async function(req, res){
    res.header("Access-Control-Allow-Origin", "*");
    let SQLtulos = await db.getReseptit();
    res.send(SQLtulos);
});
//GET kaikki ainekset
app.get('/haku/ainekset', async function(req, res){
    res.header("Access-Control-Allow-Origin", "*");
    let SQLtulos = await db.getAinekset(null);
    res.send(SQLtulos);
});
//POST lisää
app.post('/lisaa/', async function(req, res){
    res.header("Access-Control-Allow-Origin", "*");
    let asd = req.body;
    console.log(asd);
    //console.log(asd.nimi);

    //let resepti = {"resepti":{"nimi":"perunatesti420", "resepti":"www.google.com/perunatesti420", "vegaaninen":1,"laktoositon":1, "gluteeniton":1,
    //"ainekset":["vesi'","peruna", "kivi", "sieni"]}};
    res.send("SSLSLSLSL");
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
                console.log("Vika listan jäsen")
                SQLhaku += '"], ';
            }
            else{
                SQLhaku += '",';
            }
        }
        console.log("SQL");
        console.log(SQLhaku);
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
        console.log("SQL");
        console.log(SQLhaku);
        //{"ainekset":['porkkana'], "rajaukset":['pieru','sipuli'], "erityis":{"vegaaninen":0,"laktoositon":1, "gluteeniton":1}};
    }
    else{
        SQLhaku += '"rajaukset": null, ';
        console.log(SQLhaku);
    }
    //ERITYISRUOKAVALIO
    if (erityisLista != null) {
        console.log("Erityisruokavalio: "+erityisLista);
        lista = erityisLista.split(",");
        SQLhaku += '"erityis":{';
        var veg = false, lak = false, glut = false;
        //Tarkastetaan mitä erityisruokavalioita on valittu
        for(var i in lista){
            if(lista[i] == 'vegaaninen'){
                veg = true;}
            if(lista[i] == 'laktoositon'){
                lak = true;}
            if(lista[i] == 'gluteeniton'){
                glut = true;}
        }
        SQLhaku += getErityisruokavalioText(veg, lak, glut);
    }
    else{
        SQLhaku += '"erityis":{"vegaaninen":0,"laktoositon":0, "gluteeniton":0}}';
        console.log(SQLhaku);
    }
    console.log("SQL-hakukyselyn viimeinen muoto ennen JSONointia");
    console.log(SQLhaku);
    var jsonKysely = JSON.parse(SQLhaku);
    console.log("Jsonoitu muoto");
    console.log(jsonKysely);
    return jsonKysely;
}
//Tää on täällä ettei tarttis enää nähdä tätä
function getErityisruokavalioText(vegaani, laktoositon, gluteeniton){
    let palaute = "";
    if (vegaani){
        palaute += '"vegaaninen":1,';
    }
    else{
        palaute += '"vegaaninen":0,';
    }
    if (laktoositon){
        palaute += '"laktoositon":1,';
    }
    else{
        palaute += '"laktoositon":0,';
    }
    if (gluteeniton){
        palaute += '"gluteeniton":1}}';
    }
    else{
        palaute += '"gluteeniton":0}}';
    }
    return palaute;
}