import React from 'react';
import { useEffect } from 'react';
import View from 'ol/View.js';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/Tile.js';
import { OSM, Vector as VectorSource } from 'ol/source.js';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer.js';


function MapComponent() {

    const raster = new TileLayer({
        source: new OSM(),
    });

    const source = new VectorSource();
    const modify = new Modify({ source: source });
    const vector = new VectorLayer({
        source: source,
        style: {
            'fill-color': 'rgba(255, 255, 255, 0.2)',
            'stroke-color': '#ffcc33',
            'stroke-width': 2,
            'circle-radius': 7,
            'circle-fill-color': '#ffcc33',
        },
    });
    let draw, snap; // global so we can remove them later
    useEffect(() => {
        const map = new Map({
            target: 'map-div',
            layers: [raster, vector],
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