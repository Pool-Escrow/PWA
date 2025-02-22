/**
 * @file src/components/my-pools/my-pools.tabs.config.ts
 * @description This file contains the configuration for the tabs in the MyPools component.
 */

export interface MyPoolsTab {
    id: 'active' | 'past'
    name: 'Active' | 'Past'
}

export type MyPoolsTabsConfig = MyPoolsTab[]

export const myPoolsTabsConfig: MyPoolsTabsConfig = [
    { id: 'active', name: 'Active' },
    { id: 'past', name: 'Past' },
]
