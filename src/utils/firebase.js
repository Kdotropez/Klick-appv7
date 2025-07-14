import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyBFwXsuIi2khC6xQwBR4_zjgRQWA7MaREo",
    authDomain: "klick-planning-v7.firebaseapp.com",
    databaseURL: "https://klick-planning-v7-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "klick-planning-v7",
    storageBucket: "klick-planning-v7.firebasestorage.app",
    messagingSenderId: "702907373031",
    appId: "1:702907373031:web:8a0aba905994b1e4e31942",
    measurementId: "G-6YBWL41WYM"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export const saveToFirebase = async (data) => {
    try {
        await set(ref(database, 'planning-data'), data);
        console.log('Données sauvegardées sur Firebase');
    } catch (error) {
        console.error('Erreur lors de la sauvegarde sur Firebase:', error);
    }
};

export const loadFromFirebase = async () => {
    try {
        const snapshot = await get(ref(database, 'planning-data'));
        if (snapshot.exists()) {
            return snapshot.val();
        } else {
            console.log('Aucune donnée trouvée sur Firebase');
            return null;
        }
    } catch (error) {
        console.error('Erreur lors du chargement depuis Firebase:', error);
        return null;
    }
};