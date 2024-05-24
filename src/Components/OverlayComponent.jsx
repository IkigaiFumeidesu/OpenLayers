import React from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';

function OverlayComponent(props) {



    return (
        <>
            <div className="overlay-comp">
                <div>
                    <button><i className="bi bi-pencil"></i></button>
                </div>
                <div>
                    <button onClick={() =>
                        props.sourceVector.removeFeature(props.sourceVector.getFeatures()[props.sourceVector.getFeatures().length - 1])}>
                        <i className="bi bi-trash" ></i></button>
                </div>
                <div>
                    <button><i className="bi bi-upload"></i></button>
                </div>
            </div>
        </>
    );
}

export default OverlayComponent;