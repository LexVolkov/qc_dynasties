// Определяем интерфейс для пропсов компонента HoverPopUp
interface HoverPopUpProps {
    top: string;
    left: string;
    label: string;
}

const HoverPopUp: React.FC<HoverPopUpProps> = ({ top, left, label }) => {
    return (
        <div style={{
            position: "absolute",
            top: top,
            left: left,
            transform: "translate(20px, -20px)", // Смещает попап относительно позиции курсора
            backgroundColor: "white",
            padding: "5px",
            border: "1px solid black",
            pointerEvents: "none", // Важно: делает элемент "прозрачным" для событий мыши,
            // позволяя событиям достигать элементов под ним.
            // Это гарантирует, что попап не будет мешать взаимодействию с картой.
        }}>
            {label}
        </div>
    );
};

export default HoverPopUp;