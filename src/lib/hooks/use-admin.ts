import { useQuery } from '@tanstack/react-query'
import { fetchIsUserAdmin } from '../database/is-admin'

export const useAdmin = () => {
    const {
        data: adminData,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['fetchIsUserAdmin'],
        queryFn: fetchIsUserAdmin,
    })
    console.log('useAdmin', adminData, isLoading, error)
    return { adminData, isLoading, error }
}
