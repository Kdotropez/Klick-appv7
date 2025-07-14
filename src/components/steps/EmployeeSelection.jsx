import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { saveToLocalStorage, loadFromLocalStorage } from '../../utils/localStorage';
import Button from '../common/Button';
import '../../assets/styles.css';

const EmployeeSelection = ({ onNext, onBack, onReset, selectedShop, selectedEmployees, selectedWeek }) => {
    const [employees, setEmployees] = useState(loadFromLocalStorage(`employees_${selectedShop}`, []) || []);
    const [newEmployee, setNewEmployee] = useState('');
    const [currentEmployees, setCurrentEmployees] = useState(loadFromLocalStorage(`selected_employees_${selectedShop}_${selectedWeek}`, selectedEmployees || []) || []);
    const [feedback, setFeedback] = useState('');
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetEmployee, setResetEmployee] = useState('');

    useEffect(() => {
        const storedEmployees = loadFromLocalStorage(`employees_${selectedShop}`, []);
        setEmployees(storedEmployees);
        const storedSelectedEmployees = loadFromLocalStorage(`selected_employees_${selectedShop}_${selectedWeek}`, selectedEmployees || []);
        setCurrentEmployees(storedSelectedEmployees.filter(emp => storedEmployees.includes(emp)));
        console.log('Loaded employees for shop:', selectedShop, storedEmployees, 'Selected:', storedSelectedEmployees);
    }, [selectedShop, selectedWeek, selectedEmployees]);

    const handleAddEmployee = () => {
        if (!newEmployee.trim()) {
            setFeedback('Erreur: Veuillez entrer un nom d\'employé valide.');
            return;
        }
        const newEmployeeUpperCase = newEmployee.trim().toUpperCase();
        if (employees.includes(newEmployeeUpperCase)) {
            setFeedback('Erreur: Cet employé existe déjà.');
            return;
        }

        const updatedEmployees = [...employees, newEmployeeUpperCase];
        setEmployees(updatedEmployees);
        setCurrentEmployees([...currentEmployees, newEmployeeUpperCase]);
        saveToLocalStorage(`employees_${selectedShop}`, updatedEmployees);
        saveToLocalStorage(`selected_employees_${selectedShop}_${selectedWeek}`, [...currentEmployees, newEmployeeUpperCase]);
        setNewEmployee('');
        setFeedback('Succès: Employé ajouté avec succès.');
        console.log('Added new employee:', newEmployeeUpperCase, 'Updated employees:', updatedEmployees);
    };

    const handleEmployeeSelect = (employee) => {
        if (currentEmployees.includes(employee)) {
            setCurrentEmployees(currentEmployees.filter(emp => emp !== employee));
        } else {
            setCurrentEmployees([...currentEmployees, employee]);
        }
        setFeedback('');
    };

    const handleNext = () => {
        if (currentEmployees.length === 0) {
            setFeedback('Erreur: Veuillez sélectionner au moins un employé.');
            return;
        }
        saveToLocalStorage(`selected_employees_${selectedShop}_${selectedWeek}`, currentEmployees);
        onNext(currentEmployees);
    };

    const handleReset = () => {
        console.log('Opening reset modal:', { employees });
        setShowResetModal(true);
    };

    const confirmReset = () => {
        console.log('Confirm reset:', { resetEmployee, employees });
        if (!resetEmployee) {
            setFeedback('Erreur: Veuillez sélectionner une option.');
            return;
        }

        if (resetEmployee === 'all') {
            setEmployees([]);
            setCurrentEmployees([]);
            setFeedback('Succès: Tous les employés ont été réinitialisés.');
            saveToLocalStorage(`employees_${selectedShop}`, []);
            saveToLocalStorage(`selected_employees_${selectedShop}_${selectedWeek}`, []);
            const planningKeys = Object.keys(localStorage).filter(key => key.startsWith(`planning_${selectedShop}_`));
            planningKeys.forEach(key => localStorage.removeItem(key));
            console.log(`Cleared all employees and plannings for shop ${selectedShop}`);
        } else {
            const updatedEmployees = employees.filter(emp => emp !== resetEmployee);
            setEmployees(updatedEmployees);
            setCurrentEmployees(currentEmployees.filter(emp => emp !== resetEmployee));
            saveToLocalStorage(`employees_${selectedShop}`, updatedEmployees);
            saveToLocalStorage(`selected_employees_${selectedShop}_${selectedWeek}`, currentEmployees.filter(emp => emp !== resetEmployee));
            const planningKeys = Object.keys(localStorage).filter(key => key.startsWith(`planning_${selectedShop}_`));
            planningKeys.forEach(key => {
                const planning = loadFromLocalStorage(key, {});
                const updatedPlanning = { ...planning };
                delete updatedPlanning[resetEmployee];
                if (Object.keys(updatedPlanning).length > 0) {
                    saveToLocalStorage(key, updatedPlanning);
                } else {
                    localStorage.removeItem(key);
                }
            });
            console.log(`Cleared data for employee ${resetEmployee} from shop ${selectedShop}`);
        }

        setShowResetModal(false);
        setResetEmployee('');
    };

    return (
        <div className="employee-selection-container">
            <div style={{
                fontFamily: 'Roboto, sans-serif',
                fontSize: '24px',
                fontWeight: '700',
                textAlign: 'center',
                marginBottom: '15px',
                padding: '10px',
                backgroundColor: '#f5f5f5',
                border: '1px solid #ccc',
                borderRadius: '4px',
                width: 'fit-content',
                maxWidth: '600px',
                marginLeft: 'auto',
                marginRight: 'auto'
            }}>
                {selectedShop || 'Aucune boutique sélectionnée'}
            </div>
            <h2 style={{ fontFamily: 'Roboto, sans-serif', textAlign: 'center' }}>
                Sélection des employés
            </h2>
            {feedback && (
                <p style={{ fontFamily: 'Roboto, sans-serif', textAlign: 'center', color: feedback.includes('Succès') ? '#4caf50' : '#e53935', marginBottom: '10px' }}>
                    {feedback}
                </p>
            )}
            <div className="employee-input" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', marginBottom: '10px' }}>Ajouter un employé</h3>
                <input
                    type="text"
                    value={newEmployee}
                    onChange={(e) => setNewEmployee(e.target.value)}
                    placeholder="Nom de l'employé"
                    style={{ padding: '8px', fontSize: '14px', width: '200px', marginBottom: '10px' }}
                />
                <Button
                    className="button-base button-primary"
                    onClick={handleAddEmployee}
                    style={{ backgroundColor: '#1e88e5', color: '#fff', padding: '8px 16px', fontSize: '14px' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1565c0'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1e88e5'}
                >
                    Ajouter
                </Button>
            </div>
            <div className="employee-selector" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', marginBottom: '10px' }}>Employés existants</h3>
                {employees.length === 0 ? (
                    <p style={{ fontFamily: 'Roboto, sans-serif', color: '#e53935', textAlign: 'center' }}>
                        Aucun employé disponible.
                    </p>
                ) : (
                    <ul style={{ listStyle: 'none', padding: 0, width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {employees.map(employee => (
                            <li key={employee} style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                                <div
                                    style={{
                                        width: '250px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        padding: '8px',
                                        backgroundColor: currentEmployees.includes(employee) ? '#f28c38' : '#f5f5f5',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => handleEmployeeSelect(employee)}
                                >
                                    <span style={{
                                        fontFamily: 'Roboto, sans-serif',
                                        fontSize: '14px',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        color: currentEmployees.includes(employee) ? '#fff' : '#000'
                                    }}>
                                        {employee}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <div className="navigation-buttons" style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
                <Button className="button-base button-retour" onClick={onBack}>
                    Retour
                </Button>
                <Button className="button-base button-primary" onClick={handleNext}>
                    Valider
                </Button>
                <Button className="button-base button-reinitialiser" onClick={handleReset}>
                    Réinitialiser
                </Button>
            </div>
            {showResetModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="modal-close" onClick={() => setShowResetModal(false)}>
                            ✕
                        </button>
                        <h3 style={{ fontFamily: 'Roboto, sans-serif', textAlign: 'center' }}>
                            Confirmer la réinitialisation
                        </h3>
                        <div className="form-group">
                            <label>Réinitialiser</label>
                            <select value={resetEmployee} onChange={(e) => setResetEmployee(e.target.value)}>
                                <option value="">Choisir une option</option>
                                <option value="all">Tous les employés</option>
                                {employees.map(employee => (
                                    <option key={employee} value={employee}>{employee}</option>
                                ))}
                            </select>
                        </div>
                        <div className="button-group">
                            <Button className="button-base button-primary" onClick={confirmReset}>
                                Confirmer
                            </Button>
                            <Button className="button-base button-retour" onClick={() => setShowResetModal(false)}>
                                Annuler
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeSelection;