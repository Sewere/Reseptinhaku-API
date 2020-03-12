# Reseptinhaku-API
Avoimien rajapintojen projekti

API on tarkoitettu reseptien hakuun ainesosien perusteella.

Tietokannan luonti-tiedosto sisältää vaadittavan tietokantarakenteen sivuston toimimiseksi sekä muutaman reseptin lisäyksen.

# REST-kutsut
Kaikista onnistuneista hauista palautuu HTML-koodi 200.

Vääristä kutsutyypeistä oikeisiin osoitteisiin palautuu koodi 405 sekä
viesti jossa kerrotaan validit kutsutyypit, esim. 'Allowed methods: GET'

Juureen hakuja tehdessä palautuu koodi 404 sekä viesti 'Wrong endpoint!'.

# GET
Reseptien haku kriteereillä:

    Palauttaa kaikki reseptit JSONINA
    http://localhost:8081/haku
    palautuksen JSON-muoto:
    [
        {
            "ReseptiId": 17,
            "Nimi": "Sipulikeitto",
            "Resepti": "http://www.resepteja.com/sipulikeitto",
            "Vegaaninen": 1,
            "Laktoositon": 1,
            "Gluteeniton": 1
        },
        {
            "ReseptiId": 27,
            "Nimi": "Mummon muusi",
            "Resepti": "http://www.mummonmuusi.com/muusi",
            "Vegaaninen": 0,
            "Laktoositon": 1,
            "Gluteeniton": 0
        }
    ]
    
   Jos aineksilla ei löydy reseptejä, palautuu viesti "Reseptejä ei löytynyt." ja vikakoodi 400.

   Aineksilla hakeminen
    
   Palauttaa yllä olevan JSONin jossa on kaikki reseptit joissa mikä tahansa aineksista sisältyy.
        haku?aines=porkkana,peruna
        
   Aineksilla rajaaminen
        haku?rajaus=sipuli,sieni
        
   Erityisruokavalioilla rajaaminen
        haku?erityis=laktoositon,gluteeniton,vegaaninen
        
# GET
Kaikki reseptit:

    http://localhost:8081/haku/reseptit
    
   Palauttaa kaikki reseptit yllä näkyvässä JSON-muodossa.
    
# GET
Kaikki ainekset:

    http://localhost:8081/haku/ainekset
    
   Palauttaa kaikki ainekset seuraavassa JSON-muodossa:
    [
        {
            "AinesosaId": 1,
            "Nimi": "ahven"
        },
        {
            "AinesosaId": 2,
            "Nimi": "ananas"
        }
    ]

#POST
Uuden reseptin lisääminen:

    http://localhost:8081/lisaa
    
   Lähetettävän reseptin JSON-muoto:
    
    {"resepti":{"nimi":"Reseptin nimi","resepti":"http://www.reseptin- osoite.fi","vegaaninen":1,"laktoositon":1,"gluteeniton":0,"ainekset":["porkkana","peruna"]}}

   Palauttaa epäonnistuneesta kutsusta viestin "Reseptin luonti epäonnistui" ja HTML-koodin 400.
   Onnistuneesta "Resepti lisätty tietokantaan."
    
#DELETE

Reseptin poistaminen:

    http://localhost:8081/poista?url=http://resepti.fi/
    
   Palauttaa onnistuneesta poistosta viestin "Resepti poistettu onnistuneesti!".
   Epäonnistuneesta poistosta palautuu "Reseptejä ei löytynyt." ja vikakoodi 400.
