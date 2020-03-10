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
        let ainekset = await getAinekset(kriteerit.ainekset);
        let aIdt = [];

        // Aineksien ID:t listaan
        for (let item of ainekset){
            aIdt.push(item.AinesosaId);
        }
        console.log(aIdt);

        // Haetaan rajaukset nimien perusteella
        let rajaukset = await getAinekset(kriteerit.rajaukset);
        let rajaIdt = [];

        // Rajauksien ID:t listaan
        for (let item of rajaukset){
            rajaIdt.push(item.AinesosaId);
        }
        console.log(rajaIdt);

        // Haetaan aineksiin linkitetyt reseptit poislukien rajaukset
        let kuuluuUrl = 'SELECT * FROM kuuluu WHERE kuuluu.Aid IN (?) AND kuuluu.Aid NOT IN (?)';
        let kuuluu = await query(kuuluuUrl, [aIdt, rajaIdt]);
        let rIdt = [];

        // reseptien ID:t listaan
        for (let item of kuuluu){
            rIdt.push(item.Rid);
        }

        // Haetaan reseptit ID:n perusteella joissa erityisruokavalio kriteerit täyttyvät
        let reseptiUrl = 'SELECT * FROM reseptit WHERE reseptit.ReseptiId IN (?) AND reseptit.Vegaaninen IN (?) '+
        'AND reseptit.Laktoositon IN (?) AND reseptit.Gluteeniton IN (?)';
        reseptiLista = await query(reseptiUrl, [rIdt, kriteerit.erityis.vegaaninen, 
            kriteerit.erityis.laktoositon, kriteerit.erityis.gluteeniton]);

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
