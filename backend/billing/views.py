"""
Billing Views - Create invoices, list invoices, generate PDFs
"""

from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django.http import HttpResponse
from decimal import Decimal

from .models import Invoice, InvoiceItem, Customer
from .serializers import (
    InvoiceSerializer, InvoiceListSerializer, InvoiceCreateSerializer,
    CustomerSerializer
)
from inventory.models import Medicine
from authentication.views import log_activity
from .pdf_generator import generate_invoice_pdf


from django.db import models as db_models


class CustomerViewSet(viewsets.ModelViewSet):
    """CRUD for customers"""
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def search(self, request):
        q = request.query_params.get('q', '').strip()
        if len(q) < 1:
            return Response([])
        customers = Customer.objects.filter(
            db_models.Q(name__icontains=q) | db_models.Q(phone__icontains=q)
        )[:10]
        return Response(CustomerSerializer(customers, many=True).data)


class InvoiceViewSet(viewsets.ModelViewSet):
    """Invoice management with auto-calculation and stock updates"""
    queryset = Invoice.objects.all().prefetch_related('items')
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'list':
            return InvoiceListSerializer
        return InvoiceSerializer

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        """Create a new invoice with items, auto-calculate GST, update stock"""
        serializer = InvoiceCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # Create invoice
        invoice = Invoice(
            invoice_number=Invoice.generate_invoice_number(),
            customer_name=data.get('customer_name', 'Walk-in Customer'),
            customer_phone=data.get('customer_phone', ''),
            payment_method=data.get('payment_method', 'CASH'),
            discount_type=data.get('discount_type', 'FIXED'),
            discount_value=data.get('discount_value', 0),
            notes=data.get('notes', ''),
            status='COMPLETED',
        )

        # Link customer if provided
        customer_id = data.get('customer_id')
        if customer_id:
            try:
                invoice.customer = Customer.objects.get(id=customer_id)
            except Customer.DoesNotExist:
                pass

        # Link patient if provided
        patient_id = data.get('patient_id')
        if patient_id:
            from hospital.models import Patient
            try:
                invoice.patient = Patient.objects.get(id=patient_id)
                invoice.customer_name = invoice.patient.name
                invoice.customer_phone = invoice.patient.contact_number
            except Patient.DoesNotExist:
                pass

        invoice.save()

        # Process items
        subtotal = Decimal('0')
        total_cgst = Decimal('0')
        total_sgst = Decimal('0')
        total_igst = Decimal('0')
        total_tax = Decimal('0')

        for item_data in data['items']:
            try:
                medicine = Medicine.objects.select_for_update().get(id=item_data['medicine_id'])
            except Medicine.DoesNotExist:
                raise serializers.ValidationError(f"Medicine with ID {item_data['medicine_id']} not found")

            # Check stock
            qty = item_data['quantity']
            if medicine.quantity < qty:
                raise serializers.ValidationError(
                    f"Insufficient stock for {medicine.name}. Available: {medicine.quantity}"
                )

            item = InvoiceItem(
                invoice=invoice,
                medicine=medicine,
                medicine_name=medicine.name,
                batch_number=medicine.batch_number,
                quantity=qty,
                unit_price=item_data['unit_price'],
                discount=item_data.get('discount', 0),
                gst_rate=item_data.get('gst_rate', medicine.gst_rate),
            )
            item.calculate_totals()
            item.save()

            # Update stock
            medicine.quantity -= qty
            medicine.save()

            subtotal += Decimal(str(item.unit_price)) * qty
            total_cgst += Decimal(str(item.cgst))
            total_sgst += Decimal(str(item.sgst))
            total_igst += Decimal(str(item.igst))
            total_tax += Decimal(str(item.tax_amount))

        # Calculate invoice totals
        invoice.subtotal = subtotal
        
        # Apply invoice-level discount
        if invoice.discount_type == 'PERCENTAGE':
            invoice.discount_amount = round(subtotal * invoice.discount_value / 100, 2)
        else:
            invoice.discount_amount = invoice.discount_value

        invoice.taxable_amount = subtotal - invoice.discount_amount
        invoice.cgst = total_cgst
        invoice.sgst = total_sgst
        invoice.igst = total_igst
        invoice.total_tax = total_tax
        invoice.total = invoice.taxable_amount + total_tax

        # Payment
        amount_paid = data.get('amount_paid', invoice.total)
        if amount_paid is None:
            amount_paid = invoice.total
        invoice.amount_paid = amount_paid
        invoice.change_amount = max(Decimal('0'), Decimal(str(amount_paid)) - invoice.total)

        # Handle credit
        if invoice.payment_method == 'CREDIT' and invoice.customer:
            invoice.customer.credit_balance += invoice.total
            invoice.customer.save()

        invoice.save()

        log_activity(
            request.user, 'CREATE_INVOICE',
            f'Invoice #{invoice.invoice_number}, Total: ₹{invoice.total}',
            request
        )

        return Response(
            InvoiceSerializer(invoice).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['get'])
    def pdf(self, request, pk=None):
        """Generate and download PDF invoice"""
        invoice = self.get_object()
        pdf_buffer = generate_invoice_pdf(invoice)
        
        response = HttpResponse(pdf_buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="Invoice_{invoice.invoice_number}.pdf"'
        return response

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel an invoice and restore stock"""
        invoice = self.get_object()
        
        if invoice.status == 'CANCELLED':
            return Response({'error': 'Invoice is already cancelled'}, status=400)

        with transaction.atomic():
            # Restore stock
            for item in invoice.items.all():
                if item.medicine:
                    item.medicine.quantity += item.quantity
                    item.medicine.save()

            # Restore credit if applicable
            if invoice.payment_method == 'CREDIT' and invoice.customer:
                invoice.customer.credit_balance -= invoice.total
                invoice.customer.save()

            invoice.status = 'CANCELLED'
            invoice.save()

        log_activity(request.user, 'CREATE_INVOICE', f'Cancelled Invoice #{invoice.invoice_number}', request)
        return Response(InvoiceSerializer(invoice).data)

    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """Get billing stats for dashboard"""
        from django.utils import timezone
        from django.db.models import Sum, Count
        from datetime import timedelta

        today = timezone.now().date()
        
        # Today's sales
        today_invoices = Invoice.objects.filter(
            created_at__date=today, status='COMPLETED'
        )
        today_sales = today_invoices.aggregate(
            total=Sum('total'), count=Count('id')
        )

        # This month's sales
        month_start = today.replace(day=1)
        month_invoices = Invoice.objects.filter(
            created_at__date__gte=month_start, status='COMPLETED'
        )
        month_sales = month_invoices.aggregate(
            total=Sum('total'), count=Count('id')
        )

        # Recent invoices
        recent = Invoice.objects.filter(status='COMPLETED')[:5]

        return Response({
            'today_sales': float(today_sales['total'] or 0),
            'today_count': today_sales['count'] or 0,
            'month_sales': float(month_sales['total'] or 0),
            'month_count': month_sales['count'] or 0,
            'recent_invoices': InvoiceListSerializer(recent, many=True).data,
        })
