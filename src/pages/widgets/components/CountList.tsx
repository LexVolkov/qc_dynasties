// Определяем интерфейс для пропсов компонента CountList
interface CountListProps {
    color: string;
    name: string;
    count: number;
}

const CountList: React.FC<CountListProps> = ({ color, name, count }) => {
    return (
        <div key={color} style={{
            backgroundColor: color,
            padding: "5px",
            marginBottom: "5px",
            whiteSpace: "normal",
            wordWrap: "break-word",
            border: "1px solid rgba(0,0,0,0.5)"
        }}>
            {name}: {count}
        </div>
    );
};

export default CountList;