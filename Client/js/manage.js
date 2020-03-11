/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

var hakuaineet = [];

function reseptinLisaaminen(){


    let reseptiolio ={
        "nimi" : document.getElementById("reseptinimi").value,
        "resepti" : document.getElementById("reseptilinkki").value,
        "vegaaninen" : document.getElementById("erikois3").checked,
        "laktoositon" : document.getElementById("erikois1").checked,
        "gluteeniton" : document.getElementById("erikois2").checked,
        "ainekset" : hakuaineet
    };
    var reseptiString = JSON.stringify(reseptiolio);
    reseptiString = '{"resepti":' + reseptiString + "}";
    reseptiString = reseptiString.split("true").join("1");
    reseptiString = reseptiString.split("false").join("0");
    console.log(reseptiString);

    var asd = (JSON.parse(reseptiString));


    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log("tähän myöhemmin jotai kivaa");

        } else {
            console.log("täällä");
        }
    };
    xhttp.open("POST", "http://localhost:8081/lisaa", true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(reseptiString);

}
function lisaaAines(){
    if(document.getElementById("r-aineInput").value != ""){
        var aineslista = document.getElementById("valitut-ainekset");
        var aines = document.createElement("p");
        aines.innerHTML = document.getElementById("r-aineInput").value;
        aineslista.appendChild(aines);
        console.log("Aines " + aines.innerHTML + " lisätty");
        hakuaineet.push(aines.innerHTML);
    }
}




function autocomplete(inp, arr) {
    
    inp.addEventListener("input", function(e) {
        var a, b, val = this.value;
        closeAllLists();
        if (!val) {
            return false;
        }
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "aineslista");
        a.setAttribute("class", "karsittulista");

        this.parentNode.appendChild(a);
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
                b = document.createElement("DIV");
                b.innerHTML = arr[i].substr(0, val.length);
                b.innerHTML += arr[i].substr(val.length);
                b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
                b.addEventListener("click", function(e) {
                    inp.value = this.getElementsByTagName("input")[0].value;
                    closeAllLists();
                });
                a.appendChild(b);
            }
        }
    });
    /*estää ettei formia lähetetä enterillä keskenkaiken*/
    inp.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + "aineslista");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 13) {
            e.preventDefault();
        }
    });
  
    function closeAllLists(elmnt) {
        var x = document.getElementsByClassName("karsittulista");
        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }

    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
}
var raakaAineet = [];
var raakaAineet2 = [];
window.onload = function() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var raakaAineJSON = JSON.parse(xhttp.responseText);
            for(var i = 0; i<raakaAineJSON.length; i++){
                raakaAineet.push(raakaAineJSON[i].Nimi);
            }            
        }
    };
    xhttp.open("GET", "http://localhost:8081/haku/ainekset", true);
    xhttp.send();
};

autocomplete(document.getElementById("r-aineInput"), raakaAineet);