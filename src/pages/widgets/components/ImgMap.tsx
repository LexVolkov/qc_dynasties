import React, { useState, useRef } from "react";
import HoverPopUp from "../HoverPopUp";

// Определяем типы для rowNames и colNames.
// Они содержат mix из number и string, поэтому 'number | string'
const rowNames: (number | string)[] = [0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 0];
const colNames: (number | string)[] = [0, 0, "А", "Б", "В", "Г", "Д", "Е", "Є", "Ж", "З", "И", "І", "К", "Л", "М", "Н", "О", "П", "Р", "С", "Т", "У", "Ф", "Х", "Ц", "Ч", "D", "F", "G", "J", "L", "N", "Q", "R", "S", "T", "0", "0", "0", "0", "0", "0"];

// Определяем интерфейс для пропсов компонента ImgMap
interface ImgMapProps {
    imageUrl: string;
    squares: (string | null)[]; // Массив цветов (строк) или null, если нет цвета
    squareWidth: number;
    squareHeight: number;
    cols: number;
    rows: number;
    selectedSquares: number[]; // Массив индексов выбранных квадратов
    onClick: (index: number) => void; // Функция, принимающая число и ничего не возвращающая
    disabled: boolean; // Флаг для отключения кликов
    dynasties: { [key: string]: string };
}

const ImgMap: React.FC<ImgMapProps> = ({
    imageUrl,
    squares,
    squareWidth,
    squareHeight,
    cols,
    selectedSquares,
    onClick,
    disabled,
    dynasties
}) => {
    const [hoveredSquare, setHoveredSquare] = useState<number | null>(null);
    const [hoveredName, setHoveredName] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartIndex, setDragStartIndex] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleSquareMouseEnter = (index: number, color: string | null) => {
        setHoveredSquare(index);
        setHoveredName(color ? dynasties[color] : null);

        if (isDragging && dragStartIndex !== null && !disabled) {
            onClick(index);
        }
    };

    const handleSquareMouseLeave = () => {
        setHoveredSquare(null);
        setHoveredName(null);
    };

    const handleMouseDown = (index: number) => {
        if (!disabled) {
            setIsDragging(true);
            setDragStartIndex(index);
            onClick(index);
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setDragStartIndex(null);
    };

    return (
        <div
            style={{
                width: "calc(100% - 150px)",
            }}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            ref={containerRef}
        >
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
                        onMouseDown={() => handleMouseDown(index)}
                        onMouseEnter={() => handleSquareMouseEnter(index, color)}
                        onMouseLeave={handleSquareMouseLeave}
                        style={{
                            position: "absolute",
                            width: `${squareWidth}%`,
                            height: `${squareHeight}%`,
                            top: `${Math.floor(index / cols) * squareHeight}%`,
                            left: `${(index % cols) * squareWidth}%`,
                            backgroundColor: color ? `${color}90` : "transparent",
                            border: selectedSquares.includes(index) ? "3px solid white" : "1px solid rgba(0,0,0,0.1)",
                            boxSizing: "border-box",
                            cursor: disabled ? "default" : "pointer",
                            userSelect: "none",
                            // Мгновенное внутреннее свечение
                            boxShadow: hoveredSquare === index
                                ? "inset 0 0 10px 5px rgba(0, 255, 255, 0.7)" // 'inset' для внутреннего свечения
                                : "none", // Без свечения
                            // transition: "box-shadow 0.3s ease-in-out", // Убрали transition для мгновенного эффекта
                        }}
                    />
                ))}
                {hoveredSquare !== null && (
                    <HoverPopUp
                        top={`${(Math.floor(hoveredSquare / cols) * squareHeight) - 3}%`}
                        left={`${((hoveredSquare % cols) * squareWidth) + 1}%`}
                        label={`${rowNames[Math.floor(hoveredSquare / cols)]}-${colNames[hoveredSquare % cols]} ${hoveredName ? `(${hoveredName})` : ""}`}
                    />
                )}
            </div>
        </div>
    );
};

export default ImgMap;