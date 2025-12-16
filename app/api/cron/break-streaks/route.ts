import { createClient } from '@/services/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Daily Cron Job to Break Inactive Streaks
 * 
 * This endpoint should be called once per day (e.g., at midnight UTC)
 * by a cron service like:
 * - Vercel Cron
 * - GitHub Actions
 * - cron-job.org
 * 
 * Add this to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/break-streaks",
 *     "schedule": "0 0 * * *"
 *   }]
 * }
 */

export async function GET(request: Request) {
    try {
        // Verify this is a legitimate cron request
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = await createClient();

        console.log('[CRON] Breaking inactive streaks...');

        // Call the database function
        const { data, error } = await supabase.rpc('break_inactive_streaks_api');

        if (error) {
            console.error('[CRON] Error breaking streaks:', error);
            return NextResponse.json({
                success: false,
                error: error.message
            }, { status: 500 });
        }

        console.log('[CRON] Result:', data);

        return NextResponse.json({
            success: true,
            data,
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error('[CRON] Unexpected error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

// Allow manual testing in development
export async function POST(request: Request) {
    if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json({ error: 'Only available in development' }, { status: 403 });
    }

    return GET(request);
}
