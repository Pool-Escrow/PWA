import styles from './divider.module.css'

const Divider = ({ className }: { className?: any }) => (
	<div className={`border-t-4 ${styles.divider} ${className}`}></div>
)

export default Divider
