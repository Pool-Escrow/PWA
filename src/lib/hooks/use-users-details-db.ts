import { useQuery } from '@tanstack/react-query'
import { fetchUsersDetailsFromDB } from '../database/fetch-users-details-db'
import { fetchUserDetailsFromDB } from '../database/fetch-user-details-db'

export const useUsersDetailsDB = (addresses: readonly string[]) => {
    const {
        data: usersDetailsDB,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['usersDetailsDB', addresses],
        queryFn: fetchUsersDetailsFromDB,
    })

    return { usersDetailsDB, isLoading, error }
}
