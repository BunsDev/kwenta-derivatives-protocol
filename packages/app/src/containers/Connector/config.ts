import { Chain, connectorsForWallets } from '@rainbow-me/rainbowkit'
import {
	braveWallet,
	coinbaseWallet,
	injectedWallet,
	metaMaskWallet,
	rainbowWallet,
	safeWallet,
	walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets'
import { configureChains, createClient } from 'wagmi'
import {
	arbitrum,
	avalanche,
	bsc,
	mainnet,
	polygon,
	optimism,
	goerli,
	optimismGoerli,
} from 'wagmi/chains'
import { infuraProvider } from 'wagmi/providers/infura'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import { publicProvider } from 'wagmi/providers/public'

import BinanceIcon from 'assets/png/rainbowkit/binance.png'
import Frame from 'components/Rainbowkit/Frame'
import Tally from 'components/Rainbowkit/Tally'
import { BLAST_NETWORK_LOOKUP, STALL_TIMEOUT } from 'constants/network'

const bscWithIcon: Chain = {
	...bsc,
	iconUrl: async () => BinanceIcon,
}

export const chain = {
	optimism,
	mainnet,
	arbitrum,
	polygon,
	avalanche,
	bsc: bscWithIcon,
	goerli,
	optimismGoerli,
}

const { chains, provider } = configureChains(Object.values(chain), [
	infuraProvider({
		apiKey: process.env.NEXT_PUBLIC_INFURA_PROJECT_ID!,
		stallTimeout: STALL_TIMEOUT,
		priority: process.env.NEXT_PUBLIC_PROVIDER_ID === 'INFURA' ? 1 : 3,
	}),
	jsonRpcProvider({
		rpc: (networkChain) => ({
			http: process.env.NEXT_PUBLIC_DEVNET_ENABLED
				? process.env.NEXT_PUBLIC_DEVNET_RPC_URL!
				: !BLAST_NETWORK_LOOKUP[networkChain.id]
				? networkChain.rpcUrls.default.http[0]
				: `https://${BLAST_NETWORK_LOOKUP[networkChain.id]}.blastapi.io/${
						process.env.NEXT_PUBLIC_BLASTAPI_PROJECT_ID
				  }`,
		}),
		stallTimeout: STALL_TIMEOUT,
		priority: process.env.NEXT_PUBLIC_DEVNET_ENABLED ? 0 : 2,
	}),
	publicProvider({ stallTimeout: STALL_TIMEOUT, priority: 5 }),
])

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_V2_ID!

const connectors = connectorsForWallets([
	{
		groupName: 'Popular',
		wallets: [
			safeWallet({ chains }),
			metaMaskWallet({ projectId, chains }),
			rainbowWallet({ projectId, chains }),
			coinbaseWallet({ appName: 'Kwenta', chains }),
			walletConnectWallet({ projectId, chains }),
		],
	},
	{
		groupName: 'More',
		wallets: [
			braveWallet({ chains, shimDisconnect: true }),
			Tally({ chains, shimDisconnect: true }),
			Frame({ chains, shimDisconnect: true }),
			injectedWallet({ chains, shimDisconnect: true }),
		],
	},
])

export const wagmiClient = createClient({
	autoConnect: true,
	connectors,
	provider,
})

export { chains }
