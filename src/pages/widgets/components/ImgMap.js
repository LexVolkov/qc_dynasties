import React, {useState} from "react";
import HoverPopUp from "../HoverPopUp";

const rowNames = [0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 0];
const colNames = [0, 0, "А", "Б", "В", "Г", "Д", "Е", "Є", "Ж", "З", "И", "І", "К", "Л", "М", "Н", "О", "П", "Р", "С", "Т", "У", "Ф", "Х", "Ц", "Ч", "D", "F", "G", "J", "L", "N", "Q", "R", "S", "T", "0", "0", "0", "0", "0", "0"];

const ImgMap = ({
                    imageUrl,
                    squares,
                    squareWidth,
                    squareHeight,
                    cols,
                    selectedSquares,
                    onClick,
                    disabled}) => {
    const [hoveredSquare, setHoveredSquare] = useState(null);
    const handleSquareMouseEnter = (index) => {
        setHoveredSquare(index);
    };

    const handleSquareMouseLeave = () => {
        setHoveredSquare(null);
    };
    return (
        <div style={{
            width: "calc(100% - 150px)",
        }}>
            <div style={{
                position: "relative",
                backgroundImage: `url(${imageUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                width: "1018px",
                height: "605px",
            }}>
                {squares.map((color, index) => (
                    <div
                        key={index}
                        onClick={() => disabled? handleSquareMouseEnter(index): onClick(index)}
                        onMouseEnter={() => handleSquareMouseEnter(index)}
                        onMouseLeave={handleSquareMouseLeave}
                        style={{
                            position: "absolute",
                            width: `${squareWidth}%`,
                            height: `${squareHeight}%`,
                            top: `${Math.floor(index / cols) * squareHeight}%`,
                            left: `${(index % cols) * squareWidth}%`,
                            backgroundColor: color ? `${color}90` : "transparent",
                            border: selectedSquares.includes(index) ? "2px solid blue" : "1px solid rgba(0,0,0,0.1)",
                            boxSizing: "border-box",
                            cursor: "pointer",
                        }}
                    />
                ))}
                {hoveredSquare !== null && (
                    <HoverPopUp top={`${Math.floor(hoveredSquare / cols) * squareHeight}%`}
                                left={`${(hoveredSquare % cols) * squareWidth}%`}
                                label={rowNames[Math.floor(hoveredSquare / cols)]+"-"+colNames[hoveredSquare % cols]}/>
                )}
            </div>
        </div>
    );
};

export default ImgMap;
