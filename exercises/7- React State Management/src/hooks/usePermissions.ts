import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./useToast";
import type { Role, UserWithPermission } from "../types";
import { useAtom } from "jotai";
import { currentBoardAtom } from "../stores/boardStore";
import { BASE_URL } from "../constants/constants";
import { useAuth } from "./useAuth";

const queryKey = ['permissions'];

export const useGetPermissions = () => {
    const [ boardId ] = useAtom(currentBoardAtom);
    const { user } = useAuth();
    return useQuery({
        queryKey: [queryKey, boardId, user?.id],
        queryFn: async (): Promise<UserWithPermission[]> => {
            const response = await fetch(`${BASE_URL}/permissions/${boardId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Error al obtener los permisos');
            }

            return response.json() as Promise<UserWithPermission[]>;
        }
    });
};

export const useGrantPermission = () => {
    const queryClient = useQueryClient();
    const toast = useToast();
    const [ boardId ] = useAtom(currentBoardAtom);
    
    return useMutation({
        mutationFn: async ({ email, role }: { email: string; role: Role }) => {
            const response = await fetch(`${BASE_URL}/permissions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ email, boardId, role })
            });

            const res = await response.json();

            if (!response.ok) {
                throw new Error(res.error || res.message);
            }

            return res;
        },
        mutationKey: ['permissions'],
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: [queryKey, boardId] });
            toast.success('✅ Permiso otorgado correctamente');
        },
        onError: (error) => {
            toast.error(`❌ Error al agregar permiso: ${error.message}`);
        }
    });
};

export const useRevokePermission = () => {
    const queryClient = useQueryClient();
    const toast = useToast();
    const [ boardId ] = useAtom(currentBoardAtom);
    
    return useMutation({
        mutationFn: async ({ userId, role }: { userId: string; role: Role }) => {
            const response = await fetch(`${BASE_URL}/permissions`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ userId, boardId, role })
            });

            if (!response.ok) {
                throw new Error('Error al revocar el permiso');
            }

            return response.json();
        },
        mutationKey: ['permissions'],
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: [queryKey, boardId] });
            toast.success('✅ Permiso revocado correctamente');
        },
        onError: (error) => {
            toast.error(`❌ Error al revocar permiso: ${error.message}`);
        }
    });
};