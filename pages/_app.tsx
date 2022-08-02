import '../styles/globals.css';
import { AppProps } from 'next/app';
import { ChainId, ThirdwebProvider } from '@thirdweb-dev/react';
import Layout from '../layouts/Layout';

function MyApp({ Component, pageProps }: AppProps) {
   return (
      <ThirdwebProvider desiredChainId={ChainId.Rinkeby}>
         <Layout>
            <Component {...pageProps} />
         </Layout>
      </ThirdwebProvider>
   );
}

export default MyApp;
