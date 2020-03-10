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


//-----------------------REST-KÄSITTELYT---------------------
//---GET-Resepti---
app.get('/haku/', function(req, res){
    console.log("GETTII pyydetty");
    res.header("Access-Control-Allow-Origin", "*");
    var nimi = req.query.name;
    var ainesHakuSQL = "";
    var hakuKysely = "SELECT reseptit.resepti"
        + " FROM Reseptit"
        + " WHERE reseptit.nimi IN (?)";

    //---Hakusanojen taltiointi ja kyselyt-----------TÄLLÄ HETKELLÄ MONELLA NIMELLÄ HAKEMINEN TOIMII---------
    const nimiLista = req.query["nimi"];
    // nimi Get: http://localhost:8081/haku?nimi=juustokeitto&nimi=suklaamousse
    const ainesLista = req.query["aines"];
    // aines Get: http://localhost:8081/haku?
    const rajausLista = req.query["rajaus"];
    const erityisLista = req.query["erityis"];
    // erityis Get: http://localhost:8081/haku?erityis=laktoositon&erityis=vegaaninen

    console.log(req.query);
    console.log(nimiLista);
    console.log(ainesLista);
    console.log(erityisLista);
    console.log(rajausLista);

    if (erityisLista != null) {
        console.log("Erityisruokavalio: "+erityisLista);
    //    hakuKysely = "SELECT reseptit.resepti"
    //        + " FROM Reseptit"
    //        + " WHERE reseptit.nimi IN (?)"
    //        + " AND ";
        //Pitää varmaan muuttaa tietokantaan niin et erityisruokavalio on vaan yks kenttä kolmella eri arvolle
        //niin saa tästä kyselystä paljon helpomman eikä tartte kaivaa kyselystä mikä erikoisruokavalio on valittu.
    }

    con.query(hakuKysely, [nimiLista], function (err, result) {
        if (err) throw err;
        console.log("SQL hakutulos:");
        console.log(result);
        res.send(result);
    });
});

var server = app.listen(8081, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log("Reseptinhaku-API listening at http://%s:%s", host, port);
});