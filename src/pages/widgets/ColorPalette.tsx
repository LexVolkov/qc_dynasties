import { Schema } from "../../../amplify/data/resource";



type Dynasty = Schema["Dynasty"]["type"];
// Определяем интерфейс для пропсов компонента ColorPalette
interface ColorPaletteProps {
    colors: string[]; // Массив строк, представляющих цвета
    dynasties: { [key: string]: string }; // Объект, где ключ - цвет, значение - имя династии
    onDynastyChange: (color: string, name: string) => void; // Функция для изменения имени династии
    onColorSelect: (color: string) => void; // Функция для выбора цвета (или "eraser")
    disabled: boolean; // Флаг для отключения поля ввода
}

const ColorPalette: React.FC<ColorPaletteProps> = ({
    colors,
    dynasties,
    onDynastyChange,
    onColorSelect,
    disabled
}) => {
    return (
        <div style={{
            display: "flex",
            justifyContent: "space-around",
            width: "100%",
            marginTop: "10px",
            flexDirection: "column",
        }}>
            <button
                onClick={() => onColorSelect('eraser')} // Передаем "eraser" как специальное значение
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
                {/* Иконка "ластика" */}
                <span style={{
                    position: "absolute",
                    width: "15px",
                    height: "2px",
                    backgroundColor: "black",
                    transform: "rotate(45deg)",
                }} />
                <span style={{
                    position: "absolute",
                    width: "15px",
                    height: "2px",
                    backgroundColor: "black",
                    transform: "rotate(-45deg)",
                }} />
            </button>

            {colors.map((color, index) => (
                <div key={index} style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}>
                    <div
                        // onClick может быть undefined, но в данном случае он всегда есть из-за типа
                        onClick={() => onColorSelect(color)} // Выбираем текущий цвет
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
                        // Если dynasties[color] undefined, используем пустую строку
                        value={dynasties[color] || ""}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onDynastyChange(color, e.target.value)}
                        placeholder="Dynasty name"
                        style={{ width: "80px" }}
                        disabled={disabled} // Применяем пропс disabled к полю ввода
                    />
                </div>
            ))}
        </div>
    );
};

export default ColorPalette;