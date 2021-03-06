/* eslint-disable no-unused-vars */
var hakuaineet = [];
var rajatutaineet = [];
var raakaAineet = [];

function haeAinesosilla(){
    console.log("Haettu");
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        var tuloslista = document.getElementById("reseptitulokset");
        tuloslista.innerHTML = "";
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.responseText);
            var palautuslista = JSON.parse(this.responseText);
            for(var i = 0; i < palautuslista.length; i++){
                var tulosN = document.createElement("h1");
                var tulosL = document.createElement("a");
                tulosL.setAttribute('href' ,palautuslista[i].Resepti);
                tulosN.innerHTML = palautuslista[i].Nimi;
                tulosL.innerHTML = palautuslista[i].Resepti;
                tuloslista.appendChild(tulosN);
                tuloslista.appendChild(tulosL);
            }

        } else if(this.readyState == 4 && this.status == 400){
            tuloslista = document.getElementById("reseptitulokset");
            var eiloydy = document.createElement("h1");
            eiloydy.innerHTML = "Annetuilla aineksilla ei löytynyt reseptejä";
            tuloslista.appendChild(eiloydy);
        }
    };
    var laktoositon = document.getElementById("erikois1").checked;
    var gluteeniton = document.getElementById("erikois2").checked;
    var vegaaninen = document.getElementById("erikois3").checked;
    var erikoislista = [];
    if (vegaaninen == true){
        erikoislista.push("vegaaninen");
    } if (laktoositon == true) {
        erikoislista.push("laktoositon");
    } if (gluteeniton == true) {
        erikoislista.push("gluteeniton");
    }
    var URLainekset = (JSON.stringify(hakuaineet).replace(/[[\]]|'|"/g,''));
    var URLerikoisuudet = (JSON.stringify(erikoislista).replace(/[[\]]|'|"/g,''));
    var URLrajatut = (JSON.stringify(rajatutaineet).replace(/[[\]]|'|"/g,''));
    console.log("Halutut ainekset: " + URLainekset);
    console.log("Ei halutut ainekset: " + URLrajatut);
    console.log("Rajoitteet: " + URLerikoisuudet);

    var hakuURL = "http://localhost:8081/haku?";

    if (erikoislista.length > 0){
        hakuURL = hakuURL + "erityis=" + URLerikoisuudet + "&";
    }

    if (hakuaineet.length > 0){
        hakuURL = hakuURL + "aines=" + URLainekset + "&";
    }
    if (URLrajatut.length > 0){
        hakuURL = hakuURL + "rajaus=" + URLrajatut + "&";
    }

    console.log("koko haku URL: " + hakuURL);

    xhttp.open("GET", hakuURL, true);
    xhttp.send();

}
function lisaaAines(){
    if(document.getElementById("r-aineInput").value != ""
    && !hakuaineet.includes(document.getElementById("r-aineInput").value)
    && raakaAineet.includes(document.getElementById("r-aineInput").value)){
        var aineslista = document.getElementById("valitut-ainekset");
        var aines = document.createElement("p");
        aines.innerHTML = document.getElementById("r-aineInput").value;
        aineslista.appendChild(aines);
        console.log("Aines " + aines.innerHTML + " lisätty");
        hakuaineet.push(aines.innerHTML);
        document.getElementById("r-aineInput").value = "";
    }
}
var valitutainekset = [];
function lisaaAines2(){
    if(document.getElementById("r-aineInput").value != ""
    && !hakuaineet.includes(document.getElementById("r-aineInput").value)
    && raakaAineet.includes(document.getElementById("r-aineInput").value)){
        document.getElementById("valitut-ainekset").innerHTML = valitutainekset;
        valitutainekset.push(document.getElementById("r-aineInput").value);
        console.log(valitutainekset);
        document.getElementById("valitut-ainekset").innerHTML = valitutainekset;
        var aines = document.getElementById("r-aineInput").value;
        hakuaineet.push(aines.innerHTML);
        
    }
}
function lisaaAines3(){
    if(document.getElementById("r-aineInput").value != ""
    && !hakuaineet.includes(document.getElementById("r-aineInput").value)
    && raakaAineet.includes(document.getElementById("r-aineInput").value)){
        var aineslista = document.getElementById("valitut-ainekset");
        var aines = document.createElement("li");
        aines.innerHTML = document.getElementById("r-aineInput").value;
        aineslista.appendChild(aines);
        console.log("Aines " + aines.innerHTML + " lisätty");
        hakuaineet.push(aines.innerHTML);
        document.getElementById("r-aineInput").value = "";
        console.log(hakuaineet);
    }
}
function rajaaAines(){
    if(document.getElementById("rajaus-input").value != ""
    && !rajatutaineet.includes(document.getElementById("rajaus-input").value)
    && raakaAineet.includes(document.getElementById("rajaus-input").value)){
        var aineslista = document.getElementById("rajatut-ainekset");
        var aines = document.createElement("li");
        aines.innerHTML = document.getElementById("rajaus-input").value;
        aineslista.appendChild(aines);
        console.log("rajaus " + aines.innerHTML + " lisätty");
        rajatutaineet.push(aines.innerHTML);
        document.getElementById("rajaus-input").value = "";
    }
}
function alphaOnly(event) {
    var key = event.keyCode;
    return ((key >= 65 && key <= 90) || key == 8);
}
window.onload = function() {
    const input1 = document.getElementById('r-aineInput');
    const input2 = document.getElementById('rajaus-input');
    input1.onpaste = function(e) {
        e.preventDefault();
    };
    input2.onpaste = function(e) {
        e.preventDefault();
    };
};




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
document.getElementById("valitut-ainekset").addEventListener("click",function(e) {
    var tgt = e.target;
    var tgtnimi = tgt.textContent;
    if (tgt.tagName.toUpperCase() == "LI") {
        tgt.parentNode.removeChild(tgt);
        var index = hakuaineet.indexOf(tgtnimi);
        if (index !== -1) hakuaineet.splice(index, 1);

    }
});
document.getElementById("rajatut-ainekset").addEventListener("click",function(e) {
    var tgt = e.target;
    var tgtnimi = tgt.textContent;
    if (tgt.tagName.toUpperCase() == "LI") {
        tgt.parentNode.removeChild(tgt);
        var index = rajatutaineet.indexOf(tgtnimi);
        if (index !== -1) rajatutaineet.splice(index, 1);
    }
});

autocomplete(document.getElementById("r-aineInput"), raakaAineet);
autocomplete(document.getElementById("rajaus-input"), raakaAineet);
