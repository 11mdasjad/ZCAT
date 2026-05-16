import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma/client';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger/logger';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return errorResponse(new Error('Authentication required'), 401);
    }

    // Verify Admin Role
    const userRow = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { role: true },
    });

    if (!userRow || !['ADMIN', 'SUPER_ADMIN'].includes(userRow.role)) {
      return errorResponse(new Error('Unauthorized: Admin access required'), 403);
    }

    const body = await req.json();
    const { title, message } = body;

    if (!title || !message) {
      return errorResponse(new Error('Title and message are required'), 400);
    }

    // Fetch all active users
    const activeUsers = await prisma.user.findMany({
      where: { isActive: true },
      select: { id: true },
    });

    if (activeUsers.length === 0) {
      return successResponse({ message: 'No active users found to broadcast to', sentCount: 0 });
    }

    // Bulk insert notifications
    const notificationsData = activeUsers.map(user => ({
      userId: user.id,
      title,
      message,
      type: 'SYSTEM_ALERT' as const,
      data: { isBroadcast: true, broadcastBy: authUser.id },
    }));

    await prisma.notification.createMany({
      data: notificationsData,
    });

    logger.info(`Broadcast sent by ${authUser.id} to ${activeUsers.length} users`);

    return successResponse({ 
      message: 'Broadcast sent successfully', 
      sentCount: activeUsers.length 
    });
  } catch (error) {
    logger.error('Error broadcasting notification:', error);
    return errorResponse(error as Error);
  }
}
