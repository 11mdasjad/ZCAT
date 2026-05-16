import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma/client';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger/logger';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return errorResponse(new Error('Authentication required'), 401);
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    const whereClause: any = { userId: authUser.id };
    if (unreadOnly) {
      whereClause.isRead = false;
    }

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: authUser.id, isRead: false },
    });

    return successResponse({ notifications, unreadCount });
  } catch (error) {
    logger.error('Error fetching notifications:', error);
    return errorResponse(error as Error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return errorResponse(new Error('Authentication required'), 401);
    }

    const body = await req.json();
    const { notificationIds, markAllRead } = body;

    if (markAllRead) {
      await prisma.notification.updateMany({
        where: { userId: authUser.id, isRead: false },
        data: { isRead: true, readAt: new Date() },
      });
      return successResponse({ message: 'All notifications marked as read' });
    }

    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return errorResponse(new Error('Invalid notification IDs'), 400);
    }

    await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
        userId: authUser.id,
      },
      data: { isRead: true, readAt: new Date() },
    });

    return successResponse({ message: 'Notifications marked as read' });
  } catch (error) {
    logger.error('Error updating notifications:', error);
    return errorResponse(error as Error);
  }
}
