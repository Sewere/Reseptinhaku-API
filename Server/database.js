var mysql = require('mysql');

// Luodaan tietokantayhteys
var con = mysql.createConnection({
    host: "localhost",
    user: "olso",
    password: "olso",
    database: "reseptihaku"
});

var util = require('util');
const query = util.promisify(con.query).bind(con);

// Funktio yrittää lisätä ainekset listan sisältämät ainekset tietokantaan yksi kerrallaan ilman linkityksiä
async function insertAinekset(ainekset) {
    let idt = [];
    
    for (let item of ainekset){
        let id;
        try {
            id = await query("INSERT INTO ainesosat (nimi) VALUES (?)", [item]);
            console.log(item +" lisätty");
            idt.push(id.insertId);
        } catch (err){
            console.log(item+" on jo tietokannassa.");
        }
        // console.log(id.insertId);
    }
    
    return idt;
}

// Lisää tietokantaan reseptin ilman linkityksiä aineksiin
async function insertResepti(resepti){
    let reseptiKysely = "INSERT INTO reseptit(nimi,resepti,vegaaninen,laktoositon,gluteeniton) VALUES (?, ?, ?, ?, ?)";
    // console.log(reseptiKysely);
    const lisattyResepti = await query(reseptiKysely, [resepti.nimi, resepti.resepti, resepti.vegaaninen, 
        resepti.laktoositon, resepti.gluteeniton]);
    // console.log(lisattyResepti.insertId);
    return lisattyResepti.insertId;
}

// Lisää reseptin tietokantaan, lisää tietokannasta puuttuvat ainekset tietoantaan, lopuksi linkittää ainekset reseptiin
async function createResepti(reseptiAineet){
    let reseptiId;
    try {
        reseptiId = await insertResepti(reseptiAineet.resepti);
    } catch (err){
        console.log('Resepti on jo olemassa');
        return false;
    }
    // console.log(reseptiId);
    try {
        await insertAinekset(reseptiAineet.ainekset);
    } catch (err){
        console.log("ainakin osa aineista on jo olemassa");
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

// Hakee kaikki ainekset tietokannasta jos parametri on null, jos parametrina ainesosalista hakee vain nämä ainekset
// Tällöin saadaan haettujen aineksien id:t. 
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

// Hakee kaikki reseptit tietokannasta
async function getReseptit(){
    const reseptiLista = await query('SELECT * FROM reseptit');
    // console.log(reseptiLista);
    return reseptiLista;
}

// Hakee reseptit annettujen kriteerien perusteella
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

        if (kriteerit.rajaukset !== null){
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
            let reseptiUrl = 'SELECT * FROM reseptit WHERE reseptit.ReseptiId IN (?)';
            let hakukriteerit = [rIdt];
            
            // Lisätään erikoisruokavaliot sql hakuun tarvittaessa
            if (kriteerit.erityis.vegaaninen === 1) {
                reseptiUrl += ' AND reseptit.Vegaaninen IN (?)';
                hakukriteerit.push(kriteerit.erityis.vegaaninen);
                console.log("vege");
            }
            if (kriteerit.erityis.laktoositon === 1){
                reseptiUrl += ' AND reseptit.Laktoositon IN (?)';
                hakukriteerit.push(kriteerit.erityis.laktoositon);
                console.log("laktoositon");
            }
            if (kriteerit.erityis.gluteeniton === 1){
                reseptiUrl += ' AND reseptit.Gluteeniton IN (?)';
                hakukriteerit.push(kriteerit.erityis.gluteeniton);
                console.log("gluteeniton");
            }
            console.log(reseptiUrl);
            reseptiLista = await query(reseptiUrl, hakukriteerit);

        } else {
            console.log("Kriteereihin sopivia reseptejä ei löytynyt");
        }
    } catch (err) {
        console.log('Reseptien haku epäonnistui.');
    }
    return reseptiLista;
}

module.exports = {
    createResepti,
    getAinekset,
    getReseptit,
    getReseptiKriteerein
};
