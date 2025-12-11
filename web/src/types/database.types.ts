export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    // Allows to automatically instantiate createClient with right options
    // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
    __InternalSupabase: {
        PostgrestVersion: "13.0.5"
    }
    public: {
        Tables: {
            announcements: {
                Row: {
                    author_id: string | null
                    category: string
                    content: string
                    created_at: string | null
                    expires_at: string | null
                    id: string
                    image_url: string | null
                    is_active: boolean | null
                    parish_id: string | null
                    priority: string | null
                    published_at: string | null
                    title: string
                    updated_at: string | null
                    views_count: number | null
                }
                Insert: {
                    author_id?: string | null
                    category: string
                    content: string
                    created_at?: string | null
                    expires_at?: string | null
                    id?: string
                    image_url?: string | null
                    is_active?: boolean | null
                    parish_id?: string | null
                    priority?: string | null
                    published_at?: string | null
                    title: string
                    updated_at?: string | null
                    views_count?: number | null
                }
                Update: {
                    author_id?: string | null
                    category?: string
                    content?: string
                    created_at?: string | null
                    expires_at?: string | null
                    id?: string
                    image_url?: string | null
                    is_active?: boolean | null
                    parish_id?: string | null
                    priority?: string | null
                    published_at?: string | null
                    title?: string
                    updated_at?: string | null
                    views_count?: number | null
                }
                Relationships: [
                    {
                        foreignKeyName: "announcements_author_id_fkey"
                        columns: ["author_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "announcements_parish_id_fkey"
                        columns: ["parish_id"]
                        isOneToOne: false
                        referencedRelation: "parishes"
                        referencedColumns: ["id"]
                    },
                ]
            }
            books: {
                Row: {
                    author: string
                    available_copies: number
                    cover_url: string | null
                    created_at: string | null
                    description: string | null
                    id: string
                    isbn: string | null
                    is_reference: boolean | null
                    location: string | null
                    parish_id: string | null
                    published_year: number | null
                    publisher: string | null
                    title: string
                    total_copies: number
                    updated_at: string | null
                }
                Insert: {
                    author: string
                    available_copies?: number
                    cover_url?: string | null
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    isbn?: string | null
                    is_reference?: boolean | null
                    location?: string | null
                    parish_id?: string | null
                    published_year?: number | null
                    publisher?: string | null
                    title: string
                    total_copies?: number
                    updated_at?: string | null
                }
                Update: {
                    author?: string
                    available_copies?: number
                    cover_url?: string | null
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    isbn?: string | null
                    is_reference?: boolean | null
                    location?: string | null
                    parish_id?: string | null
                    published_year?: number | null
                    publisher?: string | null
                    title?: string
                    total_copies?: number
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "books_parish_id_fkey"
                        columns: ["parish_id"]
                        isOneToOne: false
                        referencedRelation: "parishes"
                        referencedColumns: ["id"]
                    },
                ]
            }
            daily_readings: {
                Row: {
                    content: string
                    created_at: string | null
                    date: string
                    first_reading: string | null
                    gospel: string | null
                    id: string
                    liturgical_color: string | null
                    psalm: string | null
                    reflection: string | null
                    second_reading: string | null
                    source: string | null
                }
                Insert: {
                    content: string
                    created_at?: string | null
                    date: string
                    first_reading?: string | null
                    gospel?: string | null
                    id?: string
                    liturgical_color?: string | null
                    psalm?: string | null
                    reflection?: string | null
                    second_reading?: string | null
                    source?: string | null
                }
                Update: {
                    content?: string
                    created_at?: string | null
                    date?: string
                    first_reading?: string | null
                    gospel?: string | null
                    id?: string
                    liturgical_color?: string | null
                    psalm?: string | null
                    reflection?: string | null
                    second_reading?: string | null
                    source?: string | null
                }
                Relationships: []
            }
            donations: {
                Row: {
                    amount: number
                    campaign_id: string | null
                    created_at: string | null
                    currency: string
                    id: string
                    notes: string | null
                    payment_method: string
                    status: string
                    transaction_id: string | null
                    user_id: string | null
                }
                Insert: {
                    amount: number
                    campaign_id?: string | null
                    created_at?: string | null
                    currency?: string
                    id?: string
                    notes?: string | null
                    payment_method: string
                    status?: string
                    transaction_id?: string | null
                    user_id?: string | null
                }
                Update: {
                    amount?: number
                    campaign_id?: string | null
                    created_at?: string | null
                    currency?: string
                    id?: string
                    notes?: string | null
                    payment_method?: string
                    status?: string
                    transaction_id?: string | null
                    user_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "donations_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            event_registrations: {
                Row: {
                    attendees_count: number
                    created_at: string | null
                    event_id: string | null
                    id: string
                    notes: string | null
                    status: string
                    updated_at: string | null
                    user_id: string | null
                }
                Insert: {
                    attendees_count?: number
                    created_at?: string | null
                    event_id?: string | null
                    id?: string
                    notes?: string | null
                    status?: string
                    updated_at?: string | null
                    user_id?: string | null
                }
                Update: {
                    attendees_count?: number
                    created_at?: string | null
                    event_id?: string | null
                    id?: string
                    notes?: string | null
                    status?: string
                    updated_at?: string | null
                    user_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "event_registrations_event_id_fkey"
                        columns: ["event_id"]
                        isOneToOne: false
                        referencedRelation: "events"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "event_registrations_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            events: {
                Row: {
                    contact_email: string | null
                    contact_phone: string | null
                    created_at: string | null
                    date: string
                    description: string | null
                    end_date: string | null
                    event_type: string
                    id: string
                    image_url: string | null
                    is_recurring: boolean | null
                    location: string | null
                    max_participants: number | null
                    organizer: string | null
                    parish_id: string | null
                    recurrence_pattern: string | null
                    registered_count: number | null
                    tags: string[] | null
                    title: string
                    updated_at: string | null
                }
                Insert: {
                    contact_email?: string | null
                    contact_phone?: string | null
                    created_at?: string | null
                    date: string
                    description?: string | null
                    end_date?: string | null
                    event_type: string
                    id?: string
                    image_url?: string | null
                    is_recurring?: boolean | null
                    location?: string | null
                    max_participants?: number | null
                    organizer?: string | null
                    parish_id?: string | null
                    recurrence_pattern?: string | null
                    registered_count?: number | null
                    tags?: string[] | null
                    title: string
                    updated_at?: string | null
                }
                Update: {
                    contact_email?: string | null
                    contact_phone?: string | null
                    created_at?: string | null
                    date?: string
                    description?: string | null
                    end_date?: string | null
                    event_type?: string
                    id?: string
                    image_url?: string | null
                    is_recurring?: boolean | null
                    location?: string | null
                    max_participants?: number | null
                    organizer?: string | null
                    parish_id?: string | null
                    recurrence_pattern?: string | null
                    registered_count?: number | null
                    tags?: string[] | null
                    title?: string
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "events_parish_id_fkey"
                        columns: ["parish_id"]
                        isOneToOne: false
                        referencedRelation: "parishes"
                        referencedColumns: ["id"]
                    },
                ]
            }
            favorites: {
                Row: {
                    created_at: string | null
                    id: string
                    item_id: string
                    item_type: string
                    notes: string | null
                    user_id: string | null
                }
                Insert: {
                    created_at?: string | null
                    id?: string
                    item_id: string
                    item_type: string
                    notes?: string | null
                    user_id?: string | null
                }
                Update: {
                    created_at?: string | null
                    id?: string
                    item_id?: string
                    item_type?: string
                    notes?: string | null
                    user_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "favorites_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            gallery: {
                Row: {
                    caption: string | null
                    created_at: string | null
                    event_id: string | null
                    id: string
                    media_type: string
                    parish_id: string | null
                    uploaded_by: string | null
                    url: string
                }
                Insert: {
                    caption?: string | null
                    created_at?: string | null
                    event_id?: string | null
                    id?: string
                    media_type: string
                    parish_id?: string | null
                    uploaded_by?: string | null
                    url: string
                }
                Update: {
                    caption?: string | null
                    created_at?: string | null
                    event_id?: string | null
                    id?: string
                    media_type?: string
                    parish_id?: string | null
                    uploaded_by?: string | null
                    url?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "gallery_event_id_fkey"
                        columns: ["event_id"]
                        isOneToOne: false
                        referencedRelation: "events"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "gallery_parish_id_fkey"
                        columns: ["parish_id"]
                        isOneToOne: false
                        referencedRelation: "parishes"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "gallery_uploaded_by_fkey"
                        columns: ["uploaded_by"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            group_members: {
                Row: {
                    group_id: string | null
                    id: string
                    joined_at: string | null
                    role: string
                    status: string
                    user_id: string | null
                }
                Insert: {
                    group_id?: string | null
                    id?: string
                    joined_at?: string | null
                    role?: string
                    status?: string
                    user_id?: string | null
                }
                Update: {
                    group_id?: string | null
                    id?: string
                    joined_at?: string | null
                    role?: string
                    status?: string
                    user_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "group_members_group_id_fkey"
                        columns: ["group_id"]
                        isOneToOne: false
                        referencedRelation: "groups"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "group_members_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            groups: {
                Row: {
                    admin1_id: string | null
                    admin2_id: string | null
                    created_at: string | null
                    description: string | null
                    group_type: string
                    id: string
                    image_url: string | null
                    is_active: boolean | null
                    leader_id: string | null
                    meeting_day: string | null
                    meeting_day_2: string | null
                    meeting_location: string | null
                    meeting_time: string | null
                    meeting_time_2: string | null
                    members_count: number | null
                    name: string
                    parish_id: string | null
                    tags: string[] | null
                    updated_at: string | null
                }
                Insert: {
                    admin1_id?: string | null
                    admin2_id?: string | null
                    created_at?: string | null
                    description?: string | null
                    group_type: string
                    id?: string
                    image_url?: string | null
                    is_active?: boolean | null
                    leader_id?: string | null
                    meeting_day?: string | null
                    meeting_day_2?: string | null
                    meeting_location?: string | null
                    meeting_time?: string | null
                    meeting_time_2?: string | null
                    members_count?: number | null
                    name: string
                    parish_id?: string | null
                    tags?: string[] | null
                    updated_at?: string | null
                }
                Update: {
                    admin1_id?: string | null
                    admin2_id?: string | null
                    created_at?: string | null
                    description?: string | null
                    group_type?: string
                    id?: string
                    image_url?: string | null
                    is_active?: boolean | null
                    leader_id?: string | null
                    meeting_day?: string | null
                    meeting_day_2?: string | null
                    meeting_location?: string | null
                    meeting_time?: string | null
                    meeting_time_2?: string | null
                    members_count?: number | null
                    name?: string
                    parish_id?: string | null
                    tags?: string[] | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "groups_admin1_id_fkey"
                        columns: ["admin1_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "groups_admin2_id_fkey"
                        columns: ["admin2_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "groups_leader_id_fkey"
                        columns: ["leader_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "groups_parish_id_fkey"
                        columns: ["parish_id"]
                        isOneToOne: false
                        referencedRelation: "parishes"
                        referencedColumns: ["id"]
                    },
                ]
            }
            homelies: {
                Row: {
                    audio_url: string | null
                    created_at: string | null
                    date: string | null
                    description: string | null
                    duration_minutes: number | null
                    id: string
                    listens_count: number | null
                    parish_id: string | null
                    preacher: string
                    scripture_reference: string | null
                    tags: string[] | null
                    title: string
                    video_url: string | null
                }
                Insert: {
                    audio_url?: string | null
                    created_at?: string | null
                    date?: string | null
                    description?: string | null
                    duration_minutes?: number | null
                    id?: string
                    listens_count?: number | null
                    parish_id?: string | null
                    preacher: string
                    scripture_reference?: string | null
                    tags?: string[] | null
                    title: string
                    video_url?: string | null
                }
                Update: {
                    audio_url?: string | null
                    created_at?: string | null
                    date?: string | null
                    description?: string | null
                    duration_minutes?: number | null
                    id?: string
                    listens_count?: number | null
                    parish_id?: string | null
                    preacher?: string
                    scripture_reference?: string | null
                    tags?: string[] | null
                    title?: string
                    video_url?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "homelies_parish_id_fkey"
                        columns: ["parish_id"]
                        isOneToOne: false
                        referencedRelation: "parishes"
                        referencedColumns: ["id"]
                    },
                ]
            }
            mass_intentions: {
                Row: {
                    created_at: string | null
                    id: string
                    intention_text: string
                    parish_id: string | null
                    requested_date: string | null
                    status: string
                    transaction_id: string | null
                    user_id: string | null
                }
                Insert: {
                    created_at?: string | null
                    id?: string
                    intention_text: string
                    parish_id?: string | null
                    requested_date?: string | null
                    status?: string
                    transaction_id?: string | null
                    user_id?: string | null
                }
                Update: {
                    created_at?: string | null
                    id?: string
                    intention_text?: string
                    parish_id?: string | null
                    requested_date?: string | null
                    status?: string
                    transaction_id?: string | null
                    user_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "mass_intentions_parish_id_fkey"
                        columns: ["parish_id"]
                        isOneToOne: false
                        referencedRelation: "parishes"
                        referencedColumns: ["id"]
                    },
                ]
            }
            mass_requests: {
                Row: {
                    created_at: string | null
                    id: string
                    intention: string
                    is_anonymous: boolean | null
                    offering_amount: number | null
                    requested_at: string
                    requested_by: string | null
                    status: string
                }
                Insert: {
                    created_at?: string | null
                    id?: string
                    intention: string
                    is_anonymous?: boolean | null
                    offering_amount?: number | null
                    requested_at: string
                    requested_by?: string | null
                    status?: string
                }
                Update: {
                    created_at?: string | null
                    id?: string
                    intention?: string
                    is_anonymous?: boolean | null
                    offering_amount?: number | null
                    requested_at?: string
                    requested_by?: string | null
                    status?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "mass_requests_requested_by_fkey"
                        columns: ["requested_by"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            masses: {
                Row: {
                    celebrant: string | null
                    created_at: string | null
                    day_of_week: string
                    description: string | null
                    id: string
                    is_exceptional: boolean | null
                    lang: string | null
                    location: string | null
                    parish_id: string | null
                    time_of_day: string
                    valid_from: string | null
                    valid_until: string | null
                }
                Insert: {
                    celebrant?: string | null
                    created_at?: string | null
                    day_of_week: string
                    description?: string | null
                    id?: string
                    is_exceptional?: boolean | null
                    lang?: string | null
                    location?: string | null
                    parish_id?: string | null
                    time_of_day: string
                    valid_from?: string | null
                    valid_until?: string | null
                }
                Update: {
                    celebrant?: string | null
                    created_at?: string | null
                    day_of_week?: string
                    description?: string | null
                    id?: string
                    is_exceptional?: boolean | null
                    lang?: string | null
                    location?: string | null
                    parish_id?: string | null
                    time_of_day?: string
                    valid_from?: string | null
                    valid_until?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "masses_parish_id_fkey"
                        columns: ["parish_id"]
                        isOneToOne: false
                        referencedRelation: "parishes"
                        referencedColumns: ["id"]
                    },
                ]
            }
            notifications: {
                Row: {
                    action_url: string | null
                    body: string
                    created_at: string | null
                    data: Json | null
                    id: string
                    is_read: boolean | null
                    parish_id: string | null
                    title: string
                    type: string
                    user_id: string | null
                }
                Insert: {
                    action_url?: string | null
                    body: string
                    created_at?: string | null
                    data?: Json | null
                    id?: string
                    is_read?: boolean | null
                    parish_id?: string | null
                    title: string
                    type: string
                    user_id?: string | null
                }
                Update: {
                    action_url?: string | null
                    body?: string
                    created_at?: string | null
                    data?: Json | null
                    id?: string
                    is_read?: boolean | null
                    parish_id?: string | null
                    title?: string
                    type?: string
                    user_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "notifications_parish_id_fkey"
                        columns: ["parish_id"]
                        isOneToOne: false
                        referencedRelation: "parishes"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "notifications_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            parishes: {
                Row: {
                    address: string
                    city: string
                    contact_email: string | null
                    contact_phone: string | null
                    country: string
                    created_at: string | null
                    description: string | null
                    diocese: string | null
                    founding_date: string | null
                    history: string | null
                    id: string
                    image_url: string | null
                    latitude: number | null
                    logo_url: string | null
                    longitude: number | null
                    name: string
                    primary_color: string | null
                    secondary_color: string | null
                    website: string | null
                }
                Insert: {
                    address: string
                    city: string
                    contact_email?: string | null
                    contact_phone?: string | null
                    country: string
                    created_at?: string | null
                    description?: string | null
                    diocese?: string | null
                    founding_date?: string | null
                    history?: string | null
                    id?: string
                    image_url?: string | null
                    latitude?: number | null
                    logo_url?: string | null
                    longitude?: number | null
                    name: string
                    primary_color?: string | null
                    secondary_color?: string | null
                    website?: string | null
                }
                Update: {
                    address?: string
                    city?: string
                    contact_email?: string | null
                    contact_phone?: string | null
                    country?: string
                    created_at?: string | null
                    description?: string | null
                    diocese?: string | null
                    founding_date?: string | null
                    history?: string | null
                    id?: string
                    image_url?: string | null
                    latitude?: number | null
                    logo_url?: string | null
                    longitude?: number | null
                    name?: string
                    primary_color?: string | null
                    secondary_color?: string | null
                    website?: string | null
                }
                Relationships: []
            }
            pastoral_members: {
                Row: {
                    bio: string | null
                    created_at: string | null
                    full_name: string
                    id: string
                    image_url: string | null
                    parish_id: string
                    rank_order: number | null
                    role: string
                    updated_at: string | null
                }
                Insert: {
                    bio?: string | null
                    created_at?: string | null
                    full_name: string
                    id?: string
                    image_url?: string | null
                    parish_id: string
                    rank_order?: number | null
                    role: string
                    updated_at?: string | null
                }
                Update: {
                    bio?: string | null
                    created_at?: string | null
                    full_name?: string
                    id?: string
                    image_url?: string | null
                    parish_id?: string
                    rank_order?: number | null
                    role?: string
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "pastoral_members_parish_id_fkey"
                        columns: ["parish_id"]
                        isOneToOne: false
                        referencedRelation: "parishes"
                        referencedColumns: ["id"]
                    },
                ]
            }
            profiles: {
                Row: {
                    avatar_url: string | null
                    created_at: string | null
                    email: string
                    full_name: string | null
                    id: string
                    parish_id: string | null
                    phone_number: string | null
                    role: string | null
                    updated_at: string | null
                }
                Insert: {
                    avatar_url?: string | null
                    created_at?: string | null
                    email: string
                    full_name?: string | null
                    id: string
                    parish_id?: string | null
                    phone_number?: string | null
                    role?: string | null
                    updated_at?: string | null
                }
                Update: {
                    avatar_url?: string | null
                    created_at?: string | null
                    email?: string
                    full_name?: string | null
                    id?: string
                    parish_id?: string | null
                    phone_number?: string | null
                    role?: string | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "profiles_parish_id_fkey"
                        columns: ["parish_id"]
                        isOneToOne: false
                        referencedRelation: "parishes"
                        referencedColumns: ["id"]
                    },
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
    PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
            Row: infer R
        }
    ? R
    : never
    : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
            Row: infer R
        }
    ? R
    : never
    : never

export type TablesInsert<
    PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Insert: infer I
    }
    ? I
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
    }
    ? I
    : never
    : never

export type TablesUpdate<
    PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Update: infer U
    }
    ? U
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
    }
    ? U
    : never
    : never

export type Enums<
    PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
    EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
    ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof Database
    }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
    ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
