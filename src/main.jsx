import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('map')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

/*
Zobrazit mapu z online zdroje
Poskytovat následující nástroje:
    Mìøení dálky - zobrazení délky a azimutu zadané úseèky v mapì
    Mìøení úhlu - zobrazení velikosti úhlu svíraného dvìma úseèkami s jedním spoleèným bodem
    Kreslení a modifikace nakreslené polyèáry

Parametry potøebné pro uvedenou funkcionalitu je možné zadat pomocí myši v mapì anebo èíselnì pomocí vstupních ovládacích prvkù. 
Tzn. je nutné vytvoøit a vhodnì použít input controly pro zadání, zobrazení a editaci úhlu a vzdálenosti èíselnými hodnotami s tím, že bude možné pøepínat jednotky (napø. kilometry/míle, stupnì/radiány).
Vizuální stránka, zpùsob a míra komplexity zvoleného øešení je na volbì øešitele. Vypracovanou aplikaci je vhodné opatøit návodem na spuštìní (to by mìlo být co nejjednodušší).
*/
