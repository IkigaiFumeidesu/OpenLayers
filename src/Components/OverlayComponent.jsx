import React from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';

function OverlayComponent(props) {


    console.log(props.sourceVector.getFeatures())
    return (
        <>
            <div className="overlay-comp">
                <div>
                    <button><i className="bi bi-pencil"></i></button>
                </div>
                <div>
                    <button><i className="bi bi-trash" onClick={() => props.sourceVector.clear()}></i></button>
                </div>
                <div>
                    <button><i className="bi bi-upload"></i></button>
                </div>
            </div>
        </>
    );
}

export default OverlayComponent;