/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
'use client'
import { use } from "chai";
import { API_paths, sendGetRequest, sendPostRequest, USDC_BASE } from "./utils";
import { useWallets } from "@privy-io/react-auth";
import { useEffect } from "react";
import { Button } from '@/app/_components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuPortal,
    DropdownMenuTrigger,
    DropdownMenuItem,
} from '@/app/_components/ui/dropdown-menu'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/_components/ui/select'
import {useSendTransaction} from '@privy-io/react-auth';
import {encodeFunctionData} from 'viem';

import * as React from "react"
import Image from "next/image"
import { ChevronDown, Search, X } from "lucide-react"
import { set } from "lodash";
import { wait } from "@testing-library/user-event/dist/cjs/utils/index.js";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/_components/ui/dialog";
import { Input } from "@/app/_components/ui/input";
import { ScrollArea } from "@radix-ui/react-scroll-area";



let networks = [
    {
        chainId:"8453",
        chainName:"Base",
        dexTokenApproveAddress:"0x57df6092665eb6058DE53939612413ff4B09114E"
    }


]

const tokens = [
  {
    decimals: "0",
    tokenContractAddress: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    tokenLogoUrl: "https://static.okx.com/cdn/web3/currency/token/137-0x1e4a5963abfd975d8c9021ce480b42188849d41d-1.png/type=default_350_0?v=1735291541821",
    tokenName: "Wrapped BTC",
    tokenSymbol: "WBTC",
  },
]

