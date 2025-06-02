// Определяем интерфейс для пропсов компонента HoverPopUp
interface HoverPopUpProps {
    top: string;
    left: string;
    label: string;
}

const HoverPopUp: React.FC<HoverPopUpProps> = ({ top, left, label }) => {
    return (
        <div
            style={{
                position: "absolute",
                top: top,
                left: left,
                transform: "translate(20px, -20px)", // Зміщує попап відносно позиції курсора
                background: "linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)",
                padding: "8px 12px",
                border: "2px solid #3b82f6",
                borderRadius: "14px",
                boxShadow: "0 6px 24px rgba(60, 60, 120, 0.18)",
                pointerEvents: "none",
                zIndex: 1000,
                fontSize: "1rem",
                fontWeight: 700,
                color: "#1e293b",
                letterSpacing: "0.03em",
                textShadow: "0 1px 2px #fff, 0 0px 8px #cbd5e1",
                textAlign: "center",
                fontFamily: "'Segoe UI', 'Arial', sans-serif"
            }}
        >
            {/* Стилізований текст для попапу, Пане Lex */}
            {label}
        </div>
    );
};

export default HoverPopUp;