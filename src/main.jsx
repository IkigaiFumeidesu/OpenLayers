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
Poskytovat n�sleduj�c� n�stroje:
    M��en� d�lky - zobrazen� d�lky a azimutu zadan� �se�ky v map�
    M��en� �hlu - zobrazen� velikosti �hlu sv�ran�ho dv�ma �se�kami s jedn�m spole�n�m bodem
    Kreslen� a modifikace nakreslen� poly��ry

Parametry pot�ebn� pro uvedenou funkcionalitu je mo�n� zadat pomoc� my�i v map� anebo ��seln� pomoc� vstupn�ch ovl�dac�ch prvk�. 
Tzn. je nutn� vytvo�it a vhodn� pou��t input controly pro zad�n�, zobrazen� a editaci �hlu a vzd�lenosti ��seln�mi hodnotami s t�m, �e bude mo�n� p�ep�nat jednotky (nap�. kilometry/m�le, stupn�/radi�ny).
Vizu�ln� str�nka, zp�sob a m�ra komplexity zvolen�ho �e�en� je na volb� �e�itele. Vypracovanou aplikaci je vhodn� opat�it n�vodem na spu�t�n� (to by m�lo b�t co nejjednodu���).

Pseudok�d �e�en�:

0. Prostudovat knihovnu 
1. Zobrazit z�kladn� mapu z knihovny 
2. Vytvo�it input pole, kter� bude p�ij�mat online zdroj k zobrazen�, nejsp� se bude jednat o XYZ link, nebo Raster ?
3. V ka�d�m p��pad� se tento input bude muset zapsat do prom�nn�, kterou nejsp� vyu�iju v n�jak� podm�nce, kter� mi bude kontrolovat zdroj mapy?
4. P�idat schopnost kreslen� do mapy  
5. P�idat p��mku jako prim�rn� symbol 
6. Z�skat d�lku nakreslen� �se�ky 
7. P�e��st �hel v��i severu, zde budu ur�it� pracovat se sou�adnicemi a vytv��et troj�heln�k t� p��mky k ose Y a za pomoci goniometrick�ch funkc� z�sk�vat sv�ran� �hel
8. Zobrazit nam��en� hodnoty
9. P�idat snap funkci
10. Jak zobrazit sv�ran� �hel 2 �se�ek -> z�skat d�lky �se�ek, kter� sv�raj� ten �hel, n�sledn� vypo��st op�t pomoc� goniometrick�ch funkc� sv�ran� �hel, max. PI / 2
11. P�idat modify funkci

Parametry:

1. ��seln� hodnoty se budu ukazovat u�ivateli p�i kliknut� do mapy
2. Input controls pro zad�n� ��seln�, p�edpokl�d�m n�jak� vstup ve smyslu sou�adnic, a �hlu, kter� bude mezi 0-360�
3. P�epnut� jednotek - p�edpokl�d�m p�epnut� ji� zakreslen�ch p��mek, tud� budu muset ukl�dat d�lky a �hly a skrz n� iterovat 

*/
