import React from 'react';
import './Switch.css';
import { RoomType } from '../../types/types';

interface RoomTypeSwitchProps {
    roomType: RoomType;
    setRoomType: React.Dispatch<React.SetStateAction<RoomType>>;
}

function RoomTypeSwitch({ roomType, setRoomType }: RoomTypeSwitchProps) {
  return (
    <div className="switch-container">
        <label className={`mode-label ${roomType === RoomType.CLASSIC ? 'active' : ''}`}>
            <input
                type="radio"
                name="RoomType"
                value={RoomType.CLASSIC}
                checked={roomType === RoomType.CLASSIC}
                onChange={() => setRoomType(RoomType.CLASSIC)}
            />
            Classic
        </label>

        <label className={`mode-label ${roomType === RoomType.CUSTOM ? 'active' : ''}`}>
            <input
                type="radio"
                name="RoomType"
                value={RoomType.CUSTOM}
                checked={roomType === RoomType.CUSTOM}
                onChange={() => setRoomType(RoomType.CUSTOM)}
            />
            Custom
        </label>
    </div>
  );
}

export default RoomTypeSwitch;