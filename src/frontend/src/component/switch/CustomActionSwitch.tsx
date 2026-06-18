import React from 'react';
import './Switch.css';
import { CustomAction } from '../../types/types';

interface CustomActionSwitchProps {
    customAction: CustomAction;
    setCustomAction: React.Dispatch<React.SetStateAction<CustomAction>>;
}

function CustomActionSwitch({ customAction, setCustomAction }: CustomActionSwitchProps) {
    return (
    <div className="switch-container">
        <label className={`mode-label ${customAction === CustomAction.CREATE ? 'active' : ''}`}>
            <input
                type="radio"
                name="CustomAction"
                value={CustomAction.CREATE}
                checked={customAction === CustomAction.CREATE}
                onChange={() => setCustomAction(CustomAction.CREATE)}
            />
            Create
        </label>

        <label className={`mode-label ${customAction === CustomAction.JOIN ? 'active' : ''}`}>
            <input
                type="radio"
                name="CustomAction"
                value={CustomAction.JOIN}
                checked={customAction === CustomAction.JOIN}
                onChange={() => setCustomAction(CustomAction.JOIN)}
            />
            Join
        </label>
    </div>
    );
}

export default CustomActionSwitch;