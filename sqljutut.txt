var mysql = require('mysql');

var con = mysql.createConnection({
    host: "localhost",
    user: "olso",
    password: "olso",
    database: "reseptihaku"
});
let ainekset = ['nauris', 'kanafile'];
function insertAinekset(ainekset) {
    return new Promise((resolve, reject) => {
        // let query = "INSERT INTO ainesosat(nimi) VALUES ";

        // for (let item of ainekset){
        //     if (ainekset.indexOf(item) === (ainekset.length-1)){
        //         query += "('"+item+"');";
        //     } else {
        //         query += "('"+item+"'),";
        //     }
        // }
        // console.log(query);

        for (let item of ainekset){
            let testi = "INSERT INTO ainesosat(nimi) VALUES ('"+item+"');";
            // eslint-disable-next-line no-unused-vars
            con.query(testi, function(err, result, fields)
            {
                if (err) console.log("vituiks meni");
                console.log(result.insertId);
            });
        }
        resolve();
    });
}

let resepti = {"nimi":"lihapulla", "resepti":"www.google.com", "vegaaninen":0,"laktoositon":1, "gluteeniton":1};
function insertResepti(resepti){
    return new Promise((resolve, reject) => {
        let testi = "INSERT INTO reseptit(nimi,resepti,vegaaninen,laktoositon,gluteeniton) VALUES "+
    "('"+resepti.nimi+"','"+resepti.resepti+"','"+resepti.vegaaninen+"','"+resepti.laktoositon+"','"+resepti.gluteeniton+"');";
        console.log(testi);
        // eslint-disable-next-line no-unused-vars
        con.query(testi, function(err, result, fields)
        {
            if (err) console.log("vituiks meni");
            resolve(result.insertId);
        });
    });
}

function getAinekset(){
    return new Promise((resolve, reject) => {
        con.query('SELECT * FROM ainesosat', function(err, result, fields){
            if (err) console.log(err);
            // console.log(result);
            // console.log(result[0].AinesosaId);
            resolve(result);
        });
    });
}

function getReseptit(){
    return new Promise((resolve, reject) => {
        con.query('SELECT * FROM reseptit', function(err, result, fields){
            if (err) console.log(err);
            // console.log(result);
            resolve(result);
        });
    });
}
async function testi(){
    console.log(await getReseptit());
}

testi();
// insertResepti(resepti)
// insertAinekset(ainekset);
// getAinekset();