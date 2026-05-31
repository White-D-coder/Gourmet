import { NextResponse } from 'next/server';
import { prisma } from '@/services/db';
import { InquiryStatus } from '@prisma/client';
import { EmailService } from '@/services/email.service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      companyName,
      contactName,
      email,
      phone,
      budget,
      quantityRange,
      occasion,
      requirements,
    } = body;

    // Validate required fields
    if (!companyName || !contactName || !email) {
      return NextResponse.json(
        { success: false, error: 'Company Name, Contact Name, and Email are required fields.' },
        { status: 400 }
      );
    }

    // Resolve or create User record
    const nameParts = (contactName || '').trim().split(/\s+/);
    const firstName = nameParts[0] || null;
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : null;

    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          role: 'CORPORATE_BUYER',
          firstName,
          lastName,
          phone: phone || null,
        },
      });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          firstName: user.firstName || firstName,
          lastName: user.lastName || lastName,
          phone: user.phone || phone || null,
          role: user.role === 'CUSTOMER' ? 'CORPORATE_BUYER' : user.role,
        },
      });
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        userId: user.id,
        companyName,
        contactName,
        email,
        phone,
        budget: budget ? String(budget) : null,
        quantityRange: quantityRange ? String(quantityRange) : null,
        occasion,
        requirements,
        status: InquiryStatus.NEW,
      },
    });

    // Send visual mock emails
    await EmailService.sendInquiryEmails(inquiry);

    return NextResponse.json({ success: true, inquiry });
  } catch (error: any) {
    console.error('Error creating inquiry:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit inquiry.' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const inquiries = await prisma.inquiry.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json({ success: true, inquiries });
  } catch (error: any) {
    console.error('Error fetching inquiries:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch inquiries' },
      { status: 500 }
    );
  }
}
