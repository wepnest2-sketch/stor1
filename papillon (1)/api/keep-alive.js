import { createClient } from '@supabase/supabase-js'

// Use environment variables for security, or fallback to hardcoded values from src/lib/supabase.ts if not set
const supabaseUrl = process.env.SUPABASE_URL || 'https://mdikhwuovponxkkjvfhl.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kaWtod3VvdnBvbnhra2p2ZmhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4MTc0NTIsImV4cCI6MjA4NzM5MzQ1Mn0.iRp1E4k4DVXdhts6lOYK9DXFCZ1PQlvvnF7U_v2U3KQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default async function handler(req, res) {
    try {
        // A simple query to wake up the database
        const { data, error } = await supabase.from('products').select('id').limit(1)

        if (error) throw error;

        return res.status(200).json({
            success: true,
            message: 'Database is awake and Papillon Shop is ready!',
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        console.error('Keep-alive error:', err);
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
}
