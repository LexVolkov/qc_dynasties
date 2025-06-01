import React from "react";

const HoverPopUp = ({top, left, label}) => {
    return (

        <div style={{
            position: "absolute",
            top: top,
            left: left,
            transform: "translate(20px, -20px)",
            backgroundColor: "white",
            padding: "5px",
            border: "1px solid black",
            pointerEvents: "none",
        }}>
            {label}
        </div>

    );
};

export default HoverPopUp;
