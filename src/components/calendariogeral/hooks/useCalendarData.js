import { useState, useEffect } from 'react';
import { getReservations, getRooms } from '../../../services/authService';

export const useCalendarData = () => {
    const [reservations, setReservations] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError("");
                
                const [reservationsData, roomsData] = await Promise.all([
                    getReservations({ status: 'approved' }),
                    getRooms()
                ]);
                
                setReservations(reservationsData || []);
                setRooms(roomsData || []);
                
            } catch (err) {
                console.error("Erro ao carregar dados:", err);
                setError("Erro ao carregar dados: " + (err.message || "Erro desconhecido"));
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    return {
        reservations,
        rooms,
        loading,
        error,
        setError
    };
};

