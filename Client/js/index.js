/* eslint-disable no-unused-vars */
var hakuaineet = [];
var rajatutaineet = [];

function haeAinesosilla(){
    console.log("Haettu");
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log("tähän myöhemmin jotai kivaa");
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
    console.log("EI halutut ainekset: " + URLrajatut);
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

    console.log("koko haku URL:");
    console.log(hakuURL);

    xhttp.open("GET", hakuURL, true);
    xhttp.send();

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
function rajaaAines(){
    if(document.getElementById("rajaus-input").value != ""){
        var aineslista = document.getElementById("rajatut-ainekset");
        var aines = document.createElement("p");
        aines.innerHTML = document.getElementById("rajaus-input").value;
        aineslista.appendChild(aines);
        console.log("rajaus " + aines.innerHTML + " lisätty");
        rajatutaineet.push(aines.innerHTML);
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

var raakaAineet = ['rosmariini','vesi','riistafondi','mustaherukkahyytelö','banaanisalottisipuli','selleri',
    'oliiviöljy','kasvisfondi','sulatejuusto','valkoviini','punaviini','kuohukerma','herne','mustapippuri','kananmuna',
    'mämmi','voi','leivontasuklaa','vehnäjauho','fariinisokeri','sokeri'];

window.onload = function() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
         
            console.log(xhttp.responseText);
        }
    };
    xhttp.open("GET", "http://localhost:8081/haku/ainekset", true);
    xhttp.send();
   
};

autocomplete(document.getElementById("r-aineInput"), raakaAineet);
autocomplete(document.getElementById("rajaus-input"), raakaAineet);
