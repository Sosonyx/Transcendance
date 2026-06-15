import './Switch.css';
import { RoomType } from '../../types/types';

interface RoomTypeSwitchProps {
    roomType: RoomType;
    setRoomType: (val: RoomType) => void;
}

function RoomTypeSwitch({ roomType, setRoomType }: RoomTypeSwitchProps) {
    return (
    <div className="switch-container">
        <label className={`mode-label mode-label--sub ${roomType === RoomType.CLASSIC ? 'active' : ''}`}>
            <input
                type="radio"
                name="RoomType"
                value={RoomType.CLASSIC}
                checked={roomType === RoomType.CLASSIC}
                onChange={() => {}}
                onClick={() => setRoomType(RoomType.CLASSIC)}
            />
            CLASSIC
        </label>

        <label className={`mode-label mode-label--sub ${roomType === RoomType.CUSTOM ? 'active' : ''}`}>
            <input
                type="radio"
                name="RoomType"
                value={RoomType.CUSTOM}
                checked={roomType === RoomType.CUSTOM}
                onChange={() => {}}
                onClick={() => setRoomType(RoomType.CUSTOM)}
            />
            CUSTOM
        </label>
    </div>
    );
}

export default RoomTypeSwitch;