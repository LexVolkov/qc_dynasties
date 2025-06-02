import React, { useState, useRef } from 'react';

// Определяем интерфейс для пропсов компонента ColorPalette
interface ColorPaletteProps {
    colors: string[]; // Массив строк, представляющих цвета
    dynasties: { [key: string]: string }; // Объект, где ключ - цвет, значение - имя династии
    onDynastyChange: (color: string, name: string) => void; // Функция для изменения имени династии
    onColorSelect: (color: string) => void; // Функция для выбора цвета (или "eraser")
    disabled: boolean; // Флаг для отключения поля ввода
    onDynastySave: () => void; // Функция для сохранения имени династии
}

const ColorPalette: React.FC<ColorPaletteProps> = ({
    colors,
    dynasties,
    onDynastyChange,
    onColorSelect,
    disabled,
    onDynastySave,
}) => {
    const [isEditing, setIsEditing] = useState(false);

    // Состояния для перетаскивания
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: 35, y: 85 }); // Начальная позиция
    const [offset, setOffset] = useState({ x: 0, y: 0 }); // Смещение курсора относительно верхнего левого угла элемента

    // Ref для получения доступа к DOM-элементу палитры
    const paletteRef = useRef<HTMLDivElement>(null);

    // Обработчик начала перетаскивания
    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (paletteRef.current) {
            setIsDragging(true);
            // Вычисляем смещение курсора относительно верхнего левого угла элемента
            setOffset({
                x: e.clientX - paletteRef.current.getBoundingClientRect().left,
                y: e.clientY - paletteRef.current.getBoundingClientRect().top,
            });
        }
    };

    // Обработчик перемещения мыши
    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;

        // Обновляем позицию компонента
        setPosition({
            x: e.clientX - offset.x,
            y: e.clientY - offset.y,
        });
    };

    // Обработчик окончания перетаскивания
    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Добавляем и удаляем обработчики событий мыши для всего документа
    // Это важно, чтобы перетаскивание продолжалось, даже если курсор выходит за пределы элемента
    React.useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        } else {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, offset]); // Зависимости: isDragging и offset

    return (
        <div
            id='dynasties'
            ref={paletteRef} // Привязываем ref к корневому div
            style={{
                position: "absolute",
                top: position.y, // Используем динамическое положение
                left: position.x, // Используем динамическое положение
                zIndex: 1000,
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                padding: "3px",
                borderRadius: "5px",
                boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                display: "flex",
                flexWrap: "wrap",
                gap: "3px",
                alignItems: "center",
                cursor: isDragging ? 'grabbing' : 'grab', // Изменяем курсор при перетаскивании
            }}
            onMouseDown={handleMouseDown} // Обработчик начала перетаскивания
        >
            <div style={{
                display: "flex",
                justifyContent: "space-around",
                marginTop: "10px",
                flexDirection: "column",
            }}>
                <div><span style={{
                    fontWeight: "bold", marginBottom: "5px", display: "block", textAlign: "center", color: "indigo"
                }}>
                    Династії
                </span></div>
                < div
                    onClick={() => onColorSelect('eraser')}
                    style={{
                        padding: "5px 1px",
                        color: "#000",
                        cursor: "pointer",
                        borderRadius: "3px",
                        textAlign: "center",
                        backgroundColor: "white",
                        border: "1px solid rgba(0,0,0,0.3)",
                        marginBottom: "5px"
                    }}
                >
                    Стерти
                </div>

                {colors.map((color, index) => (
                    <div key={index} style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}>

                        {isEditing ? (
                            <div style={{ display: "flex", alignItems: "center" }}>
                                <div
                                    onClick={() => onColorSelect(color)}
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
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onDynastyChange(color, e.target.value)}
                                    placeholder="Назва династії"
                                    style={{ width: "80px" }} // Увеличил ширину для лучшей читаемости
                                    disabled={disabled}
                                    // Останавливаем распространение события mousedown, чтобы не начать перетаскивание при клике на input
                                    onMouseDown={(e) => e.stopPropagation()}
                                />
                            </div>
                        ) : (
                            dynasties[color] && (
                                <div
                                    onClick={() => onColorSelect(color)}
                                    style={{
                                        padding: "5px 10px",
                                        backgroundColor: color,
                                        color: "#000",
                                        cursor: "pointer",
                                        borderRadius: "3px",
                                        minWidth: "80px", // Увеличил ширину
                                        textAlign: "center"
                                    }}
                                >
                                    {dynasties[color] || ""}
                                </div>)
                        )}
                    </div>
                ))}
                <div
                    onClick={() => onColorSelect('eraserAll')}
                    style={{
                        padding: "5px 1px",
                        color: "#000",
                        cursor: "pointer",
                        borderRadius: "3px",
                        textAlign: "center",
                        backgroundColor: "white",
                        border: "1px solid rgba(0,0,0,0.3)",
                        marginBottom: "5px"
                    }}
                >
                    Очистити
                </div>
                <button
                    onClick={() => {
                        if (isEditing) {
                            onDynastySave();
                        }
                        setIsEditing(!isEditing);
                    }}
                    style={{
                        marginTop: "10px",
                        padding: "5px 10px",
                        cursor: "pointer",
                        backgroundColor: "#f0f0f0",
                        border: "1px solid #ccc",
                        borderRadius: "3px"
                    }}
                    // Останавливаем распространение события mousedown, чтобы не начать перетаскивание при клике на кнопку
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    {isEditing ? "Зберегти" : "Редагувати"}
                </button>
            </div>
        </div>
    );
};

export default ColorPalette;