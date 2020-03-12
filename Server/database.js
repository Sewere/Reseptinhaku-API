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
    let id;
    
    for (let item of ainekset){
        try {
            id = await query("INSERT INTO ainesosat (nimi) VALUES (?)", [item]);
            console.log(item +" lisätty");
            idt.push(id.insertId);
        } catch (err){
            console.log(item+" on jo tietokannassa.");
        }
    }
    return idt;
}

// Lisää tietokantaan reseptin ilman linkityksiä aineksiin
async function insertResepti(resepti){
    let reseptiKysely = "INSERT INTO reseptit(nimi,resepti,vegaaninen,laktoositon,gluteeniton) VALUES (?, ?, ?, ?, ?)";
    try {
        const lisattyResepti = await query(reseptiKysely, [resepti.nimi, resepti.resepti, resepti.vegaaninen, 
            resepti.laktoositon, resepti.gluteeniton]);
        return lisattyResepti.insertId;
    } catch (err) {
        console.log("Reseptin lisäys epäonnistui.");
        return -1;
    }
}

// Lisää reseptin tietokantaan, lisää tietokannasta puuttuvat ainekset tietoantaan, lopuksi linkittää ainekset reseptiin
async function createResepti(reseptiAineet){
    let reseptiId, ainesLista;
    try {
        reseptiId = await insertResepti(reseptiAineet.resepti);
    } catch (err){
        console.log('Resepti on jo olemassa');
        return false;
    }
    try {
        await insertAinekset(reseptiAineet.resepti.ainekset);
    } catch (err){
        console.log("ainakin osa aineista on jo olemassa");
    }

    try {
        ainesLista = await getAinekset(reseptiAineet.resepti.ainekset);
    } catch (err) {
        console.log('Aineslistan haku epäonnistui');
        return false;
    }

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
        try {
            ainesLista = await query(haku, [haettavatAineet]);
        } catch (err) {
            console.log("Aineslistan ");
        }
    }
    return ainesLista;
}

// Hakee kaikki reseptit tietokannasta
async function getReseptit(){
    let reseptiLista;
    try {
        reseptiLista = await query('SELECT * FROM reseptit');
    } catch (err){
        console.log("Reseptien haku epäonnistui");
    }
    return reseptiLista;
}

// Hakee reseptit annettujen kriteerien perusteella
async function getReseptiKriteerein(kriteerit){
    let ainekset, reseptiLista, kuuluu, kuuluuRajatut;
    let aIdt = [], rajaIdt = [], rIdt = [], rIdtRajatut = [];
    let rajaukset = null;

    try {
        // Haetaan ainekset nimien perusteella
        try {
            ainekset = await getAinekset(kriteerit.ainekset);
            console.log("Ainekset haettu");
        } catch (err) {
            console.log('Aineksien haku epäonnistui');
        }

        // Aineksien ID:t listaan
        for (let item of ainekset){
            aIdt.push(item.AinesosaId);
        }

        // Haetaan rajaukset nimien perusteella
        if (kriteerit.rajaukset !== null){
            try {
                rajaukset = await getAinekset(kriteerit.rajaukset);
                console.log("Rajaukset haettu.");
                // Rajauksien ID:t listaan
                for (let item of rajaukset){
                    rajaIdt.push(item.AinesosaId);
                }
            } catch (err) {
                console.log("Rajauksien haku epäonnistui.");
                rajaukset = null;
            }
        }

        // Haetaan aineksiin linkitetyt reseptit joissa haluttuja raaka-aineita
        let kuuluuUrlHalutut = 'SELECT * FROM kuuluu WHERE kuuluu.Aid IN (?)';
        try {
            kuuluu = await query(kuuluuUrlHalutut, [aIdt]);
            console.log("Halutut linkit haettu");
        } catch (err) {
            console.log("Linkkien haku epäonnistui.");
        }

        // Haluttujen reseptien ID:t listaan
        for (let item of kuuluu){
            rIdt.push(item.Rid);
        }
        
        // Jos rajauksia on löytynyt haetaan niiden linkitykset
        if (rajaukset !== null && rajaIdt.length > 0){
            try {
                let kuuluuUrlRajatut = 'SELECT * FROM kuuluu WHERE kuuluu.Aid IN (?)';
                kuuluuRajatut = await query(kuuluuUrlRajatut, [rajaIdt]);
                console.log("Rajaus linkit haettu");
            } catch (err) {
                console.log("Rajaus linkkien haku epäonnistui");
            }
            // Rajatut Idt listaan
            for (let item of kuuluuRajatut){
                rIdtRajatut.push(item.Rid);
            }

            // Filteröidään haetuista reseptiID:stä pois rajauksien resepti ID:t
            rIdt = rIdt.filter( function( el ) {
                return !rIdtRajatut.includes( el );
            });
            console.log("Rajaukset poistettu.");
        } 
        
        // Jos reseptejä jäi jäljille rajattujen reseptien poiston jälkeen haetaan nämä reseptit
        if (rIdt.length > 0){
        // Haetaan reseptit ID:n perusteella joissa erityisruokavalio kriteerit täyttyvät
            let reseptiUrl = 'SELECT * FROM reseptit WHERE reseptit.ReseptiId IN (?)';
            let hakukriteerit = [rIdt];
            
            // Lisätään erikoisruokavaliot sql hakuun tarvittaessa
            if (kriteerit.erityis.vegaaninen === 1) {
                reseptiUrl += ' AND reseptit.Vegaaninen IN (?)';
                hakukriteerit.push(kriteerit.erityis.vegaaninen);
            }
            if (kriteerit.erityis.laktoositon === 1){
                reseptiUrl += ' AND reseptit.Laktoositon IN (?)';
                hakukriteerit.push(kriteerit.erityis.laktoositon);
            }
            if (kriteerit.erityis.gluteeniton === 1){
                reseptiUrl += ' AND reseptit.Gluteeniton IN (?)';
                hakukriteerit.push(kriteerit.erityis.gluteeniton);
            }

            try {
                reseptiLista = await query(reseptiUrl, hakukriteerit);
                console.log("Reseptit haettu");
            } catch (err){
                console.log("Reseptilistan haku epäonnisui");
            }

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
