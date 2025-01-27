'use client'
import { use } from "chai";
import { API_paths, sendGetRequest, sendPostRequest } from "./utils";
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

import * as React from "react"
import Image from "next/image"
import { ChevronDown } from "lucide-react"
import { set } from "lodash";

// import { Button } from "@/components/ui/button"
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

let networks = [
    {
        chainId:"1",
        chainName:"Ethereum",
        dexTokenApproveAddress:"0x40aA958dd87FC8305b97f2BA922CDdCa374bcD7f"
    },
    {
        chainId:"8453",
        chainName:"Base",
        dexTokenApproveAddress:"0x57df6092665eb6058DE53939612413ff4B09114E"
    }


]

const tokens = [
  {
    id: "usdc",
    name: "USDC",
    // icon: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-01-28%20at%201.19.44%E2%80%AFAM-WhDXF5kQVcwo3s8M1Wbe9q5S2hQLzQ.png",
  },
]
const handleTest = () => {
    console.log('test')
    const getRequestPath = '/api/v5/dex/aggregator/quote';
    const getParams = {
    'chainId': 42161,
    'amount': 1000000000000,
    'toTokenAddress': '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8',
    'fromTokenAddress': '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'
    };
    sendGetRequest(getRequestPath, getParams);
}

const handleTest2 = () => {
    console.log('test22222')
    const postRequestPath = '/api/v5/mktplace/nft/ordinals/listings';
    const postParams = {
    'slug': 'sats'
    };
    sendPostRequest(postRequestPath, postParams);
}

const CrossChainSwapSection = () => {
    const { wallets } = useWallets();
    const [fromNetwork, setFromNetwork] = React.useState(networks[0])
    const [fromToken, setFromToken] = React.useState(tokens[0])
    const [fromAmount, setFromAmount] = React.useState("0.0")
    const [fetchedNetworks, setFetchedNetworks] = React.useState([])
    useEffect(() => {
        const {path, call} = API_paths['chains'];
        const connectedWallet = wallets[0];
        // console.log('connectedWallet', connectedWallet);
        // Get Chain Balances from RPC's
        if (connectedWallet) {
            console.log("PAAATH", path)
            const fetchChains = async () => {
                    let res = await sendGetRequest(path, null).then((res) => {
                    console.log('res', res)
                    return res
                    }).catch((err) => {
                        console.log('err', err)
                    }).then((res) => {
                        console.log(res);
                        networks = res.data;
                        setFetchedNetworks(res.data);
                        console.log('networks', networks)
                        return res;
                    });
                    console.log('res22sssss//', res)
            }
            fetchChains();
        }

        console.log('wallets', wallets)
    }, [wallets])



    return (
        <div className="w-full max-w-md mx-auto space-y-4 p-4">
          {/* From Section */}
          <div className="rounded-lg border bg-card p-4 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Image
                        src={"/placeholder.svg"}
                        alt={fromNetwork.chainName}
                        width={20}
                        height={20}
                        className="rounded-full"
                      />
                      {fromNetwork.chainName}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {fetchedNetworks.map((network) => (
                      <DropdownMenuItem key={network.chainId} onClick={() => setFromNetwork(network)}>
                        <div className="flex items-center gap-2">
                          <Image
                            src={"/placeholder.svg"}
                            alt={network.chainName}
                            width={20}
                            height={20}
                            className="rounded-full"
                          />
                          {network.chainName}
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Select
                  value={fromToken.id}
                  onValueChange={(value) => setFromToken(tokens.find((t) => t.id === value) || tokens[0])}
                >
                  <SelectTrigger className="gap-2 w-[120px]">
                    <Image
                      src={"/placeholder.svg"}
                      alt={fromToken.name}
                      width={20}
                      height={20}
                      className="rounded-full"
                    />
                    <SelectValue>{fromToken.name}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {tokens.map((token) => (
                      <SelectItem key={token.id} value={token.id}>
                        <div className="flex items-center gap-2">
                          <Image
                            src={"/placeholder.svg"}
                            alt={token.name}
                            width={20}
                            height={20}
                            className="rounded-full"
                          />
                          {token.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <input
                type="text"
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
                  <Image
                    src={"/placeholder.svg"}
                    alt={networks[1].chainName}
                    width={20}
                    height={20}
                    className="rounded-full"
                  />
                  <span>{networks[1].chainName}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 border rounded-md">
                  <Image
                    src={"/placeholder.svg"}
                    alt={tokens[0].name}
                    width={20}
                    height={20}
                    className="rounded-full"
                  />
                  <span>{tokens[0].name}</span>
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
    }

export default CrossChainSwapSection

