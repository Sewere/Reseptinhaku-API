//Tietokannan tiedot
var mysql = require('mysql');
var con = mysql.createConnection({
    host: "127.0.0.1",
    user: "olso",
    password: "olso",
    database: "RESEPTIHAKU"
});
var express = require('express');
var app = express();
const db = require('./database.js');

//-----------------------REST-KÄSITTELYT---------------------
//---GET-Resepti---
app.get('/haku/', async function(req, res){
    let kysely = req.query;
    console.log("Koko kysely:");
    console.log(kysely);
    res.header("Access-Control-Allow-Origin", "*");

    //---Hakusanojen taltiointi ja kyselyt----------
        // aines Get: http://localhost:8081/haku?aine=kurkku,sieni
    const ainesLista = req.query["aines"];
        // erityis Get: http://localhost:8081/haku?rajaus=
    const rajausLista = req.query["rajaus"];
        // erityis Get: http://localhost:8081/haku?erityis=laktoositon,vegaaninen
    const erityisLista = req.query["erityis"];
        //yhdiste GET: http://localhost:8081/haku?erityis=laktoositon&aines=porkkana,peruna

    //---Katotaan mitä hakukriteerejä löytyy ja yhdistetään niistä JSON tietokannalle
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
        var lista = rajausLista.split(",");
        var nro = lista.length-1;
        SQLhaku += '"rajaukset":[';
        for(var a in lista){
            SQLhaku += '"'+lista[a];
            if(a == nro){
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
        var lista = erityisLista.split(",");
        SQLhaku += '"erityis":{';
        var veg = false, lak = false, glut = false;
        //Tarkastetaan mitä erityisruokavalioita on valittu
        for(var a in lista){
            if(lista[a] == 'vegaaninen'){
                veg = true;}
            if(lista[a] == 'laktoositon'){
                lak = true;}
            if(lista[a] == 'gluteeniton'){
                glut = true;}
        }
        SQLhaku += getErityisruokavalioText(veg, lak, glut);
    }
    else{
        SQLhaku += '"erityis":{"vegaaninen":0,"laktoositon":0, "gluteeniton":0}}';
        console.log(SQLhaku);
    }
    console.log("SQL-hakukyselyn vimmeinen muoto ennen JSONointia");
    console.log(SQLhaku);
    var jsonKysely = JSON.parse(SQLhaku);
    console.log("TESTI");
    console.log(jsonKysely.rajaukset)
    let SQLtulos = await db.getReseptiKriteerein(jsonKysely);
    res.send(SQLtulos);

});
app.get('/haku/reseptit', async function(req, res){
    res.header("Access-Control-Allow-Origin", "*");
    let SQLtulos = await db.getReseptit();
    res.send(SQLtulos);
});
app.get('/haku/ainekset', async function(req, res){
    res.header("Access-Control-Allow-Origin", "*");
    let SQLtulos = await db.getAinekset(null);
    res.send(SQLtulos);
});
app.post('/lisaa/', async function(req, res){
    res.header("Access-Control-Allow-Origin", "*");
    let asd = req.body;
    console.log(asd);
    console.log(asd.nimi);

    let resepti = {"resepti":{"nimi":"perunatesti420", "resepti":"www.google.com/perunatesti420", "vegaaninen":1,"laktoositon":1, "gluteeniton":1},
    "ainekset":['vesi','peruna', 'kivi', 'sieni']};
});

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

var server = app.listen(8081, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log("Reseptinhaku-API listening at http://%s:%s", host, port);
});