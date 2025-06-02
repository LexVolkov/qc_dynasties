import React, { useState } from "react";
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
    selectedSquares: number[]; // Массив индексов выбранных квадратов
    onClick: (index: number) => void; // Функция, принимающая число и ничего не возвращающая
    disabled: boolean; // Флаг для отключения кликов
}

const ImgMap: React.FC<ImgMapProps> = ({
    imageUrl,
    squares,
    squareWidth,
    squareHeight,
    cols,
    selectedSquares,
    onClick,
    disabled
}) => {
    // hoveredSquare может быть либо числом (индексом), либо null
    const [hoveredSquare, setHoveredSquare] = useState<number | null>(null);

    const handleSquareMouseEnter = (index: number) => {
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
                        // Тип 'onClick' должен быть 'MouseEvent<HTMLDivElement>'
                        // Для обработки клика используем функциональный подход, чтобы не было disabled && onClick(index)
                        onClick={() => {
                            if (!disabled) {
                                onClick(index);
                            }
                        }}
                        onMouseEnter={() => handleSquareMouseEnter(index)}
                        onMouseLeave={handleSquareMouseLeave}
                        style={{
                            position: "absolute",
                            width: `${squareWidth}%`,
                            height: `${squareHeight}%`,
                            top: `${Math.floor(index / cols) * squareHeight}%`,
                            left: `${(index % cols) * squareWidth}%`,
                            // `color` может быть null, поэтому проверяем его
                            backgroundColor: color ? `${color}90` : "transparent",
                            border: selectedSquares.includes(index) ? "2px solid blue" : "1px solid rgba(0,0,0,0.1)",
                            boxSizing: "border-box",
                            // Курсор изменяется только если не disabled
                            cursor: disabled ? "default" : "pointer",
                        }}
                    />
                ))}
                {hoveredSquare !== null && (
                    <HoverPopUp
                        top={`${Math.floor(hoveredSquare / cols) * squareHeight}%`}
                        left={`${(hoveredSquare % cols) * squareWidth}%`}
                        // Преобразование в строку, так как rowNames и colNames могут содержать числа
                        label={`${rowNames[Math.floor(hoveredSquare / cols)]}-${colNames[hoveredSquare % cols]}`}
                    />
                )}
            </div>
        </div>
    );
};

export default ImgMap;