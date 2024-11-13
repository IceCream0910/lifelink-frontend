import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    realtime: {
        params: {
            eventsPerSecond: 10,
        },
    },
})

export const subscribeToHospital = (hospitalId, callback) => {
    return supabase
        .channel(`hospital-${hospitalId}`)
        .on(
            'postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'hospitals',
                filter: `id=eq.${hospitalId}`
            },
            callback
        )
        .subscribe()
}

export const subscribeToHospitals = (hospitals, onUpdate) => {
    const subscriptions = hospitals.map(hospital =>
        subscribeToHospital(
            hospital.id,
            (payload) => onUpdate(payload.new)
        )
    )

    return () => {
        subscriptions.forEach(channel => {
            supabase.removeChannel(channel)
        })
    }
}