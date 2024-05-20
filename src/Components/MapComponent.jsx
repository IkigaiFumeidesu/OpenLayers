import React from 'react';
import { useEffect } from 'react';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import { Draw, Modify, Snap } from 'ol/interaction.js';
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
    let draw, snap;
    useEffect(() => {
        const map = new Map({
            target: 'map-div',
            layers: [raster, vector],
            view: new View({
                center: [0, 0],
                zoom: 2,
            })
        });
        function addInteractions() {

            draw = new Draw({
                source: source,
                type: 'LineString',

            });
            map.addInteraction(modify);
            draw.on('drawstart', () => {
                modify.setActive(false);
            });

            draw.on('drawend', () => {
                modify.setActive(true);
            });

            map.addInteraction(draw);
            snap = new Snap({ source: source });
            map.addInteraction(snap);

        }
        addInteractions();

        return () => map.setTarget(null)
    });


  return (
    <div id="map-div"></div>
  );
}

export default MapComponent;