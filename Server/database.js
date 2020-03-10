var mysql = require('mysql');

var con = mysql.createConnection({
    host: "localhost",
    user: "olso",
    password: "olso",
    database: "reseptihaku"
});

var util = require('util');
const query = util.promisify(con.query).bind(con);

async function insertAinekset(ainekset) {
    let idt = [];
    
    for (let item of ainekset){
        let id;
        try {
            id = await query("INSERT INTO ainesosat(nimi) VALUES ('"+item+"');");
            idt.push(id.insertId);
        } catch (err){
            console.log(item+" on jo tietokannassa.");
        }
        // console.log(id.insertId);
    }
    
    return idt;
}

async function insertResepti(resepti){
    let reseptiKysely = "INSERT INTO reseptit(nimi,resepti,vegaaninen,laktoositon,gluteeniton) VALUES "+
    "('"+resepti.nimi+"','"+resepti.resepti+"','"+resepti.vegaaninen+"','"+resepti.laktoositon+"','"+resepti.gluteeniton+"');";
    // console.log(reseptiKysely);
    const lisattyResepti = await query(reseptiKysely);
    // console.log(lisattyResepti.insertId);
    return lisattyResepti.insertId;
}

async function createResepti(reseptiAineet){
    let reseptiId;
    try {
        reseptiId = await insertResepti(reseptiAineet.resepti);
    } catch (err){
        console.log('Resepti oli jo olemassa');
        return false;
    }
    // console.log(reseptiId);
    try {
        await insertAinekset(reseptiAineet.ainekset);
    } catch (err){
        console.log("ainakin osa aineista oli jo olemassa");
    }

    let ainesLista;
    try {
        ainesLista = await getAinekset(reseptiAineet.ainekset);
    } catch (err) {
        console.log('Aineslistan haku epäonnistui');
        return false;
    }
    // console.log(ainesLista[0].AinesosaId);

    try {
        for (let aines of ainesLista){
            await query("INSERT INTO kuuluu (Rid, Aid) VALUES (?, ?)", [reseptiId, aines.AinesosaId]);
        }
    }   catch (err){
        console.log('Reseptin ja ainesosien linkitys epäonnistui.');
        return false;
    }
    console.log("Resepti luotu!");
    return true;
}

async function getAinekset(haettavatAineet){
    let ainesLista;

    if (haettavatAineet === null){
        ainesLista = await query('SELECT * FROM ainesosat');
    } else {
        let haku = "SELECT *"
        + " FROM ainesosat"
        + " WHERE ainesosat.nimi IN (?)";

        ainesLista = await query(haku, [haettavatAineet]);
    }
    // console.log(ainesLista);
    return ainesLista;
}

async function getReseptit(){
    const reseptiLista = await query('SELECT * FROM reseptit');
    // console.log(reseptiLista);
    return reseptiLista;
}

async function getReseptiKriteerein(kriteerit){
    let reseptiLista;
    try {
        // Haetaan ainekset nimien perusteella
        let ainekset;
        try {
            ainekset = await getAinekset(kriteerit.ainekset);
            console.log("Ainekset haettu");
        } catch (err) {
            console.log('Aineksien haku epäonnistui');
        }
        let aIdt = [];

        // Aineksien ID:t listaan
        for (let item of ainekset){
            aIdt.push(item.AinesosaId);
        }
        console.log(aIdt);

        // Haetaan rajaukset nimien perusteella
        let rajaukset = null;
        let rajaIdt = [];
        try {
            rajaukset = await getAinekset(kriteerit.rajaukset);
            console.log("Rajaukset haettu.");
            // Rajauksien ID:t listaan
            for (let item of rajaukset){
                rajaIdt.push(item.AinesosaId);
            }
            console.log(rajaIdt);
        } catch (err) {
            console.log("Rajauksien haku epäonnistui.");
            rajaukset = null;
        }

        // console.log("rajaukset"+rajaIdt);
        
        // Haetaan aineksiin linkitetyt reseptit joissa haluttuja raaka-aineita
        let kuuluuUrlHalutut = 'SELECT * FROM kuuluu WHERE kuuluu.Aid IN (?)';
        let kuuluu = await query(kuuluuUrlHalutut, [aIdt]);
        console.log("Halutut linkit haettu");

        let rIdt = [];

        // Haluttujen reseptien ID:t listaan
        for (let item of kuuluu){
            rIdt.push(item.Rid);
        }
        console.log(rIdt);
        
        let rIdtRajatut = [];
        let kuuluuRajatut;

        // Jos rajauksia on löytynyt haetaan niiden linkitykset
        if (rajaukset !== null && rajaIdt.length > 0){
            let kuuluuUrlRajatut = 'SELECT * FROM kuuluu WHERE kuuluu.Aid IN (?)';
            kuuluuRajatut = await query(kuuluuUrlRajatut, [rajaIdt]);
            console.log("Rajatut linkit haettu");

            // Rajatut Idt listaan
            for (let item of kuuluuRajatut){
                rIdtRajatut.push(item.Rid);
            }
            console.log(rIdtRajatut);

            // Filteröidään haetuista reseptiID:stä pois rajauksien resepti ID:t
            rIdt = rIdt.filter( function( el ) {
                return !rIdtRajatut.includes( el );
            });
            console.log("Rajaukset poistettu.");
            console.log(rIdt);
        } 
        
        // console.log(kuuluu);
        // Jos reseptejä jäi jäljille rajattujen reseptien poiston jälkeen haetaan nämä reseptit
        if (rIdt.length > 0){
        // Haetaan reseptit ID:n perusteella joissa erityisruokavalio kriteerit täyttyvät
            let reseptiUrl = 'SELECT * FROM reseptit WHERE reseptit.ReseptiId IN (?) AND reseptit.Vegaaninen IN (?) '+
        'AND reseptit.Laktoositon IN (?) AND reseptit.Gluteeniton IN (?)';

            reseptiLista = await query(reseptiUrl, [rIdt, kriteerit.erityis.vegaaninen, 
                kriteerit.erityis.laktoositon, kriteerit.erityis.gluteeniton]);
        } else {
            console.log("Kriteereihin sopivia reseptejä ei löytynyt");
        }
    } catch (err) {
        console.log('Reseptien haku epäonnistui.');
    }
    return reseptiLista;
}

module.exports = {
    insertAinekset,
    insertResepti,
    createResepti,
    getAinekset,
    getReseptit,
    getReseptiKriteerein
};
