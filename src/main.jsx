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
*/
