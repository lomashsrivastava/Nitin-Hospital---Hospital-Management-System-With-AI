"""
Reports Views - Daily/Monthly Sales, Profit/Loss, GST, Top Products, Expiry Reports
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, F, DecimalField
from django.db.models.functions import TruncDate, TruncMonth
from django.utils import timezone
from datetime import timedelta, datetime

from billing.models import Invoice, InvoiceItem
from inventory.models import Medicine
from purchases.models import Purchase


class DailySalesReportView(APIView):
    """Daily sales data for the last 30 days"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        days = int(request.query_params.get('days', 30))
        start_date = timezone.now().date() - timedelta(days=days)
        
        daily_sales = Invoice.objects.filter(
            status='COMPLETED',
            created_at__date__gte=start_date
        ).annotate(
            date=TruncDate('created_at')
        ).values('date').annotate(
            total_sales=Sum('total'),
            invoice_count=Count('id'),
            total_tax=Sum('total_tax'),
        ).order_by('date')

        return Response({
            'data': list(daily_sales),
            'period': f'Last {days} days',
        })


class MonthlySalesReportView(APIView):
    """Monthly sales data for the last 12 months"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        months = int(request.query_params.get('months', 12))
        start_date = timezone.now().date() - timedelta(days=months * 30)
        
        monthly_sales = Invoice.objects.filter(
            status='COMPLETED',
            created_at__date__gte=start_date
        ).annotate(
            month=TruncMonth('created_at')
        ).values('month').annotate(
            total_sales=Sum('total'),
            invoice_count=Count('id'),
            total_tax=Sum('total_tax'),
        ).order_by('month')

        return Response({
            'data': list(monthly_sales),
            'period': f'Last {months} months',
        })


class ProfitLossReportView(APIView):
    """Profit and loss report for a date range"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        days = int(request.query_params.get('days', 30))
        start_date = timezone.now().date() - timedelta(days=days)
        end_date = timezone.now().date()

        # Parse custom dates if provided
        start_str = request.query_params.get('start_date')
        end_str = request.query_params.get('end_date')
        if start_str:
            start_date = datetime.strptime(start_str, '%Y-%m-%d').date()
        if end_str:
            end_date = datetime.strptime(end_str, '%Y-%m-%d').date()

        # Sales revenue
        sales = Invoice.objects.filter(
            status='COMPLETED',
            created_at__date__gte=start_date,
            created_at__date__lte=end_date,
        )
        total_revenue = float(sales.aggregate(total=Sum('total'))['total'] or 0)
        total_discount = float(sales.aggregate(total=Sum('discount_amount'))['total'] or 0)

        # Cost of goods sold (from invoice items)
        items = InvoiceItem.objects.filter(
            invoice__status='COMPLETED',
            invoice__created_at__date__gte=start_date,
            invoice__created_at__date__lte=end_date,
        )
        
        cogs = 0
        for item in items.select_related('medicine'):
            if item.medicine:
                cogs += float(item.medicine.purchase_price) * item.quantity
            else:
                cogs += float(item.unit_price) * item.quantity * 0.7  # Estimate

        # Purchase costs
        purchases_total = float(
            Purchase.objects.filter(
                created_at__date__gte=start_date,
                created_at__date__lte=end_date,
            ).aggregate(total=Sum('total'))['total'] or 0
        )

        gross_profit = total_revenue - cogs
        
        # Daily breakdown
        daily_pl = sales.annotate(
            date=TruncDate('created_at')
        ).values('date').annotate(
            revenue=Sum('total'),
            tax=Sum('total_tax'),
        ).order_by('date')

        return Response({
            'period': {'start': start_date, 'end': end_date},
            'total_revenue': round(total_revenue, 2),
            'cost_of_goods_sold': round(cogs, 2),
            'gross_profit': round(gross_profit, 2),
            'total_discount': round(total_discount, 2),
            'total_purchases': round(purchases_total, 2),
            'profit_margin': round((gross_profit / total_revenue * 100) if total_revenue > 0 else 0, 2),
            'invoice_count': sales.count(),
            'daily_data': list(daily_pl),
        })


