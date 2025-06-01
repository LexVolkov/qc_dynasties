import React from "react";

const ColorPalette = ({colors, dynasties, onDynastyChange, onColorSelect, disabled}) => {
    return (
        <div style={{
            display: "flex",
            justifyContent: "space-around",
            width: "100%",
            marginTop: "10px",
            flexDirection: "column",

        }}>
        <button
            onClick={() => onColorSelect('eraser')}
            style={{
                width: "30px",
                height: "30px",
                backgroundColor: "white",
                marginRight: "10px",
                cursor: "pointer",
                border: "1px solid rgba(0,0,0,0.3)",
                position: "relative",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
                <span style={{
                    position: "absolute",
                    width: "15px",
                    height: "2px",
                    backgroundColor: "black",
                    transform: "rotate(45deg)",}}/>
            <span style={{
                position: "absolute",
                width: "15px",
                height: "2px",
                backgroundColor: "black",
                transform: "rotate(-45deg)",
            }}/>
        </button>
            {colors.map((color, index) => (<div key={index} style={{display: "flex", alignItems: "center"}}>
                    <div
                        onClick={() => onColorSelect && onColorSelect(color)}
                        style={{
                            width: "30px",
                            height: "30px",
                            backgroundColor: color,
                            marginRight: "10px",
                            cursor: "pointer",
                            border: "1px solid rgba(0,0,0,0.3)"
                        }}
                    />
                    <input
                        type="text"
                        value={dynasties[color] || ""}
                        onChange={(e) => onDynastyChange(color, e.target.value)}
                        placeholder="Dynasty name"
                        style={{width: "80px"}}
                        disabled={disabled}
                    />
                </div>))}



        </div>);
};

export default ColorPalette;
