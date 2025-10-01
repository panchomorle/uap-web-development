import { createWeb3Modal } from '@web3modal/wagmi/react';
import { config } from '../config';

export const projectId = 'YOUR_PROJECT_ID'; // Replace with your Web3Modal project ID

export const web3Modal = createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: true,
  themeMode: 'light',
  themeVariables: {
    '--w3m-accent': '#6366f1',
  },
});
