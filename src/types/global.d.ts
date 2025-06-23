import type { poolAddress } from './contracts'

declare global {
    type LayoutWithSlots<T extends string> = {
        [K in T]: React.ReactNode
    }

    type ChainId = keyof typeof poolAddress

    // eslint-disable-next-line no-var
    var __serverConfigLogged: boolean | undefined
    // eslint-disable-next-line no-var
    var __rpcConfigLogged: Record<number, boolean> | undefined
    // eslint-disable-next-line no-var
    var __transportConfigLogged: boolean | undefined
    // eslint-disable-next-line no-var
    var __serverInitLogged: boolean | undefined
    // eslint-disable-next-line no-var
    var __contractAddressLogged: boolean | undefined
    // eslint-disable-next-line no-var
    var __explorerUrlLogged: boolean | undefined
    // eslint-disable-next-line no-var
    var __lastLoggedPath: string | undefined
    // eslint-disable-next-line no-var
    var __lastBalanceValidation: string | undefined
    // eslint-disable-next-line no-var
    var __lastPoolsBalanceValidation: string | undefined
    // eslint-disable-next-line no-var
    var __lastChainSelectorLog: string | undefined
    // eslint-disable-next-line no-var
    var __privyConfigLogged: boolean | undefined
    // eslint-disable-next-line no-var
    var __supabaseClientConfigLogged: boolean | undefined
    // eslint-disable-next-line no-var
    var __supabaseServerConfigLogged: boolean | undefined
    // eslint-disable-next-line no-var
    var __wagmiEnvLogged: boolean | undefined
    // eslint-disable-next-line no-var
    var __wagmiConfigLogged: boolean | undefined
    // eslint-disable-next-line no-var
    var __lastTransactionStatus: string | undefined
}

export {}
