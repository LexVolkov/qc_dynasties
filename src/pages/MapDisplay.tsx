import React, { useEffect, useState, useCallback, useMemo } from "react";
import ColorPalette from "./widgets/ColorPalette";
import CountList from "./widgets/components/CountList";
import ImgMap from "./widgets/components/ImgMap";
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

type Color = string;
type Dynasty = Schema["Dynasty"]["type"];

type Square = { index: number; color: string };
type MapData = Square[];

const COLORS: Color[] = [
    "#FF0000",
    "#eeff00",
    "#0000FF",
    "#34bd00",
    "#ffffff",
    "#FF00FF",
    "#484848",
    "#800000"
];

interface MapDisplayProps {
    imageUrl: string;
    rows: number;
    cols: number;
    disabled: boolean;
}

const MapDisplay: React.FC<MapDisplayProps> = ({ imageUrl, rows, cols, disabled }) => {
    const [squares, setSquares] = useState<MapData>([]);
    const [mapId, setMapId] = useState<string | null>(null);

    const [selectedSquares, setSelectedSquares] = useState<number[]>([]);
    const [dynasties, setDynasties] = useState<Dynasty[]>([]);
    const [colorCounts, setColorCounts] = useState<{ [key: string]: number }>({});
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isError, setIsError] = useState<boolean>(false);
    const [squaresMap, setSquaresMap] = useState<(string | null)[]>(Array(rows * cols).fill(null));

    const squareWidth: number = 100 / cols;
    const squareHeight: number = 100 / rows;

    const checkMap = async () => {
        const { data, errors } = await client.models.Square.list();

        if (errors) {
            console.error("Помилка при отриманні даних:", errors);
            return;
        }
        if (data && data.length > 0) {
            try {
                setMapId(data[0].id);
                const mapData = JSON.parse(data[0].map as string) as MapData;
                console.log("mapData", mapData);
                setSquares(mapData);
            } catch (error) {
                console.error("Помилка", error);
                return;
            }
        } else {
            const { data, errors } = await client.models.Square.create({
                map: '[]'
            });
            console.log(data, errors);
            if (errors) {
                console.error("Помилка при отриманні даних:", errors);
                return;
            }
            if (data && data.id) {
                setMapId(data.id);
            }
        }
    };
    useEffect(() => {
        if (disabled) return;
        checkMap().then();
    }, []);
    // Виконуємо підписку тільки якщо disabled = true, Пане Lex
    useEffect(() => {
        if (!disabled) return;

        const sub = client.models.Square.observeQuery().subscribe({
            next: ({ items }) => {
                const square = items[0];
                try {
                    const mapData = JSON.parse(square.map as string) as MapData;
                    if (square && mapData) {
                        setSquares(mapData);
                        setMapId(square.id);
                    }
                } catch (error) {
                    console.error("Помилка", error);
                }
            },
        });
        return () => sub.unsubscribe();
    }, [disabled]);

    useEffect(() => {
        if (!disabled) return;

        const sub = client.models.Dynasty.observeQuery().subscribe({
            next: ({ items }) => {
                setDynasties([...items]);
            },
        });
        return () => sub.unsubscribe();
    }, [disabled]);

    // Завантаження династій
    const handleLoad = useCallback(async () => {
        setIsLoading(true);
        setIsError(false);

        try {
            const { data, errors } = await client.models.Dynasty.list();

            if (errors) {
                setIsError(true);
                throw new Error(errors[0]?.message || "Помилка при отриманні даних династій");
            }

            if (data) {
                setDynasties(data);
            }
        } catch (error) {
            console.error("Помилка завантаження:", error);
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        handleLoad();
    }, []);

    // Підрахунок кольорів
    useEffect(() => {

        const counts: { [key: string]: number } = {};
        squares.forEach(square => {
            if (square.color) {
                const dynasty = dynasties.find(d => d.color === square.color);
                if (dynasty?.color) {
                    counts[dynasty.color] = (counts[dynasty.color] || 0) + 1;
                }
            }
        });
        setColorCounts(counts);

        // Якщо у squares відсутній якийсь елемент, то його не враховуємо і залишаємо попереднє значення
        const newMap = squaresMap.map((_prevColor, index) => {
            const square = squares.find(sq => sq.index === index);
            if (square) {
                return square.color;
            } else {
                // Якщо квадрат з таким індексом відсутній у squares, залишаємо попереднє значення
                return null;
            }
        });
        setSquaresMap([...newMap]);


    }, [squares, dynasties]);

    const handleSquareClick = useCallback((index: number) => {
        setSelectedSquares(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    }, []);

    const handleColorSelect = useCallback(async (color: Color | 'eraser' | 'eraserAll') => {
        if (disabled) return;
        if (!mapId) return;

        if (color === 'eraserAll') {
            handleClearAll();
            return;
        }

        setIsLoading(true);
        let resultSquares = squares.map(square => {
            if (selectedSquares.includes(square.index)) {
                return { ...square, color: color === 'eraser' ? null : color };
            } else {
                return square;
            }
        });

        // Знаходимо індекси, яких ще немає серед існуючих квадратів
        const existingIndices = new Set(squares.map(square => square.index));
        const newIndices = selectedSquares.filter(index => !existingIndices.has(index));

        // Додаємо нові квадрати для нових індексів
        if (newIndices.length > 0) {
            const newSquares = newIndices.map(index => ({
                index,
                color: color === 'eraser' ? null : color
            }));
            resultSquares = [...resultSquares, ...newSquares];
        }
        const dataToUpdt = resultSquares.filter(s => s.color !== null);
        const { data, errors } = await client.models.Square.update({
            id: mapId,
            map: JSON.stringify(dataToUpdt),
        });

        if (errors) {
            console.error("Помилка при отриманні даних:", errors);
            setIsError(true);
            return;
        }
        if (data) {
            try {
                if (data && data.id) {
                    const newData = dataToUpdt as MapData;

                    setSquares([...newData]);
                    setMapId(data.id);
                }
            } catch (error) {
                console.error("Помилка", error);
            }
        }

        setIsLoading(false);
        setSelectedSquares([]);

    }, [selectedSquares, squares, dynasties, disabled]);

    const handleSaveDynasties = useCallback(async () => {
        if (disabled) return;
        setIsLoading(true);

        try {
            for (const dynasty of dynasties) {
                if (dynasty.id === 'null') {
                    await client.models.Dynasty.create({
                        color: dynasty.color,
                        name: dynasty.name
                    });
                } else {
                    await client.models.Dynasty.update({
                        id: dynasty.id,
                        color: dynasty.color,
                        name: dynasty.name
                    });
                }
            }
        } catch (error) {
            console.error("Помилка збереження:", error);
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    }, [dynasties, disabled]);

    const handleChangeDynasties = (color: string, name: string) => {
        if (disabled) return;

        const selectedDynasty = dynasties.find(d => d.color === color);

        if (selectedDynasty) {
            setDynasties(prevDynasties => prevDynasties.map(d => d.color === selectedDynasty.color ? { ...d, name } : d));
        } else {
            const newDynasty: Dynasty = { id: 'null', color, name, } as Dynasty;
            setDynasties(prevDynasties => [...prevDynasties, newDynasty]);
        }
    };

    const handleClearAll = useCallback(async () => {
        if (disabled) return;
        if (!mapId) return;

        setIsLoading(true);
        try {
            const { errors } = await client.models.Square.update({
                id: mapId,
                map: JSON.stringify([]),
            });

            if (errors) {
                console.error("Помилка при отриманні даних:", errors);
                setIsError(true);
                return;
            }
            setSquares([]);
        } catch (error) {
            console.error("Помилка очищення:", error);
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    }, [squares, disabled]);

    // Перетворення масиву династій у об'єкт для ColorPalette
    const dynastiesMap = useMemo(() => {
        return dynasties.reduce((acc, dynasty) => {
            if (dynasty.color) {
                acc[dynasty.color] = dynasty.name || '';
            }
            return acc;
        }, {} as { [key: string]: string });
    }, [dynasties]);


    return (
        <div style={{
            width: "100%",
        }}>
            <div id='dynasties' style={{
                position: "absolute",
                top: "60px",
                left: "35px",
                zIndex: 1000,
                backgroundColor: "rgba(255, 255, 255, 0.3)",
                padding: "3px 5px",
                borderRadius: "5px",
                boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                display: "flex",
                flexWrap: "wrap",
                gap: "3px",
                alignItems: "center",
                pointerEvents: "none", // <--- Добавлено это свойство
            }}>
                <div><span style={{ fontWeight: "bold" }}>{isLoading ? 'Завантаження...' : 'Дані оновлено'}</span></div>
                <div><span style={{ fontWeight: "bold" }}>{isError && <p style={{ color: 'red', margin: "0 10px" }}>Помилка!</p>}</span></div>
            </div>
            <div id='dynasties' style={{
                position: "absolute",
                top: "30px",
                left: "35px",
                zIndex: 1000,
                borderRadius: "5px",
                boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                display: "flex",
                flexWrap: "wrap",
                gap: "3px",
                alignItems: "center",
            }}>
                {Object.entries(colorCounts).map(([color, count]) => {
                    const dynasty = dynasties.find(d => d.color === color);
                    if (!dynasty) return null;
                    return (
                        <CountList
                            key={dynasty.id}
                            color={color}
                            count={count}
                            name={dynasty.name || ''}
                        />
                    );
                })}
            </div>


            {!disabled && (
                <>
                    <ColorPalette
                        onDynastySave={handleSaveDynasties}
                        colors={COLORS}
                        dynasties={dynastiesMap}
                        onColorSelect={handleColorSelect}
                        onDynastyChange={handleChangeDynasties}
                        disabled={false}
                    />
                </>
            )}

            <div>
                <ImgMap
                    imageUrl={imageUrl}
                    squares={squaresMap}
                    squareWidth={squareWidth}
                    squareHeight={squareHeight}
                    cols={cols}
                    rows={rows}
                    selectedSquares={selectedSquares}
                    onClick={handleSquareClick}
                    disabled={disabled}
                    dynasties={dynastiesMap}
                />
            </div>
        </div>
    );
};

export default MapDisplay;