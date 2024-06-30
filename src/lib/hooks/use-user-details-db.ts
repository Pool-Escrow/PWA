import { useQuery } from '@tanstack/react-query'
import { fetchUserDetailsFromDB } from '../database/fetch-user-details-db'

export const useUserDetailsDB = (privyId: string) => {
    const {
        data: userDetailsDB,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['userDetailsDB', privyId],
        queryFn: fetchUserDetailsFromDB,
    })

    return { userDetailsDB, isLoading, error }
}
