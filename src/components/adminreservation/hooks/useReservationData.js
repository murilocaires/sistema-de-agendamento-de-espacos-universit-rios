import { useState, useEffect } from 'react';
import { getRooms, getUsers, getReservations } from '../../../services/authService';

export const useReservationData = () => {
    const [rooms, setRooms] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [allReservations, setAllReservations] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const [roomsData, usersData, reservationsData] = await Promise.all([
                    getRooms(),
                    getUsers(),
                    getReservations({ status: 'approved' })
                ]);
                
                setRooms(roomsData.filter(room => room.is_active));
                setUsers(usersData);
                setAllReservations(reservationsData || []);
                setError("");
            } catch (err) {
                setError("Erro ao carregar dados: " + err.message);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const refreshReservations = async () => {
        try {
            const reservationsData = await getReservations({ status: 'approved' });
            setAllReservations(reservationsData || []);
        } catch (err) {
            console.error('Erro ao recarregar reservas:', err);
        }
    };

    return {
        rooms,
        users,
        loading,
        allReservations,
        error,
        setError,
        refreshReservations
    };
};

