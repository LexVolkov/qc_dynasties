import React from 'react';

// Определяем интерфейс для пропсов компонента CountList
interface CountListProps {
    color: string;
    name: string;
    count: number;
}

/**
 * Определяет, является ли заданный цвет достаточно темным для белого текста.
 * @param hexOrRgbColor Строка цвета в формате HEX (#RRGGBB) или RGB (rgb(R, G, B)).
 * @returns 'white' если цвет темный, иначе 'black'.
 */
const getTextColorBasedOnBackground = (hexOrRgbColor: string): 'white' | 'black' => {
    let r, g, b;

    // Проверяем, является ли это HEX-цветом
    if (hexOrRgbColor.startsWith('#')) {
        const hex = hexOrRgbColor.slice(1);
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
    }
    // Проверяем, является ли это RGB-цветом
    else if (hexOrRgbColor.startsWith('rgb')) {
        const match = hexOrRgbColor.match(/\d+/g);
        if (match && match.length >= 3) {
            r = parseInt(match[0]);
            g = parseInt(match[1]);
            b = parseInt(match[2]);
        } else {
            // В случае ошибки парсинга, возвращаем черный как запасной вариант
            return 'black';
        }
    }
    // Если это именованный цвет (например, "red", "blue"), или другой формат,
    // это сложнее определить без большой карты цветов. Для простоты,
    // можно считать, что такие цвета будут иметь черный текст по умолчанию,
    // или добавить более сложную логику.
    else {
        // Для именованных цветов или других форматов, можно вернуть черный
        // или использовать более продвинутые библиотеки.
        // Здесь мы просто возвращаем черный для неизвестных форматов.
        return 'black';
    }

    // Проверяем, что r, g, b определены
    if (r === undefined || g === undefined || b === undefined) {
        return 'black';
    }

    // Вычисляем яркость (luminance)
    // Формула для восприятия яркости человеком (ITU-R BT.709)
    const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

    // Пороговое значение (0.5 - это середина, можно экспериментировать)
    // Обычно 0.179 (для 0-1) или 186 (для 0-255) используется для темных цветов
    const threshold = 0.5; // Если яркость ниже 0.5, считаем цвет темным

    return luminance < threshold ? 'white' : 'black';
};


const CountList: React.FC<CountListProps> = ({ color, name, count }) => {
    // Определяем цвет текста на основе цвета фона
    const textColor = getTextColorBasedOnBackground(color);

    return (
        <div
            key={color}
            style={{
                backgroundColor: color,
                color: textColor, // Применяем определенный цвет текста
                padding: "1px 5px",
                marginBottom: "3px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                border: `2px solid ${textColor === 'white' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)'}`, // Граница тоже может зависеть от цвета текста
                borderRadius: "3px",
                fontSize: "0.85em",
                lineHeight: "1",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                minHeight: "20px",
            }}
            title={`${name}: ${count}`}
        >
            <span >{name}:</span>
            <span style={{ fontWeight: "bold", marginLeft: "5px" }}>{count}</span>
        </div>
    );
};

export default CountList;