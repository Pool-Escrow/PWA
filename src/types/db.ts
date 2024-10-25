export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
    public: {
        Tables: {
            accounts: {
                Row: {
                    access_token: string | null
                    expires_at: number | null
                    id_token: string | null
                    provider: string
                    providerAccountId: string
                    refresh_token: string | null
                    scope: string | null
                    session_state: string | null
                    token_type: string | null
                    type: string
                    userId: number
                }
                Insert: {
                    access_token?: string | null
                    expires_at?: number | null
                    id_token?: string | null
                    provider: string
                    providerAccountId: string
                    refresh_token?: string | null
                    scope?: string | null
                    session_state?: string | null
                    token_type?: string | null
                    type: string
                    userId: number
                }
                Update: {
                    access_token?: string | null
                    expires_at?: number | null
                    id_token?: string | null
                    provider?: string
                    providerAccountId?: string
                    refresh_token?: string | null
                    scope?: string | null
                    session_state?: string | null
                    token_type?: string | null
                    type?: string
                    userId?: number
                }
                Relationships: [
                    {
                        foreignKeyName: 'accounts_userId_fkey'
                        columns: ['userId']
                        isOneToOne: false
                        referencedRelation: 'users'
                        referencedColumns: ['id']
                    },
                ]
            }
            pool_participants: {
                Row: {
                    checked_in_at: string | null
                    createdAt: string | null
                    pool_id: number
                    poolRole: Database['public']['Enums']['poolRoles']
                    status: string
                    user_id: number
                }
                Insert: {
                    checked_in_at?: string | null
                    createdAt?: string | null
                    pool_id: number
                    poolRole: Database['public']['Enums']['poolRoles']
                    status?: string
                    user_id: number
                }
                Update: {
                    checked_in_at?: string | null
                    createdAt?: string | null
                    pool_id?: number
                    poolRole?: Database['public']['Enums']['poolRoles']
                    status?: string
                    user_id?: number
                }
                Relationships: [
                    {
                        foreignKeyName: 'pool_participants_user_id_fkey'
                        columns: ['user_id']
                        isOneToOne: false
                        referencedRelation: 'users'
                        referencedColumns: ['id']
                    },
                ]
            }
            pools: {
                Row: {
                    bannerImage: string
                    code_of_conduct_url: string | null
                    contract_id: number | null
                    createdAt: string
                    description: string
                    endDate: string
                    internal_id: number
                    name: string
                    price: number
                    required_acceptance: boolean
                    softCap: number
                    startDate: string
                    status: Database['public']['Enums']['poolStatus']
                    termsURL: string
                    tokenAddress: string
                    updatedAt: string
                }
                Insert: {
                    bannerImage: string
                    code_of_conduct_url?: string | null
                    contract_id?: number | null
                    createdAt?: string
                    description: string
                    endDate: string
                    internal_id?: never
                    name: string
                    price: number
                    required_acceptance?: boolean
                    softCap: number
                    startDate: string
                    status?: Database['public']['Enums']['poolStatus']
                    termsURL: string
                    tokenAddress: string
                    updatedAt?: string
                }
                Update: {
                    bannerImage?: string
                    code_of_conduct_url?: string | null
                    contract_id?: number | null
                    createdAt?: string
                    description?: string
                    endDate?: string
                    internal_id?: never
                    name?: string
                    price?: number
                    required_acceptance?: boolean
                    softCap?: number
                    startDate?: string
                    status?: Database['public']['Enums']['poolStatus']
                    termsURL?: string
                    tokenAddress?: string
                    updatedAt?: string
                }
                Relationships: []
            }
            sessions: {
                Row: {
                    createdAt: string | null
                    expires: string
                    sessionToken: string
                    updatedAt: string | null
                    userId: number
                }
                Insert: {
                    createdAt?: string | null
                    expires: string
                    sessionToken: string
                    updatedAt?: string | null
                    userId: number
                }
                Update: {
                    createdAt?: string | null
                    expires?: string
                    sessionToken?: string
                    updatedAt?: string | null
                    userId?: number
                }
                Relationships: [
                    {
                        foreignKeyName: 'sessions_userId_fkey'
                        columns: ['userId']
                        isOneToOne: false
                        referencedRelation: 'users'
                        referencedColumns: ['id']
                    },
                ]
            }
            users: {
                Row: {
                    avatar: string | null
                    createdAt: string | null
                    displayName: string | null
                    id: number
                    privyId: string
                    role: Database['public']['Enums']['roles']
                    updatedAt: string | null
                    walletAddress: string
                }
                Insert: {
                    avatar?: string | null
                    createdAt?: string | null
                    displayName?: string | null
                    id?: never
                    privyId: string
                    role?: Database['public']['Enums']['roles']
                    updatedAt?: string | null
                    walletAddress: string
                }
                Update: {
                    avatar?: string | null
                    createdAt?: string | null
                    displayName?: string | null
                    id?: never
                    privyId?: string
                    role?: Database['public']['Enums']['roles']
                    updatedAt?: string | null
                    walletAddress?: string
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            poolRoles: 'mainHost' | 'coHost' | 'participant'
            poolStatus:
                | 'draft'
                | 'unconfirmed'
                | 'inactive'
                | 'depositsEnabled'
                | 'started'
                | 'paused'
                | 'ended'
                | 'deleted'
            roles: 'user' | 'admin'
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

type PublicSchema = Database[Extract<keyof Database, 'public'>]

export type Tables<
    PublicTableNameOrOptions extends
        | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
        | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
        ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
              Database[PublicTableNameOrOptions['schema']]['Views'])
        : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
          Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
          Row: infer R
      }
        ? R
        : never
    : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] & PublicSchema['Views'])
      ? (PublicSchema['Tables'] & PublicSchema['Views'])[PublicTableNameOrOptions] extends {
            Row: infer R
        }
          ? R
          : never
      : never

export type TablesInsert<
    PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
        ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
        : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
          Insert: infer I
      }
        ? I
        : never
    : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
      ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
            Insert: infer I
        }
          ? I
          : never
      : never

export type TablesUpdate<
    PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
        ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
        : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
          Update: infer U
      }
        ? U
        : never
    : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
      ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
            Update: infer U
        }
          ? U
          : never
      : never

export type Enums<
    PublicEnumNameOrOptions extends keyof PublicSchema['Enums'] | { schema: keyof Database },
    EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
        ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
        : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
    ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
    : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
      ? PublicSchema['Enums'][PublicEnumNameOrOptions]
      : never

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends keyof PublicSchema['CompositeTypes'] | { schema: keyof Database },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof Database
    }
        ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
        : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
    ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof PublicSchema['CompositeTypes']
      ? PublicSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
      : never
