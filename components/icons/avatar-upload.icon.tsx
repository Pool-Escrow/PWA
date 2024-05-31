export default function AvatarUploadIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg width={45} height={45} fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
            <path d='M26.25 24.375a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z' fill={props.fill || '#fff'} />
            <path
                fillRule='evenodd'
                clipRule='evenodd'
                d='M3.75 15.642a5.625 5.625 0 014.26-5.457l3.24-.81 2.637-3.955a3.75 3.75 0 013.12-1.67h10.986a3.75 3.75 0 013.12 1.67l2.637 3.955 3.24.81a5.625 5.625 0 014.26 5.457v19.983a5.625 5.625 0 01-5.625 5.625H9.375a5.625 5.625 0 01-5.625-5.625V15.642zm31.875 1.233a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zM30 24.375a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z'
                fill={props.fill || '#fff'}
            />
            <path d='M26.25 24.375a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z' fill={props.fill || '#fff'} />
            <path
                d='M40.313 3.75v5.625M37.5 6.563h5.625'
                stroke={props.fill || '#fff'}
                strokeWidth='.879'
                strokeLinecap='round'
            />
        </svg>
    )
}
