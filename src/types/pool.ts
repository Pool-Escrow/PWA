export interface PoolFormData {
    bannerImage: string
    name: string
    // Añade aquí otros campos según sea necesario
}

export interface ServerResponse {
    data?: PoolFormData
    errorMap?: {
        onServer?: string
    }
}

// interface PoolLog {
// 	args: { poolId: string }
// }

// export interface poolData {
// 	co_host_addresses: null | string
// 	created_at: string
// 	created_by: string
// 	description: string
// 	event_timestamp: Date
// 	host_address: string
// 	link_to_rules: string
// 	pool_id: number
// 	pool_image_url: string
// 	pool_name: string
// 	participant_count: number
// 	price: number
// 	soft_cap: number
// }
