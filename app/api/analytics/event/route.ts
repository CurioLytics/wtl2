import { createClient } from '@/services/supabase/server';
import { NextResponse } from 'next/server';
import { analyticsService } from '@/services/analytics/analytics-service';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { eventType, metadata } = body;

        if (!eventType) {
            return NextResponse.json({ error: 'Event type is required' }, { status: 400 });
        }

        await analyticsService.trackLearningEvent(user.id, eventType, metadata);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error tracking learning event:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
