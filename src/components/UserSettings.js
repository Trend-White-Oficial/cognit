// userSettings.js - Update User Settings with Language and Currency Selectors
import React from 'react';

const UserSettings = () => {
    const [language, setLanguage] = React.useState('pt-BR');
    const [currency, setCurrency] = React.useState('BRL');

    return (
        <div>
            <select onChange={(e) => setLanguage(e.target.value)}>
                <option value="pt-BR">Português (PT)</option>
                <option value="en-US">English (US)</option>
                <option value="es">Español</option>
            </select>
            <select onChange={(e) => setCurrency(e.target.value)}>
                <option value="BRL">BRL</option>
                <option value="USD">USD</option>
            </select>
        </div>
    );
};

export default UserSettings;