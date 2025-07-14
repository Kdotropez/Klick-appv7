import { useState, useEffect } from 'react';
import { saveToLocalStorage, loadFromLocalStorage } from '../../utils/localStorage';
import Button from '../common/Button';
import '../../assets/styles.css';

const ShopSelection = ({ onNext, onBack, onReset, selectedShop }) => {
    const [shops, setShops] = useState(loadFromLocalStorage('shops', []) || []);
    const [newShop, setNewShop] = useState('');
    const [currentShop, setCurrentShop] = useState(selectedShop || '');
    const [feedback, setFeedback] = useState('');
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetShop, setResetShop] = useState('');

    useEffect(() => {
        const storedShops = loadFromLocalStorage('shops', []) || [];
        setShops(storedShops);
        console.log('Loaded shops:', storedShops);
    }, []);

    const handleAddShop = () => {
        console.log('handleAddShop appelé:', { newShop });
        if (!newShop.trim()) {
            setFeedback('Erreur: Veuillez entrer un nom de boutique valide.');
            return;
        }
        const newShopUpperCase = newShop.trim().toUpperCase();
        if (shops.includes(newShopUpperCase)) {
            setFeedback('Erreur: Cette boutique existe déjà.');
            return;
        }

        const updatedShops = [...shops, newShopUpperCase];
        setShops(updatedShops);
        saveToLocalStorage('shops', updatedShops);
        setCurrentShop(newShopUpperCase);
        setNewShop('');
        setFeedback('Succès: Boutique ajoutée avec succès.');
        console.log('Added new shop:', newShopUpperCase, 'Updated shops:', updatedShops);
        onNext(newShopUpperCase);
    };

    const handleShopSelect = (shop) => {
        console.log('handleShopSelect appelé:', { shop });
        setCurrentShop(shop);
        setFeedback('');
    };

    const handleNext = () => {
        console.log('handleNext appelé, currentShop:', currentShop);
        if (!currentShop) {
            setFeedback('Erreur: Veuillez sélectionner une boutique.');
            return;
        }
        onNext(currentShop);
    };

    const handleReset = () => {
        console.log('handleReset appelé:', { shops });
        setShowResetModal(true);
    };

    const confirmReset = () => {
        console.log('confirmReset appelé:', { resetShop, shops });
        if (!resetShop) {
            setFeedback('Erreur: Veuillez sélectionner une option.');
            return;
        }

        if (resetShop === 'all') {
            setShops([]);
            setCurrentShop('');
            setFeedback('Succès: Toutes les boutiques ont été réinitialisées.');
            saveToLocalStorage('shops', []);
            const keysToRemove = Object.keys(localStorage).filter(key =>
                key.startsWith('employees_') || key.startsWith('planning_') || key.startsWith('copied_') || key.startsWith('lastPlanning_')
            );
            keysToRemove.forEach(key => localStorage.removeItem(key));
            console.log('Cleared all shop-related data from localStorage');
        } else {
            const updatedShops = shops.filter(shop => shop !== resetShop);
            setShops(updatedShops);
            saveToLocalStorage('shops', updatedShops);
            if (currentShop === resetShop) {
                setCurrentShop('');
            }
            setFeedback(`Succès: Boutique ${resetShop} réinitialisée.`);
            const keysToRemove = Object.keys(localStorage).filter(key =>
                key.startsWith(`employees_${resetShop}`) ||
                key.startsWith(`planning_${resetShop}_`) ||
                key.startsWith(`copied_${resetShop}_`) ||
                key.startsWith(`lastPlanning_${resetShop}`)
            );
            keysToRemove.forEach(key => localStorage.removeItem(key));
            console.log(`Cleared data for shop ${resetShop} from localStorage`);
        }

        setShowResetModal(false);
        setResetShop('');
    };

    return (
        <div className="shop-selection-container">
            <h2 style={{ fontFamily: 'Roboto, sans-serif', textAlign: 'center' }}>
                Sélection de la boutique
            </h2>
            {feedback && (
                <p style={{ fontFamily: 'Roboto, sans-serif', textAlign: 'center', color: feedback.includes('Succès') ? '#4caf50' : '#e53935', marginBottom: '10px' }}>
                    {feedback}
                </p>
            )}
            <div className="shop-input" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', marginBottom: '10px' }}>Ajouter une boutique</h3>
                <input
                    type="text"
                    value={newShop}
                    onChange={(e) => setNewShop(e.target.value)}
                    placeholder="Nom de la boutique"
                    style={{ padding: '8px', fontSize: '14px', width: '200px', marginBottom: '10px' }}
                />
                <Button
                    className="button-base button-primary"
                    onClick={handleAddShop}
                    style={{ backgroundColor: '#1e88e5', color: '#fff', padding: '8px 16px', fontSize: '14px' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1565c0'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1e88e5'}
                >
                    Ajouter
                </Button>
            </div>
            <div className="shop-selector" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', marginBottom: '10px' }}>Boutiques existantes</h3>
                {shops.length === 0 ? (
                    <p style={{ fontFamily: 'Roboto, sans-serif', color: '#e53935', textAlign: 'center' }}>
                        Aucune boutique disponible.
                    </p>
                ) : (
                    <ul style={{ listStyle: 'none', padding: 0, width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {shops.map(shop => (
                            <li key={shop} style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                                <div
                                    style={{
                                        width: '250px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        padding: '8px',
                                        backgroundColor: currentShop === shop ? '#f28c38' : '#f5f5f5',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => handleShopSelect(shop)}
                                >
                                    <span style={{
                                        fontFamily: 'Roboto, sans-serif',
                                        fontSize: '14px',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        color: currentShop === shop ? '#fff' : '#000'
                                    }}>
                                        {shop}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <div className="navigation-buttons" style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
                <Button className="button-base button-retour" onClick={() => {
                    console.log('Retour clicked in ShopSelection');
                    onBack();
                }}>
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
                            <select value={resetShop} onChange={(e) => setResetShop(e.target.value)}>
                                <option value="">Choisir une option</option>
                                <option value="all">Toutes les boutiques</option>
                                {shops.map(shop => (
                                    <option key={shop} value={shop}>{shop}</option>
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

export default ShopSelection;