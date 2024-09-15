import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query'
import { createServerActionsKeyFactory, setupServerActionHooks } from 'zsa-react-query'

export const QueryKeyFactory = createServerActionsKeyFactory({
    getUpcomingPoolsAction: () => ['getUpcomingPoolsAction'],
    getAdminStatusAction: () => ['getAdminStatusAction'],
    getUserInfoAction: () => ['getUserInfoAction'],
    getUserUpcomingPoolsAction: () => ['getUserUpcomingPoolsAction'],
    getUserPastPoolsAction: () => ['getUserPastPoolsAction'],
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