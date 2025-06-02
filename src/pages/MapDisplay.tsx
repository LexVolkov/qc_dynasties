import React, { useEffect, useState, useCallback, useMemo } from "react";
import ColorPalette from "./widgets/ColorPalette";
import CountList from "./widgets/components/CountList";
import ImgMap from "./widgets/components/ImgMap";
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

type Color = string;
type Square = Schema["Square"]["type"];
type Dynasty = Schema["Dynasty"]["type"];


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
    const [squares, setSquares] = useState<Square[]>([]);
    const [selectedSquares, setSelectedSquares] = useState<number[]>([]);
    const [dynasties, setDynasties] = useState<Dynasty[]>([]);
    const [colorCounts, setColorCounts] = useState<{ [key: string]: number }>({});
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isError, setIsError] = useState<boolean>(false);
    const [isSynced, setIsSynced] = useState<boolean>(false);

    const squareWidth: number = 100 / cols;
    const squareHeight: number = 100 / rows;

    // Завантаження квадратів
    useEffect(() => {
        const sub = client.models.Square.observeQuery().subscribe({
            next: ({ items, isSynced }) => {
                setSquares(items);
                setIsSynced(isSynced);
            },
        });
        return () => sub.unsubscribe();
    }, []);

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
            if (square.dynastyId) {
                const dynasty = dynasties.find(d => d.id === square.dynastyId);
                if (dynasty?.color) {
                    counts[dynasty.color] = (counts[dynasty.color] || 0) + 1;
                }
            }
        });
        setColorCounts(counts);
    }, [squares, dynasties]);

    const handleSquareClick = useCallback((index: number) => {
        setSelectedSquares(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    }, []);

    const handleColorSelect = useCallback(async (color: Color | 'eraser') => {
        if (disabled) return;

        const selectedDynasty = dynasties.find(d => d.color === color);
        if (!selectedDynasty && color !== 'eraser') return;

        setIsLoading(true);
        try {
            for (const index of selectedSquares) {
                if (color === 'eraser') {
                    // Видалення зв'язку з династією
                    await client.models.Square.update({
                        id: squares[index].id,
                        dynastyId: null
                    });
                } else if (selectedDynasty) {
                    // Оновлення зв'язку з династією
                    await client.models.Square.update({
                        id: squares[index].id,
                        dynastyId: selectedDynasty.id
                    });
                }
            }
        } catch (error) {
            console.error("Помилка оновлення:", error);
            setIsError(true);
        } finally {
            setIsLoading(false);
            setSelectedSquares([]);
        }
    }, [selectedSquares, squares, dynasties, disabled]);

    const handleClearAll = useCallback(async () => {
        if (disabled) return;

        setIsLoading(true);
        try {
            for (const square of squares) {
                await client.models.Square.update({
                    id: square.id,
                    dynastyId: null
                });
            }
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
            if (dynasty.color && dynasty.name) {
                acc[dynasty.color] = dynasty.name;
            }
            return acc;
        }, {} as { [key: string]: string });
    }, [dynasties]);

    return (
        <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            width: "100%",
            flexWrap: 'wrap'
        }}>
            <div style={{
                width: "155px",
                padding: "10px",
                boxSizing: "border-box",
                flexShrink: 0,
                minWidth: '155px'
            }}>
                {isSynced && <h3>Синхронізація</h3>}
                <h3>Династії:</h3>

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
                <button
                    onClick={handleLoad}
                    style={{ margin: "10px", width: 'calc(100% - 20px)' }}
                    disabled={isLoading}
                >
                    {isLoading ? 'Завантаження...' : 'Оновити дані'}
                </button>
                {isError && <p style={{ color: 'red', textAlign: 'center' }}>Помилка!</p>}
                {!disabled && (
                    <>
                        <ColorPalette
                            colors={COLORS}
                            dynasties={dynastiesMap}
                            onColorSelect={handleColorSelect}
                            onDynastyChange={() => { }}
                            disabled={false}
                        />
                        <button
                            style={{ margin: "20px", width: 'calc(100% - 40px)' }}
                            onClick={handleClearAll}
                        >
                            Очистити
                        </button>
                    </>
                )}
            </div>
            <div style={{ flexGrow: 1, minWidth: '300px' }}>
                <ImgMap
                    imageUrl={imageUrl}
                    squares={squares.map(square => {
                        const dynasty = dynasties.find(d => d.id === square.dynastyId);
                        return dynasty?.color || null;
                    })}
                    squareWidth={squareWidth}
                    squareHeight={squareHeight}
                    cols={cols}
                    selectedSquares={selectedSquares}
                    onClick={handleSquareClick}
                    disabled={disabled}
                />
            </div>
        </div>
    );
};

export default MapDisplay;