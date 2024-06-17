import Section from '@/components/shared/layout/section'
import Image from 'next/image'
import Link from 'next/link'

const Terms = () => {
	return (
		// <Page>
		<Section>
			<div className='flex flex-row'>
				<Link href={'/'}>
					<Image
						src='/images/left_arrow.svg'
						alt='Back'
						width={24}
						height={24}
					/>
				</Link>
			</div>
			<div className='flex flex-col justify-center w-full py-20 leading-loose space-y-4'>
				<h1 className='font-bold text-4xl'>Terms and Conditions</h1>
				<p>Last updated: May 23, 2024</p>
				<h3 className='text-2xl font-bold'>Overview</h3>
				<p>
					This website allows users to participate in pooling cryptocurrency
					funds into an escrow contract for various purposes. By using this
					website, you agree to be bound by these Terms and Conditions.
				</p>
				<h3 className='text-2xl font-bold'>Eligibility</h3>
				You must be at least 18 years old and have the legal capacity to enter
				into these Terms and Conditions. This website and its services are not
				available to individuals or entities subject to sanctions or residing in
				restricted jurisdictions.
				<h3 className='text-2xl font-bold'>User Accounts</h3>
				You must create an account to use the website&apos;s services. You are
				responsible for maintaining the confidentiality of your account
				credentials and for all activities that occur under your account.
				Pooling and Escrow Users can contribute cryptocurrency to designated
				escrow contracts for specific purposes. The website acts as a
				facilitator and does not have direct control over the escrow contracts
				or the distribution of funds.
				<h3 className='text-2xl font-bold'>Risks and Responsibilities </h3>
				The pooling and distribution of cryptocurrency involve risks, including
				but not limited to market volatility, technical failures, and regulatory
				changes. Users participate at their own risk and are solely responsible
				for their contributions and any consequences. Distributions The website
				will make reasonable efforts to distribute the pooled funds according to
				the stated purpose and conditions of each escrow contract. However, the
				website does not guarantee the successful distribution or the
				performance of the escrow contracts.
				<h3 className='text-2xl font-bold'>Fees and Charges </h3>
				The website may charge fees for facilitating the pooling and
				distribution process. All applicable fees and charges will be disclosed
				transparently before any transaction. Intellectual Property The website
				and its content are protected by intellectual property laws. Users may
				not reproduce, distribute, or modify any part of the website or its
				content without prior written consent.
				<h3 className='text-2xl font-bold'>Privacy and Data Protection </h3>
				The website&apos;s Privacy Policy governs the collection, use, and
				protection of users&apos; personal information. By using the website,
				users consent to the processing of their personal data as described in
				the Privacy Policy.
				<h3 className='text-2xl font-bold'>Limitation of Liability </h3>
				The website, its owners, and affiliates shall not be liable for any
				direct, indirect, incidental, consequential, or punitive damages arising
				from the use or inability to use the website or its services.
				<h3 className='text-2xl font-bold'>Indemnification </h3>
				Users agree to indemnify and hold the website, its owners, and
				affiliates harmless from any claims, damages, or expenses arising from
				their use of the website or violation of these Terms and Conditions.
				Termination The website reserves the right to terminate or suspend user
				accounts and access to the website&apos;s services at any time, with or
				without notice, for any reason.
				<h3 className='text-2xl font-bold'>Governing Law and Jurisdiction </h3>
				These Terms and Conditions shall be governed by and construed in
				accordance with the laws of the United States of America. Any disputes
				arising from or relating to these Terms and Conditions shall be resolved
				in the courts of the United States of America. Modifications The website
				reserves the right to modify or update these Terms and Conditions at any
				time. Users are responsible for regularly reviewing the Terms and
				Conditions for any changes. By using this website, you acknowledge that
				you have read, understood, and agreed to these Terms and Conditions.
				<h2 className='font-bold text-3xl'>Contact Us</h2>
				<p>
					If you have any questions about this Privacy Policy, You can contact
					us:
				</p>
				<ul>
					<li>By email: dev@poolparty.cc</li>
				</ul>
			</div>
		</Section>
		// </Page>
	)
}

export default Terms
