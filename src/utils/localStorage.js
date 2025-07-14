export const saveToLocalStorage = (key, value) => {
    try {
        console.log(`Saving to localStorage: ${key}`, value);
        localStorage.setItem(key, JSON.stringify(value));
        console.log(`Successfully saved ${key} to localStorage`);
    } catch (error) {
        console.error('Error saving to localStorage:', error, { key, value });
    }
};

export const loadFromLocalStorage = (key, defaultValue = null) => {
    try {
        const value = localStorage.getItem(key);
        console.log(`Loading from localStorage: ${key}`, value);
        return value ? JSON.parse(value) : defaultValue;
    } catch (error) {
        console.error('Error loading from localStorage:', error, { key });
        return defaultValue;
    }
};

export const cleanLocalStorage = () => {
    try {
        console.log('Cleaning localStorage');
        localStorage.clear();
        console.log('localStorage cleared');
    } catch (error) {
        console.error('Error cleaning localStorage:', error);
    }
};