const CrossChainSwapSection = () => {
    const {sendTransaction} = useSendTransaction();
    const { wallets } = useWallets();
    const [fromNetwork, setFromNetwork] = React.useState(USDC_BASE[0])
    const [fromToken, setFromToken] = React.useState(tokens[0])
    const [fromAmount, setFromAmount] = React.useState("0.0")
    const [recievedAmount, setRecievedAmount] = React.useState("0.0")
    const [fetchedNetworks, setFetchedNetworks] = React.useState([])
    const [fetchedTokens, setFetchedTokens] = React.useState([])
    const [selectedNetwork, setSelectedNetwork] = React.useState("all")
    const [isSelectOpen, setIsSelectOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [isNetworkSelectOpen, setIsNetworkSelectOpen] = React.useState(false)



    // const filteredTokens = fetchedTokens.filter((token) => {
    //     const matchesNetwork = selectedNetwork === "all" || fromNetwork.chainId === selectedNetwork
    //     const matchesSearch =
    //       token.tokenSymbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    //       token.tokenName.toLowerCase().includes(searchQuery.toLowerCase())
    //     return matchesNetwork && matchesSearch
    //   })

    useEffect(() => {
        const {path, call} = API_paths['chains'];
        const connectedWallet = wallets[0];
        // console.log('connectedWallet', connectedWallet);
        // Get Chain Balances from RPC's
        if (connectedWallet) {
            console.log("PAAATH", path)
            const fetchChains = async () => {
                    let res = await sendGetRequest(path, null).then((res) => {
                    return res
                    }).catch((err) => {
                        console.log('err', err)
                    }).then((res) => {
                        if (res.data === undefined || res.code == "51000") {
                            setFromNetwork(USDC_BASE[0]);
                            if (fetchedNetworks.length == 0){
                                    setFetchedNetworks([USDC_BASE[0]]);
                                }
                            console.log('fetchedNetworks', fetchedNetworks)
                            return res;
                        }
                        else if (res.code === "50011") {
                            console.log('TIMEOUT');
                            wait(1000);
                            fetchRoute();
                        }
                        else{
                            networks = res?.data;
                            setFetchedNetworks(res.data);
                            console.log('networks', networks)
                            return res;
                        }
                    });
            }
            void fetchChains();
        }
    },[wallets])

    useEffect(() => {

        const fetchTokens = async () => {
            const {path, call} = API_paths['tokens'];
            const networkChainId = fromNetwork.chainId;
            let res = await sendGetRequest(path, {'chainId' : networkChainId}).then((res) => {
                console.log('res', res)
                return res
            }).catch((err) => {
                console.log('err', err)
            }).then((res) => {
                console.log(res);
                if (res === undefined) {
                    setFromToken(USDC_BASE[1]);
                    if (fetchedNetworks.length == 0){
                        setFetchedTokens([USDC_BASE[1]]);
                    }
                    return res;
                }
                else if (res.code === "50011" || res.code == "51000") {
                    console.log('TIMEOUT');
                    wait(1000);
                    fetchTokens();
                }
                else {
                    setFetchedTokens(res.data);
                    console.log('tokens', fetchedTokens)
                    return res;
                }
            });
        }

        fetchTokens();
    },[fromNetwork, selectedNetwork])

    useEffect(() => {
        console.log('fromAmount', fromAmount)
        const fetchRoute = async () => {
            const {path, call} = API_paths['route'];
            const params = {
                'fromChainId': fromNetwork.chainId,
                'toChainId': USDC_BASE[0].chainId,
                'fromTokenAddress': fromToken.tokenContractAddress,
                'toTokenAddress': USDC_BASE[1].tokenContractAddress,
                'amount': fromAmount,
                'slippage': 0.02
            }
            let res = await sendGetRequest(path, params).then((res) => {
                console.log('res', res)
                return res
            }).catch((err) => {
                console.log('err', err)
            }).then((res) => {
                console.log(res);
                if (res === undefined || res.code == "51000") {
                    console.log('codddddde')
                    return res;
                }
                else if (res.code == "50011") {
                    console.log('TIMEOUT');
                    wait(1000);
                    fetchRoute();
                }
                else {
                    setRecievedAmount(res.data[0].routerList[0].toTokenAmount);
                    return res;
                }
            });
        }
        fetchRoute();
    }, [fromAmount])


    const handleApproveBridge = async () => {

        console.log('|||||||||||||||||||handleApproveBridge')
        const provider = await wallets[0].getEthereumProvider();
        console.log('CHAIIIIIN', wallets[0].chainId)
        const {path, call} = API_paths['approve'];
        const params = {
            'chainId': fromNetwork.chainId,
            'tokenContractAddress': fromToken.tokenContractAddress,
            'approveAmount': fromAmount
        }
        let res = await sendGetRequest(path, params).then(async (res) => {
            console.log('res', res)
            const data = res.data[0].data;
            const dexAddress = res.data[0].dexContractAddress;
            const txRequest = {
                gasLimit: res.data[0].gasLimit,
                from: wallets[0].address,
                to: dexAddress,
                data: data,
                value: '0x0',
            }
            console.log('txRequest', txRequest)
            await provider.request({
                method: 'eth_sendTransaction',
                params: [txRequest],
            }).then((res) => {
                console.log('res', res)
                return res;
            }).catch((err) => { console.log('err', err) });

        }).catch((err) => {
            console.log('err', err)
        }).then((res) => {
            console.log(res);
            if (res === undefined || res.code == "51000") {
                return res;
            }
            else if (res.code == "50011") {
                console.log('TIMEOUT');
                wait(1000);
                handleApproveBridge();
            }
            else {
                return res;
            }
        });
    }
    return (
        <div className="w-full max-w-md mx-auto space-y-4 p-4">
            {/* Network Selection Dialog */}
      <Dialog open={isNetworkSelectOpen} onOpenChange={setIsNetworkSelectOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle>Select network</DialogTitle>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsNetworkSelectOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search networks" className="pl-9" />
          </div>
          <ScrollArea className="h-[300px] pr-4">
            <div className="grid grid-cols-2 gap-2">
              {fetchedNetworks.slice(1).map((network) => (
                <Button
                  key={network.chainId}
                  variant="outline"
                  className="justify-start h-12"
                  onClick={() => {
                    setFromNetwork(network)
                    setSelectedNetwork(network.chainId)
                    setIsNetworkSelectOpen(false)
                  }}
                >
                  {network.chainName}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
          {/* Token Selection Dialog */}
          <Dialog open={isSelectOpen} onOpenChange={setIsSelectOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader className="flex flex-row items-center justify-between">
                <DialogTitle>Select pay token</DialogTitle>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsSelectOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </DialogHeader>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search token name or address"
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {/* <div className="flex gap-2 overflow-x-auto py-2">
                {fetchedNetworks.map((network) => (
                  <Button
                    key={network.chainId}
                    variant={selectedNetwork === network.chainId ? "default" : "outline"}
                    size="sm"
                    onClick={() => {setSelectedNetwork(network.chainId); setFromNetwork(network)}}
                    // className="flex items-center gap-2 px-2 py-1"
                  >
                    {network.chainName}
                  </Button>
                ))}
              </div> */}
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-2">
                  {fetchedTokens.map((token) => (
                    <Button
                      key={token.tokenSymbol}
                      variant="ghost"
                      className="w-full justify-start gap-3"
                      onClick={() => {
                        setFromToken(token)
                        setIsSelectOpen(false)
                      }}
                    >
                      <Image
                        src={token.tokenLogoUrl || "/placeholder.svg"}
                        alt={token.tokenName}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{token.tokenSymbol}</span>
                        <span className="text-sm text-muted-foreground">{token.tokenName}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>

          {/* From Section */}
          <div className="rounded-lg border bg-card p-4 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Button variant="outline" className="gap-2" onClick={() => setIsNetworkSelectOpen(true)}>
                  {fromNetwork.chainName}
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="gap-2" onClick={() => setIsSelectOpen(true)}>
                  <Image
                    src={fromToken.tokenLogoUrl || "/placeholder.svg"}
                    alt={fromToken.tokenName}
                    width={20}
                    height={20}
                    className="rounded-full"
                  />
                  {fromToken.tokenSymbol}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
              <input
                type="number"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                className="w-24 text-right bg-transparent"
              />
            </div>
          </div>

          {/* To Section */}
          <div className="rounded-lg border bg-card p-4 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-2 border rounded-md">
                  <span>{USDC_BASE[0].chainName}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 border rounded-md">
                  <Image
                    src={USDC_BASE[1].tokenLogoUrl || "/placeholder.svg"}
                    alt={USDC_BASE[1].tokenName}
                    width={20}
                    height={20}
                    className="rounded-full"
                  />
                  <span>{USDC_BASE[1].tokenSymbol}</span>
                </div>
              </div>
              <span className="w-24 text-right">0.0</span>
            </div>
          </div>

          {/* Bridge Button */}
          <Button className="w-full" size="lg">
            Bridge
          </Button>
        </div>
      )
    // return (
    //     <div className="w-full max-w-md mx-auto space-y-4 p-4">
    //       {/* From Section */}
    //       <div className="rounded-lg border bg-card p-4 space-y-4">
    //         <div className="flex items-center justify-between gap-2">
    //           <div className="flex items-center gap-2">
    //             <DropdownMenu>
    //               <DropdownMenuTrigger asChild>
    //                 <Button variant="outline" className="gap-2">
    //                   <Image
    //                     src={"/placeholder.svg"}
    //                     alt={fromNetwork.chainName}
    //                     width={20}
    //                     height={20}
    //                     className="rounded-full"
    //                   />
    //                   {fromNetwork.chainName}
    //                   <ChevronDown className="h-4 w-4" />
    //                 </Button>
    //               </DropdownMenuTrigger>
    //               <DropdownMenuContent align="start">
    //                 {fetchedNetworks.map((network) => (
    //                   <DropdownMenuItem key={network.chainId} onClick={() => setFromNetwork(network)}>
    //                     <div className="flex items-center gap-2">
    //                       <Image
    //                         src={"/placeholder.svg"}
    //                         alt={network.chainName}
    //                         width={20}
    //                         height={20}
    //                         className="rounded-full"
    //                       />
    //                       {network.chainName}
    //                     </div>
    //                   </DropdownMenuItem>
    //                 ))}
    //               </DropdownMenuContent>
    //             </DropdownMenu>
    //             <Select
    //               value={fromToken.tokenSymbol}
    //               onValueChange={(value) => setFromToken(fetchedTokens.find((t) => t.tokenSymbol === value) || tokens[0])}
    //             >
    //               <SelectTrigger className="gap-2 w-[120px]">
    //                 <Image
    //                   src={"/placeholder.svg"}
    //                   alt={fromToken.name}
    //                   width={20}
    //                   height={20}
    //                   className="rounded-full"
    //                 />
    //                 <SelectValue>{fromToken.name}</SelectValue>
    //               </SelectTrigger>
    //               <SelectContent>
    //                 {fetchedTokens?.map((token) => (
    //                   <SelectItem key={token.tokenSymbol} value={token.tokenSymbol}>
    //                     <div className="flex items-center gap-2">
    //                       <Image
    //                         src={token.tokenLogoUrl || "/placeholder.svg"}
    //                         alt={token.name}
    //                         width={20}
    //                         height={20}
    //                         className="rounded-full"
    //                       />
    //                       {token.tokenSymbol}
    //                     </div>
    //                   </SelectItem>
    //                 ))}
    //               </SelectContent>
    //             </Select>
    //           </div>
    //           <input
    //             type="text"
    //             value={fromAmount}
    //             onChange={(e) => setFromAmount(e.target.value)}
    //             className="w-24 text-right bg-transparent"
    //           />
    //         </div>
    //       </div>

    //       {/* To Section */}
    //       <div className="rounded-lg border bg-card p-4 space-y-4">
    //         <div className="flex items-center justify-between gap-2">
    //           <div className="flex items-center gap-2">
    //             <div className="flex items-center gap-2 px-3 py-2 border rounded-md">
    //               <Image
    //                 src={"https://raw.githubusercontent.com/base-org/brand-kit/a3b352afcc0839a0a355ccc2ae3279442fa56343/logo/in-product/Base_Network_Logo.svg"}
    //                 alt={USDC_BASE[0].chainName}
    //                 width={20}
    //                 height={20}
    //                 className="rounded-full"
    //               />
    //               <span>{USDC_BASE[0].chainName}</span>
    //             </div>
    //             <div className="flex items-center gap-2 px-3 py-2 border rounded-md">
    //               <Image
    //                 src={USDC_BASE[1].tokenLogoUrl || "/placeholder.svg"}
    //                 alt={USDC_BASE[1].tokenName}
    //                 width={20}
    //                 height={20}
    //                 className="rounded-full"
    //               />
    //               <span>{USDC_BASE[1].tokenSymbol}</span>
    //             </div>
    //           </div>
    //           <span className="w-24 text-right">{recievedAmount}</span>
    //         </div>
    //       </div>

    //       {/* Bridge Button */}
    //       <Button className="w-full" size="lg" onClick={handleApproveBridge}>
    //         Bridge
    //       </Button>
    //     </div>
    //   )
    }

export default CrossChainSwapSection

