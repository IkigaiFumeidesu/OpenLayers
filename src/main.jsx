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

Pseudokód øešení:

0. Prostudovat knihovnu 
1. Zobrazit základní mapu z knihovny 
2. Vytvoøit input pole, které bude pøijímat online zdroj k zobrazení, nejspíš se bude jednat o XYZ link, nebo Raster ?
3. V každém pøípadì se tento input bude muset zapsat do promìnné, kterou nejspíš využiju v nìjaké podmínce, která mi bude kontrolovat zdroj mapy?
4. Pøidat schopnost kreslení do mapy  
5. Pøidat pøímku jako primární symbol 
6. Získat délku nakreslené úseèky 
7. Pøeèíst úhel vùèi severu, zde budu urèitì pracovat se souøadnicemi a vytváøet trojúhelník té pøímky k ose Y a za pomoci goniometrických funkcí získávat svíraný úhel
8. Zobrazit namìøené hodnoty
9. Pøidat snap funkci
10. Jak zobrazit svíraný úhel 2 úseèek -> získat délky úseèek, který svírají ten úhel, následnì vypoèíst opìt pomocí goniometrických funkcí svíraný úhel, max. PI / 2
11. Pøidat modify funkci

Parametry:

1. Èíselné hodnoty se budu ukazovat uživateli pøi kliknutí do mapy
2. Input controls pro zadání èíselnì, pøedpokládám nìjaký vstup ve smyslu souøadnic, a úhlu, který bude mezi 0-360°
3. Pøepnutí jednotek - pøedpokládám pøepnutí již zakreslených pøímek, tudíž budu muset ukládat délky a úhly a skrz nì iterovat 

*/