class GSTReportView(APIView):
    """GST report with CGST/SGST/IGST breakdown"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        days = int(request.query_params.get('days', 30))
        start_date = timezone.now().date() - timedelta(days=days)

        start_str = request.query_params.get('start_date')
        end_str = request.query_params.get('end_date')
        end_date = timezone.now().date()
        if start_str:
            start_date = datetime.strptime(start_str, '%Y-%m-%d').date()
        if end_str:
            end_date = datetime.strptime(end_str, '%Y-%m-%d').date()

        invoices = Invoice.objects.filter(
            status='COMPLETED',
            created_at__date__gte=start_date,
            created_at__date__lte=end_date,
        )

        totals = invoices.aggregate(
            total_cgst=Sum('cgst'),
            total_sgst=Sum('sgst'),
            total_igst=Sum('igst'),
            total_tax=Sum('total_tax'),
            total_sales=Sum('total'),
            taxable_amount=Sum('taxable_amount'),
        )

        # GST rate wise breakdown
        rate_breakdown = InvoiceItem.objects.filter(
            invoice__status='COMPLETED',
            invoice__created_at__date__gte=start_date,
            invoice__created_at__date__lte=end_date,
        ).values('gst_rate').annotate(
            total_tax=Sum('tax_amount'),
            total_amount=Sum('total'),
            item_count=Count('id'),
        ).order_by('gst_rate')

        # Monthly GST
        monthly_gst = invoices.annotate(
            month=TruncMonth('created_at')
        ).values('month').annotate(
            cgst=Sum('cgst'),
            sgst=Sum('sgst'),
            igst=Sum('igst'),
            total_tax=Sum('total_tax'),
        ).order_by('month')

        return Response({
            'period': {'start': start_date, 'end': end_date},
            'summary': {
                'total_cgst': float(totals['total_cgst'] or 0),
                'total_sgst': float(totals['total_sgst'] or 0),
                'total_igst': float(totals['total_igst'] or 0),
                'total_tax': float(totals['total_tax'] or 0),
                'total_sales': float(totals['total_sales'] or 0),
                'taxable_amount': float(totals['taxable_amount'] or 0),
            },
            'rate_breakdown': list(rate_breakdown),
            'monthly_data': list(monthly_gst),
        })


class TopProductsReportView(APIView):
    """Top selling products"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        days = int(request.query_params.get('days', 30))
        limit = int(request.query_params.get('limit', 20))
        start_date = timezone.now().date() - timedelta(days=days)

        top_products = InvoiceItem.objects.filter(
            invoice__status='COMPLETED',
            invoice__created_at__date__gte=start_date,
        ).values(
            'medicine_name'
        ).annotate(
            total_quantity=Sum('quantity'),
            total_revenue=Sum('total'),
            sale_count=Count('id'),
        ).order_by('-total_quantity')[:limit]

        return Response({
            'period': f'Last {days} days',
            'data': list(top_products),
        })


class ExpiryReportView(APIView):
    """Expiry report - medicines expiring soon or already expired"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()
        
        # Already expired
        expired = Medicine.objects.filter(
            is_active=True,
            quantity__gt=0,
            expiry_date__lt=today,
        ).values('name', 'batch_number', 'expiry_date', 'quantity', 'selling_price').order_by('expiry_date')

        # Expiring in 30 days
        expiring_30 = Medicine.objects.filter(
            is_active=True,
            quantity__gt=0,
            expiry_date__gte=today,
            expiry_date__lte=today + timedelta(days=30),
        ).values('name', 'batch_number', 'expiry_date', 'quantity', 'selling_price').order_by('expiry_date')

        # Expiring in 90 days
        expiring_90 = Medicine.objects.filter(
            is_active=True,
            quantity__gt=0,
            expiry_date__gte=today + timedelta(days=30),
            expiry_date__lte=today + timedelta(days=90),
        ).values('name', 'batch_number', 'expiry_date', 'quantity', 'selling_price').order_by('expiry_date')

        # Calculate value of expired stock
        expired_value = sum(
            float(m['selling_price']) * m['quantity']
            for m in expired
        )

        return Response({
            'expired': list(expired),
            'expiring_30_days': list(expiring_30),
            'expiring_90_days': list(expiring_90),
            'expired_count': len(expired),
            'expiring_30_count': len(expiring_30),
            'expiring_90_count': len(expiring_90),
            'expired_stock_value': round(expired_value, 2),
        })
