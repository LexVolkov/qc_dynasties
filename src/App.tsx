import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import image from './dinasty.jpg';
import MapDisplay from './pages/MapDisplay';

const rows = 25;
const cols = 42;

function Loading() {
  return <div>Завантаження...</div>;
}

function App() {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  useEffect(() => {
    const img = new Image();
    img.src = image;
    img.onload = () => {
      setIsImageLoaded(true);
    };
  }, []);

  return (
    <Router>
      {isImageLoaded ? (
        <Routes>
          <Route
            path="/administration"
            element={
              <MapDisplay
                imageUrl={image}
                rows={rows}
                cols={cols}
                disabled={false}
              />
            }
          />
          <Route
            path="/"
            element={
              <MapDisplay
                imageUrl={image}
                rows={rows}
                cols={cols}
                disabled={true}
              />
            }
          />
        </Routes>
      ) : (
        <Loading />
      )}
    </Router>
  );
}

export default App;
