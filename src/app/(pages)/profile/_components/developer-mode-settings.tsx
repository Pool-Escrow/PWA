'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useDeveloperModeAvailable, useDeveloperStore, type DeveloperSettings } from '@/stores/developer.store'
import { Settings, Zap } from 'lucide-react'
import { base, baseSepolia } from 'viem/chains'

const chainOptions = [
    { id: base.id, name: 'Base Mainnet', badge: 'MAINNET' },
    { id: baseSepolia.id, name: 'Base Sepolia', badge: 'TESTNET' },
]

export function DeveloperModeSettings() {
    const isAvailable = useDeveloperModeAvailable()
    const { settings, toggleDeveloperMode, setDefaultChainId, setSetting, resetSettings, isHydrated } =
        useDeveloperStore()

    // Don't show in production or before hydration
    if (!isAvailable || !isHydrated) {
        return null
    }

    const handleToggleSetting = (key: keyof DeveloperSettings) => {
        setSetting(key, !settings[key])
    }

    return (
        <Card className='border-dashed border-purple-300 bg-purple-50'>
            <CardHeader className='pb-3'>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                        <Settings className='size-4 text-purple-600' />
                        <CardTitle className='text-sm font-semibold text-purple-800'>Developer Mode</CardTitle>
                        <Badge variant='outline' className='border-purple-300 text-purple-600'>
                            DEVELOPMENT
                        </Badge>
                    </div>
                    <Switch
                        checked={settings.isEnabled}
                        onCheckedChange={toggleDeveloperMode}
                        aria-label='Toggle developer mode'
                    />
                </div>
                <CardDescription className='text-xs text-purple-600'>
                    Advanced debugging and development features
                </CardDescription>
            </CardHeader>

            {settings.isEnabled && (
                <CardContent className='space-y-4 pt-0'>
                    {/* Default Chain Setting */}
                    <div className='space-y-2'>
                        <Label className='text-xs font-medium text-purple-800'>Default Chain</Label>
                        <Select
                            value={settings.defaultChainId.toString()}
                            onValueChange={value => setDefaultChainId(Number(value))}>
                            <SelectTrigger className='h-8 text-xs'>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {chainOptions.map(chain => (
                                    <SelectItem key={chain.id} value={chain.id.toString()}>
                                        <div className='flex items-center gap-2'>
                                            <span>{chain.name}</span>
                                            <Badge variant='outline' className='text-xs'>
                                                {chain.badge}
                                            </Badge>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Feature Toggles */}
                    <div className='space-y-3'>
                        <Label className='text-xs font-medium text-purple-800'>Debug Features</Label>

                        <div className='space-y-2'>
                            <div className='flex items-center justify-between'>
                                <Label htmlFor='network-expanded' className='text-xs'>
                                    Network indicator expanded by default
                                </Label>
                                <Switch
                                    id='network-expanded'
                                    checked={settings.networkIndicatorExpanded}
                                    onCheckedChange={() => handleToggleSetting('networkIndicatorExpanded')}
                                />
                            </div>

                            <div className='flex items-center justify-between'>
                                <Label htmlFor='show-debug' className='text-xs'>
                                    Show debug options
                                </Label>
                                <Switch
                                    id='show-debug'
                                    checked={settings.showDebugOptions}
                                    onCheckedChange={() => handleToggleSetting('showDebugOptions')}
                                />
                            </div>

                            <div className='flex items-center justify-between'>
                                <Label htmlFor='show-chain-selector' className='text-xs'>
                                    Show chain selector
                                </Label>
                                <Switch
                                    id='show-chain-selector'
                                    checked={settings.showChainSelector}
                                    onCheckedChange={() => handleToggleSetting('showChainSelector')}
                                />
                            </div>

                            <div className='flex items-center justify-between'>
                                <Label htmlFor='show-network-indicator' className='text-xs'>
                                    Show network indicator
                                </Label>
                                <Switch
                                    id='show-network-indicator'
                                    checked={settings.showNetworkIndicator}
                                    onCheckedChange={() => handleToggleSetting('showNetworkIndicator')}
                                />
                            </div>

                            <div className='flex items-center justify-between'>
                                <Label htmlFor='show-debug-overlay' className='text-xs'>
                                    Show debug overlay (request monitor)
                                </Label>
                                <Switch
                                    id='show-debug-overlay'
                                    checked={settings.showDebugOverlay}
                                    onCheckedChange={() => handleToggleSetting('showDebugOverlay')}
                                />
                            </div>

                            {/* Pool visibility toggles */}
                            <div className='flex items-center justify-between'>
                                <Label htmlFor='only-contract-pools' className='text-xs'>
                                    Show ONLY contract pools
                                </Label>
                                <Switch
                                    id='only-contract-pools'
                                    checked={settings.showContractPoolsOnly}
                                    onCheckedChange={() => {
                                        // Ensure mutually exclusive toggles
                                        if (!settings.showContractPoolsOnly) {
                                            setSetting('showDatabasePoolsOnly', false)
                                        }
                                        handleToggleSetting('showContractPoolsOnly')
                                    }}
                                />
                            </div>

                            <div className='flex items-center justify-between'>
                                <Label htmlFor='only-db-pools' className='text-xs'>
                                    Show ONLY database pools
                                </Label>
                                <Switch
                                    id='only-db-pools'
                                    checked={settings.showDatabasePoolsOnly}
                                    onCheckedChange={() => {
                                        if (!settings.showDatabasePoolsOnly) {
                                            setSetting('showContractPoolsOnly', false)
                                        }
                                        handleToggleSetting('showDatabasePoolsOnly')
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Reset Settings */}
                    <div className='pt-2'>
                        <Button
                            onClick={resetSettings}
                            variant='outline'
                            size='sm'
                            className='w-full border-purple-300 text-purple-700 hover:bg-purple-100'>
                            <Zap className='mr-1 size-3' />
                            Reset to defaults
                        </Button>
                    </div>
                </CardContent>
            )}
        </Card>
    )
}
