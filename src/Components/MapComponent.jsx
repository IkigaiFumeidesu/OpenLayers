import React from 'react';
import { useEffect } from 'react';
import View from 'ol/View.js';
import Map from 'ol/Map.js';
import OSM from 'ol/source/OSM.js';
import TileLayer from 'ol/layer/Tile.js';


function MapComponent() {

    useEffect(() => {
        const map = new Map({
            target: 'map-div',
            layers: [
                new TileLayer({ source: new OSM })
            ],
            view: new View({
                center: [0, 0],
                zoom: 2,
            })
        });
        return () => map.setTarget(null)
    });


  return (
    <div id="map-div"></div>
  );
}

export default MapComponent;