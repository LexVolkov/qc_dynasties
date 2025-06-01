import React, {useEffect, useState} from "react";
import * as Realm from "realm-web";
import ColorPalette from "./widgets/ColorPalette";
import ImgMap from "./widgets/components/ImgMap";
import CountList from "./widgets/components/CountList";

const COLORS = [
    "#FF0000",
    "#eeff00",
    "#0000FF",
    "#34bd00",
    "#ffffff",
    "#FF00FF",
    "#484848",
    "#800000"
];

const MapDisplay = ({imageUrl, rows, cols, disabled}) => {
    const [squares, setSquares] = useState([]);
    const [selectedSquares, setSelectedSquares] = useState([]);
    const [dynasties, setDynasties] = useState({});
    const [colorCounts, setColorCounts] = useState({});

    const [isLoading, setIsLoading] = useState(null);
    const [isError, setIsError] = useState(null);
    const [firstLoad, setFirstLoad] = useState(true);

    const squareWidth = 100 / cols;
    const squareHeight = 100 / rows;

    const [loading, setLoading] = useState(false);


    useEffect(() => {
        if(!loading){
            setLoading(true);
            handleLoad().then();
        }
    }, []);

    useEffect(() => {
        const counts = squares.reduce((acc, color) => {
            acc[color] = (acc[color] || 0) + 1;
            return acc;
        }, {});
        setColorCounts(counts);
    }, [squares]);

    useEffect(() => {
        if (!disabled && squares.length > 0 && !firstLoad) {
            handleSave().then();
        }
        if (!disabled && squares.length > 0 && firstLoad) {
            setFirstLoad(false);
        }
    }, [squares]);

    const handleSquareClick = (index) => {
        setSelectedSquares((prevSelected) => {
            if (prevSelected.includes(index)) {
                // If the square is already selected, deselect it
                return prevSelected.filter(i => i !== index);
            } else {
                // If the square is not selected, add it to the selection
                return [...prevSelected, index];
            }
        });
    };

    const handleDynastyChange = (color, name) => {
        setDynasties((prevDynasties) => ({...prevDynasties, [color]: name}));
    };

    const handleColorSelect = (color) => {
        setSquares((prevSquares) => {
            const newSquares = [...prevSquares];
            selectedSquares.forEach(index => {
                newSquares[index] = color === 'eraser' ? null : color;
            });
            return newSquares;
        });
        setSelectedSquares([]); // Clear the selection after applying the color

    };


    const handleClearAll = () => {
        setSquares(Array(rows * cols).fill(null));
    };

    const handleSave = async () => {
        if (disabled) return;

        setIsLoading(true);
        setIsError(null);

        try {
            const app = new Realm.App({id: "application-0-gyvncfx"});
            const credentials = Realm.Credentials.anonymous();
            const user = await app.logIn(credentials);
            console.log({squares, dynasties})
            const response = await user.functions.saveMapData({squares, dynasties});
            console.log(response);

        } catch (error) {
            console.error("There has been a problem with your Realm operation:", error);
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    };
    const handleLoad = async () => {
        setIsLoading(true);
        setIsError(null);

        try {
            // Создаём экземпляр приложения Realm
            console.log('try auth')
            const app = new Realm.App({ id: "application-0-gyvncfx", baseUrl: "https://eu-central-1.aws.services.cloud.mongodb.com" });
            console.log(app)
            // Логин с использованием анонимных учетных данных
            const credentials = Realm.Credentials.emailPassword("admin@admin", "admin");
            console.log(credentials)
            const user = await app.logIn(credentials);
            console.log(user)
            if (!user) {
                throw new Error("Failed to authenticate with Realm");
            }

            console.log("Successfully logged in:", user.id);

            // Проверяем, активен ли пользователь
            if (!user.isLoggedIn) {
                throw new Error("User is not logged in");
            }

            // Вызов функции loadMapData для получения данных с сервера
            const data = await user.functions.loadMapData();

            if (!data) {
                throw new Error("Failed to load data from server");
            }

            // Обновляем состояние squares и dynasties с полученными данными
            setSquares(data.squares || Array(rows * cols).fill(null));
            setDynasties(data.dynasties || {});

        } catch (error) {
            console.error("There has been a problem with your Realm operation:", error);
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    };

    if (!squares) {
        return (<>{"Load..."}</>)
    }
    return (
        <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            width: "100%",
        }}>
            <div style={{
                width: "155px",
                padding: "10px",
                boxSizing: "border-box",
            }}>
                {Object.entries(colorCounts).map(([color, count], index) => {
                    if (!dynasties[color]) return null;
                    return (
                        <CountList key={index} color={color} count={count} name={dynasties[color]}/>
                    );
                })}
                <button onClick={handleLoad} style={{margin: "10px"}} disabled={!!isLoading}>
                    {isLoading ? 'Завантаження' : 'Оновити данні'}
                </button>
                {disabled ||
                    <button onClick={handleSave} style={{margin: "10px"}} disabled={!!isLoading}>
                        {isLoading ? 'Завантаження' : 'Зберегти'}
                    </button>
                }
                {isError ? "Невдача" : null}
                {disabled ||
                    <ColorPalette
                        colors={COLORS}
                        dynasties={dynasties}
                        onColorSelect={handleColorSelect}
                        onDynastyChange={handleDynastyChange}
                    />
                }
                {disabled ||
                    <button style={{margin: "20px"}} onClick={handleClearAll}>Очистити</button>
                }
            </div>
            <ImgMap imageUrl={imageUrl}
                    squares={squares}
                    squareWidth={squareWidth}
                    squareHeight={squareHeight}
                    cols={cols}
                    selectedSquares={selectedSquares}
                    onClick={handleSquareClick}
                    disabled={disabled}/>
        </div>
    );
};

export default MapDisplay;
