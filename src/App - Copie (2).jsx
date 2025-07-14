import { useState, useEffect } from 'react';
import { saveToLocalStorage, loadFromLocalStorage, cleanLocalStorage } from './utils/localStorage';
import { saveToFirebase, loadFromFirebase } from './utils/firebase';
import './assets/styles.css';
import ShopSelection from './components/steps/ShopSelection';
import WeekSelection from './components/steps/WeekSelection';
import TimeSlotConfig from './components/steps/TimeSlotConfig';
import EmployeeSelection from './components/steps/EmployeeSelection';
import PlanningDisplay from './components/planning/PlanningDisplay';
import Button from './components/common/Button';
import { format } from 'date-fns';
import { saveAs } from 'file-saver';

// Main App component
function App() {
    const [shops, setShops] = useState([]);
    const [selectedShop, setSelectedShop] = useState('');
    const [selectedWeek, setSelectedWeek] = useState('');
    const [timeSlotConfig, setTimeSlotConfig] = useState({});
    // Initialize currentStep based on localStorage data
    const [currentStep, setCurrentStep] = useState(() => {
        const storedConfig = loadFromLocalStorage('timeSlotConfig');
        const storedShop = loadFromLocalStorage('selectedShop');
        const storedWeek = loadFromLocalStorage('selectedWeek');
        const storedEmployees = loadFromLocalStorage(`selected_employees_${storedShop}_${storedWeek}`);
        if (
            storedConfig?.interval &&
            Array.isArray(storedConfig?.timeSlots) &&
            storedConfig.timeSlots.length > 0 &&
            storedShop &&
            storedWeek &&
            Array.isArray(storedEmployees) &&
            storedEmployees.length > 0
        ) {
            return 'planning';
        }
        return 'config';
    });

    // Load data on mount
    useEffect(() => {
        const loadData = async () => {
            console.log('Chargement des données...');
            const firebaseData = await loadFromFirebase();
            if (firebaseData) {
                console.log('Données chargées depuis Firebase:', firebaseData);
                setShops(firebaseData.shops || []);
                setSelectedShop(firebaseData.selectedShop || '');
                setSelectedWeek(firebaseData.selectedWeek || '');
                setTimeSlotConfig(firebaseData.timeSlotConfig || {});
                Object.keys(firebaseData).forEach(key => {
                    if (key.startsWith('employees_') || key.startsWith('selected_employees_') || key.startsWith('planning_') || key.startsWith('copied_') || key.startsWith('lastPlanning_')) {
                        saveToLocalStorage(key, firebaseData[key]);
                    }
                });
            } else {
                console.log('Aucune donnée Firebase, chargement depuis localStorage...');
                setShops(loadFromLocalStorage('shops') || []);
                setSelectedShop(loadFromLocalStorage('selectedShop') || '');
                setSelectedWeek(loadFromLocalStorage('selectedWeek') || '');
                setTimeSlotConfig(loadFromLocalStorage('timeSlotConfig') || {});
            }
        };
        loadData();
    }, []);

    // Save data to Firebase on state changes
    useEffect(() => {
        console.log('Sauvegarde des données sur Firebase, timeSlotConfig:', timeSlotConfig);
        const data = {
            shops,
            selectedShop,
            selectedWeek,
            timeSlotConfig,
            ...Object.fromEntries(
                Object.keys(localStorage).filter(key =>
                    key.startsWith('employees_') ||
                    key.startsWith('selected_employees_') ||
                    key.startsWith('planning_') ||
                    key.startsWith('copied_') ||
                    key.startsWith('lastPlanning_')
                ).map(key => [key, loadFromLocalStorage(key)])
            )
        };
        saveToFirebase(data);
    }, [shops, selectedShop, selectedWeek, timeSlotConfig]);

    // Save data to Firebase on window close
    useEffect(() => {
        const handleBeforeUnload = () => {
            console.log('Sauvegarde avant fermeture, timeSlotConfig:', timeSlotConfig);
            const data = {
                shops,
                selectedShop,
                selectedWeek,
                timeSlotConfig,
                ...Object.fromEntries(
                    Object.keys(localStorage).filter(key =>
                        key.startsWith('employees_') ||
                        key.startsWith('selected_employees_') ||
                        key.startsWith('planning_') ||
                        key.startsWith('copied_') ||
                        key.startsWith('lastPlanning_')
                    ).map(key => [key, loadFromLocalStorage(key)])
                )
            };
            saveToFirebase(data);
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [shops, selectedShop, selectedWeek, timeSlotConfig]);

    // Handle adding a shop
    const handleAddShop = (shopName) => {
        console.log('handleAddShop appelé:', { shopName });
        if (shopName && !shops.includes(shopName)) {
            const newShops = [...shops, shopName];
            setShops(newShops);
            saveToLocalStorage('shops', newShops);
            setSelectedShop(shopName);
            setCurrentStep('week');
        }
    };

    // Handle selecting a shop
    const handleSelectShop = (shop) => {
        console.log('handleSelectShop appelé:', { shop });
        setSelectedShop(shop);
        saveToLocalStorage('selectedShop', shop);
        setCurrentStep('week');
    };

    // Handle deleting a shop
    const handleDeleteShop = (shop) => {
        console.log('handleDeleteShop appelé:', { shop });
        const newShops = shops.filter(s => s !== shop);
        setShops(newShops);
        setSelectedShop('');
        saveToLocalStorage('shops', newShops);
        saveToLocalStorage('selectedShop', '');
        localStorage.removeItem(`employees_${shop}`);
        localStorage.removeItem(`selected_employees_${shop}_${selectedWeek}`);
        localStorage.removeItem(`planning_${shop}_${selectedWeek}`);
        setCurrentStep('config');
    };

    // Handle selecting a week
    const handleSelectWeek = (week) => {
        console.log('handleSelectWeek appelé:', { week, timeSlotConfig });
        setSelectedWeek(week);
        saveToLocalStorage('selectedWeek', week);
        if (
            timeSlotConfig?.interval &&
            Array.isArray(timeSlotConfig?.timeSlots) &&
            timeSlotConfig.timeSlots.length > 0
        ) {
            console.log('timeSlotConfig valide dans l\'état, passage à employees:', timeSlotConfig);
            setCurrentStep('employees');
        } else {
            console.log('timeSlotConfig non valide dans l\'état, passage à config:', timeSlotConfig);
            setCurrentStep('config');
        }
    };

    // Handle setting time slot configuration
    const handleSetTimeSlotConfig = (config) => {
        console.log('handleSetTimeSlotConfig appelé:', { config });
        setTimeSlotConfig(config);
        saveToLocalStorage('timeSlotConfig', config);
        setCurrentStep('shop');
    };

    // Handle navigation to next step
    const goToNextStep = () => {
        console.log('goToNextStep appelé, étape actuelle:', currentStep);
        const steps = ['config', 'shop', 'week', 'employees', 'planning'];
        const currentIndex = steps.indexOf(currentStep);
        if (currentIndex < steps.length - 1) {
            setCurrentStep(steps[currentIndex + 1]);
            console.log('Nouvelle étape:', steps[currentIndex + 1]);
        }
    };

    // Handle navigation to previous step
    const goToPreviousStep = () => {
        console.log('goToPreviousStep appelé, étape actuelle:', currentStep);
        const steps = ['config', 'shop', 'week', 'employees', 'planning'];
        const currentIndex = steps.indexOf(currentStep);
        if (currentIndex > 0) {
            setCurrentStep(steps[currentIndex - 1]);
            console.log('Nouvelle étape:', steps[currentIndex - 1]);
        }
    };

    // Export data to JSON
    const handleExportToJson = () => {
        console.log('handleExportToJson appelé');
        const data = {
            shops,
            selectedShop,
            selectedWeek,
            timeSlotConfig,
            ...Object.fromEntries(
                Object.keys(localStorage).filter(key =>
                    key.startsWith('employees_') ||
                    key.startsWith('selected_employees_') ||
                    key.startsWith('planning_') ||
                    key.startsWith('copied_') ||
                    key.startsWith('lastPlanning_')
                ).map(key => [key, loadFromLocalStorage(key)])
            )
        };
        const fileData = JSON.stringify(data, null, 2);
        const blob = new Blob([fileData], { type: 'application/json' });
        saveAs(blob, `planning_export_${format(new Date(), 'yyyy-MM-dd')}.json`);
    };

    // Import data from JSON
    const handleImportFromJson = (event) => {
        console.log('Import JSON déclenché', event.target.files);
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                console.log('Fichier lu', e.target.result);
                try {
                    const data = JSON.parse(e.target.result);
                    const errors = validateImportedData(data);
                    if (errors.length > 0) {
                        console.error('Erreurs de validation:', errors);
                        alert(`Erreur dans les données importées:\n${errors.join('\n')}`);
                        return;
                    }
                    cleanLocalStorage();
                    Object.keys(data).forEach(key => {
                        console.log(`Saving to localStorage: ${key}`, data[key]);
                        saveToLocalStorage(key, data[key]);
                        if (key === 'shops') setShops(data[key]);
                        else if (key === 'selectedShop') setSelectedShop(data[key]);
                        else if (key === 'selectedWeek') setSelectedWeek(data[key]);
                        else if (key === 'timeSlotConfig') setTimeSlotConfig(data[key] || {});
                    });
                    saveToFirebase(data);
                    console.log('Données importées, timeSlotConfig:', data.timeSlotConfig);
                    if (
                        data.timeSlotConfig?.interval &&
                        Array.isArray(data.timeSlotConfig?.timeSlots) &&
                        data.timeSlotConfig.timeSlots.length > 0 &&
                        data.selectedShop &&
                        data.selectedWeek &&
                        data[`selected_employees_${data.selectedShop}_${data.selectedWeek}`]?.length > 0
                    ) {
                        setCurrentStep('planning');
                    } else {
                        setCurrentStep('config');
                    }
                    alert('Succès: Données importées avec succès depuis le fichier JSON');
                } catch (error) {
                    console.error('Erreur lors de la lecture du JSON:', error);
                    alert('Erreur: Impossible de lire le fichier JSON');
                }
            };
            reader.readAsText(file);
        }
    };

    // Validate imported data
    const validateImportedData = (data) => {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        const validKeys = [
            'shops',
            'selectedWeek',
            'timeSlotConfig',
            'selectedShop',
            'selected_employees__2025-07-07',
            'planning__2025-07-07',
            'lastPlanning_PORT GRIMAUD',
            'copied_PORT GRIMAUD_2025-07-14'
        ];
        const errors = [];

        for (const key in data) {
            if (!validKeys.includes(key) && !key.startsWith('employees_') && !key.startsWith('selected_employees_') && !key.startsWith('planning_') && !key.startsWith('copied_') && !key.startsWith('lastPlanning_')) {
                errors.push(`Clé non reconnue: ${key}`);
            }
            if (key === 'shops' && !Array.isArray(data[key])) {
                errors.push('Les boutiques doivent être un tableau');
            }
            if (key === 'selectedWeek' && data[key] && !dateRegex.test(data[key])) {
                errors.push('La semaine sélectionnée doit être au format yyyy-MM-dd');
            }
            if (key === 'timeSlotConfig' && data[key]) {
                if (!data[key].interval || !data[key].startTime || !data[key].endTime || !Array.isArray(data[key].timeSlots)) {
                    errors.push('timeSlotConfig doit contenir interval, startTime, endTime, et timeSlots (tableau)');
                }
            }
            if (key === 'selectedShop' && data[key] && !data.shops.includes(data[key])) {
                errors.push('selectedShop doit être une boutique valide dans shops');
            }
            if (key.startsWith('employees_') && !Array.isArray(data[key])) {
                errors.push(`Les employés (${key}) doivent être un tableau`);
            }
            if (key.startsWith('selected_employees_') && !Array.isArray(data[key])) {
                errors.push(`Les employés sélectionnés (${key}) doivent être un tableau`);
            }
        }
        return errors;
    };

    // Reset all data
    const handleResetData = () => {
        console.log('handleResetData appelé');
        cleanLocalStorage();
        setShops([]);
        setSelectedShop('');
        setSelectedWeek('');
        setTimeSlotConfig({});
        saveToFirebase({});
        setCurrentStep('config');
        alert('Toutes les données ont été réinitialisées');
    };

    return (
        <div className="app">
            <h1>Planning App</h1>
            {currentStep === 'config' && (
                <TimeSlotConfig
                    timeSlotConfig={timeSlotConfig}
                    setTimeSlotConfig={handleSetTimeSlotConfig}
                    onBack={goToPreviousStep}
                    onNext={goToNextStep}
                    onReset={handleResetData}
                    config={timeSlotConfig}
                    handleImportFromJson={handleImportFromJson}
                />
            )}
            {currentStep === 'shop' && (
                <ShopSelection
                    shops={shops}
                    selectedShop={selectedShop}
                    onAddShop={handleAddShop}
                    onSelectShop={handleSelectShop}
                    onDeleteShop={handleDeleteShop}
                    onNext={goToNextStep}
                    onBack={goToPreviousStep}
                    onReset={handleResetData}
                />
            )}
            {currentStep === 'week' && (
                <WeekSelection
                    selectedWeek={selectedWeek}
                    onSelectWeek={handleSelectWeek}
                    onBack={goToPreviousStep}
                    onNext={goToNextStep}
                    selectedShop={selectedShop}
                    onReset={handleResetData}
                />
            )}
            {currentStep === 'employees' && (
                <EmployeeSelection
                    shop={selectedShop}
                    selectedWeek={selectedWeek}
                    onBack={goToPreviousStep}
                    onNext={goToNextStep}
                    onReset={handleResetData}
                    selectedShop={selectedShop}
                    selectedEmployees={loadFromLocalStorage(`selected_employees_${selectedShop}_${selectedWeek}`, [])}
                    selectedWeek={selectedWeek}
                />
            )}
            {currentStep === 'planning' && selectedShop && selectedWeek && timeSlotConfig?.interval && Array.isArray(timeSlotConfig?.timeSlots) && timeSlotConfig.timeSlots.length > 0 && (
                <PlanningDisplay
                    config={timeSlotConfig}
                    shop={selectedShop}
                    selectedWeek={selectedWeek}
                    selectedEmployees={loadFromLocalStorage(`selected_employees_${selectedShop}_${selectedWeek}`, [])}
                    planning={loadFromLocalStorage(`planning_${selectedShop}_${selectedWeek}`, {})}
                    onBack={goToPreviousStep}
                    onBackToShop={() => setCurrentStep('shop')}
                    onBackToWeek={() => setCurrentStep('week')}
                    onBackToConfig={() => setCurrentStep('config')}
                    onReset={() => setCurrentStep('employees')}
                    handleExportToJson={handleExportToJson}
                    handleResetData={handleResetData}
                />
            )}
        </div>
    );
}

export default App;