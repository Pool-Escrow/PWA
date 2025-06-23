import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query'
import { createServerActionsKeyFactory, setupServerActionHooks } from 'zsa-react-query'

export const QueryKeyFactory = createServerActionsKeyFactory({
    createUserAction: () => ['createUserAction'],
    getAdminStatusAction: () => ['getAdminStatusAction'],
    getUpcomingPoolsAction: () => ['getUpcomingPoolsAction'],
    getUserInfoAction: () => ['getUserInfoAction'],
    getUserPastPoolsAction: () => ['getUserPastPoolsAction'],
    getUserUpcomingPoolsAction: () => ['getUserUpcomingPoolsAction'],
})

const { useServerActionQuery, useServerActionMutation, useServerActionInfiniteQuery } = setupServerActionHooks({
    hooks: {
        useQuery: useQuery,
        useMutation: useMutation,
        useInfiniteQuery: useInfiniteQuery,
    },
    queryKeyFactory: QueryKeyFactory,
})

export { useServerActionInfiniteQuery, useServerActionMutation, useServerActionQuery }
