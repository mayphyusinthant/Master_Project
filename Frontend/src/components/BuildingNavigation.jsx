import React, { useState, useEffect } from 'react';
import PF from 'pathfinding';

const rooms = {
  room1: { x: 100, y: 140 },
  room2: { x: 240, y: 140 },
  room3: { x: 380, y: 140 },
  room4: { x: 520, y: 140 },
  room5: { x: 100, y: 210 },
  room6: { x: 240, y: 210 },
  room7: { x: 380, y: 210 },
  room8: { x: 520, y: 210 },
};

const BuildingNavigation = () => {
  const [startRoom, setStartRoom] = useState('room1');
  const [endRoom, setEndRoom] = useState('room2');
  const [path, setPath] = useState([]);

  useEffect(() => {
    findPath();
  }, [startRoom, endRoom]);

  const findPath = () => {
    let grid = new PF.Grid(6, 3);
    let finder = new PF.AStarFinder();

    let start = rooms[startRoom];
    let end = rooms[endRoom];

    if (!start || !end) return;

    let startX = Math.floor(start.x / 120);
    let startY = 1;

    let endX = Math.floor(end.x / 120);
    let endY = 1;

    let newPath = finder.findPath(startX, startY, endX, endY, grid);

    let pixelPath = newPath.map(([x, y]) => [x * 120 + 60, y * 60 + 180]);

    setPath(pixelPath);
  };

  return (
    <div>
      <h2>Building Navigation</h2>
      <select value={startRoom} onChange={(e) => setStartRoom(e.target.value)}>
        {Object.keys(rooms).map((room) => (
          <option key={room} value={room}>
            {room}
          </option>
        ))}
      </select>

      <select value={endRoom} onChange={(e) => setEndRoom(e.target.value)}>
        {Object.keys(rooms).map((room) => (
          <option key={room} value={room}>
            {room}
          </option>
        ))}
      </select>

      <svg width="600" height="400">
        <image href="/building-plan.svg" width="600" height="400" />
        {path.length > 1 && (
          <polyline
            points={path.map(([x, y]) => `${x},${y}`).join(' ')}
            stroke="red"
            strokeWidth="5"
            fill="none"
          />
        )}
      </svg>
    </div>
  );
};

export default BuildingNavigation;
