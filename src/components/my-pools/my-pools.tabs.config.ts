/**
 * @file src/components/my-pools/my-pools.tabs.config.ts
 * @description This file contains the configuration for the tabs in the MyPools component.
 */

export interface MyPoolsTab {
    id: 'upcoming' | 'past'
    name: 'Upcoming' | 'Past'
}

export type MyPoolsTabsConfig = MyPoolsTab[]

export const myPoolsTabsConfig: MyPoolsTabsConfig = [
    { id: 'upcoming', name: 'Upcoming' },
    { id: 'past', name: 'Past' },
]
