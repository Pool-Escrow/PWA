import {loadStripeOnramp} from '@stripe/crypto';
import {CryptoElements, OnrampElement} from './StripeCryptoElements';

const stripeOnrampPromise = loadStripeOnramp(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST || '');

export default function OnrampStripe() {
	return (
	  <CryptoElements stripeOnramp={stripeOnrampPromise}>
		<OnrampElement />
	  </CryptoElements>
	);
}