import { useQuery } from '@tanstack/react-query'
import { fetchUserDetailsFromDB } from '../database/fetch-user-details-db'

export const useUserDetailsDB = (address: string) => {
    const {
        data: userDetailsDB,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['userDetailsDB', address],
        queryFn: fetchUserDetailsFromDB,
    })

    return { userDetailsDB, isLoading, error }
}
