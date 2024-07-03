import React, { ReactNode } from 'react';
import { Button } from '../ui/button';

// ReactContext to simplify access of StripeOnramp object
const CryptoElementsContext = React.createContext({ onramp: null });

export const CryptoElements = ({
  stripeOnramp,
  children,
}: {
  stripeOnramp: any;
  children: ReactNode;
}) => {
  const [ctx, setContext] = React.useState(() => ({ onramp: null }));

  React.useEffect(() => {
    let isMounted = true;

    Promise.resolve(stripeOnramp).then((onramp) => {
      if (onramp && isMounted) {
        setContext((ctx) => (ctx.onramp ? ctx : { onramp }));
      }
    });

    return () => {
      isMounted = false;
    };
  }, [stripeOnramp]);

  return (
    <CryptoElementsContext.Provider value={ctx}>
      {children}
    </CryptoElementsContext.Provider>
  );
};

// React hook to get StripeOnramp from context
export const useStripeOnramp = () => {
  const context = React.useContext(CryptoElementsContext);
  return context?.onramp;
};

const getSession = async () => {
  try {
    const response = await fetch('/api/onramp_stripe')
    if (!response.ok) {
        throw new Error('Network response was not ok')
    }
    const data = await response.json()
    console.log('data', data)
    return data
  } catch (error) {
      console.error('There was a problem with the post operation:', error)
  }
}

// React element to render Onramp UI
export const OnrampElement = ({
  appearance,
  ...props
}: {
  appearance?: any;
  [key: string]: any;
}) => {
  const stripeOnramp: any = useStripeOnramp();
  const onrampElementRef = React.useRef<HTMLDivElement>(null);
  const [clientSecret, setClientSecret] = React.useState('');
  const [showButton, setShowButton] = React.useState(true);

  const createSession = async () => {
    const { client_secret: clientSecret } = await getSession()
    if (clientSecret) {
      setClientSecret(clientSecret)
      setShowButton(false)
    }
  }

  React.useEffect(() => {
    const containerRef = onrampElementRef.current;

    if (containerRef) {
    containerRef.innerHTML = '';

    if (clientSecret && stripeOnramp) {
      stripeOnramp
        ?.createSession({
          clientSecret,
          appearance,
        })
        .mount(containerRef)
      }
    }
  }, [clientSecret, stripeOnramp]);

  return (
    <>
      {showButton && (
          <Button onClick={createSession}>
            Stripe
          </Button>
      )}
      <div {...props} ref={onrampElementRef}></div>
    </>
  );
};