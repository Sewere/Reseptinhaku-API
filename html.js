var hakuaineet = [];

function haeAinesosilla(){
    console.log("Haettu");
    console.log(hakuaineet);
}
function lisaaAines(){
    var aineslista = document.getElementById("aineslista");
    var aines = document.createElement("p");
    aines.innerHTML = document.getElementById("ainesosa").value;
    aineslista.appendChild(aines);
    console.log("Aines lisätty")
    console.log(aines.innerHTML);
    hakuaineet.push(aines.innerHTML);
}

//ENTERILLÄ AINEOSIEN LISÄÄMINEN
// Get the input field
var input = document.getElementById("ainesosa");
// Execute a function when the user releases a key on the keyboard
input.addEventListener("keyup", function(event) {
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
        // Cancel the default action, if needed
        event.preventDefault();
        // Trigger the button element with a click
        document.getElementById("lisääaines").click();
    }
});