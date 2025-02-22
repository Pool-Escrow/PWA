const Container = ({ children }: React.PropsWithChildren) => {
    return (
        <div className='flex w-full flex-1 flex-col items-start justify-start gap-5 rounded-3xl border border-slate-300/20 bg-white px-[18px] py-6 shadow-sm backdrop-blur-[26.30px]'>
            {children}
        </div>
    )
}

export default Container
