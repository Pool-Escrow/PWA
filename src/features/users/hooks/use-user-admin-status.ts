export function useUserAdminStatus() {
    // const { getAccessToken, authenticated, ready } = usePrivy()
    // const queryClient = useQueryClient()
    // return useQuery({
    //     queryKey: ['userAdminStatus'],
    //     queryFn: async () => {
    //         if (!authenticated) {
    //             console.log('[useUserAdminStatus] User not authenticated')
    //             return { isAdmin: false }
    //         }
    //         // Check if we have prefetched data
    //         const prefetchedData = queryClient.getQueryData(['userAdminStatus'])
    //         if (prefetchedData !== undefined) {
    //             console.log('[useUserAdminStatus] Using prefetched data')
    //             return prefetchedData
    //         }
    //         try {
    //             const token = await getAccessToken()
    //             if (!token) {
    //                 console.log('[useUserAdminStatus] No token available')
    //                 return { isAdmin: false }
    //             }
    //             const isAdmin = await getUserAdminStatusActionWithToken(token)
    //             console.log('[useUserAdminStatus] Admin status:', isAdmin)
    //             return { isAdmin }
    //         } catch (error) {
    //             console.error('[useUserAdminStatus] Error checking admin status:', error)
    //             return { isAdmin: false }
    //         }
    //     },
    //     enabled: ready && authenticated,
    // })
}
