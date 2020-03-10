var hakuaineet = [];

function haeAinesosilla(){
    console.log("Haettu");
    console.log(hakuaineet);
}
function lisaaAines(){
    var aineslista = document.getElementById("aineslista");
    var aines = document.createElement("p");
    aines.innerHTML = document.getElementById("r-aineInput").value;
    aineslista.appendChild(aines);
    console.log("Aines lisätty")
    console.log(aines.innerHTML);
    hakuaineet.push(aines.innerHTML);
}


function lisääAine(){
    console.log("asd");
}
function autocomplete(inp, arr) {
  
  inp.addEventListener("input", function(e) {
      var a, b, val = this.value;
      console.log(this.value)
      closeAllLists();
      if (!val) {
           return false;
        }
      a = document.createElement("DIV");
      a.setAttribute("id", this.id + "aineslista");
      console.log(this.id + "aineslista");
      a.setAttribute("class", "karsittulista");

      this.parentNode.appendChild(a);
      for (i = 0; i < arr.length; i++) {
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
'mämmi','voi','leivontasuklaa','vehnäjauho','fariinisokeri','sokeri']

autocomplete(document.getElementById("r-aineInput"), raakaAineet);

