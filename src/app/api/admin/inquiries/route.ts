import { NextResponse } from 'next/server';
import { prisma } from '@/services/db';
import { InquiryStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function PATCH(request: Request) {
  try {
    const { inquiryId, status, adminNotes } = await request.json();

    if (!inquiryId) {
      return NextResponse.json(
        { success: false, error: 'Inquiry ID is required.' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    
    if (status) {
      if (!Object.values(InquiryStatus).includes(status)) {
        return NextResponse.json(
          { success: false, error: `Invalid InquiryStatus: ${status}` },
          { status: 400 }
        );
      }
      updateData.status = status as InquiryStatus;
    }

    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes;
    }

    const updatedInquiry = await prisma.inquiry.update({
      where: { id: inquiryId },
      data: updateData,
    });

    return NextResponse.json({ success: true, inquiry: updatedInquiry });
  } catch (error: any) {
    console.error('Error updating inquiry:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update inquiry.' },
      { status: 500 }
    );
  }
}
export async function GET() {
  try {
    const inquiries = await prisma.inquiry.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json({ success: true, inquiries });
  } catch (error: any) {
    console.error('Error fetching admin inquiries:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch inquiries.' },
      { status: 500 }
    );
  }
}
