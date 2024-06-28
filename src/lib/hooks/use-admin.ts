import { useQuery } from '@tanstack/react-query'
import { fetchIsUserAdmin } from '../database/is-admin'

export const useAdmin = () => {
    const {
        data: isAdmin,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['fetchIsUserAdmin'],
        queryFn: fetchIsUserAdmin,
    })
    console.log('useAdmin', isAdmin, isLoading, error)
    return { isAdmin, isLoading, error }
}
