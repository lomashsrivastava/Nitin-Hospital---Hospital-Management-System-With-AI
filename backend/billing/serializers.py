"""
Billing Serializers
"""

from rest_framework import serializers
from .models import Invoice, InvoiceItem, Customer


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class InvoiceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceItem
        fields = '__all__'
        read_only_fields = ['invoice', 'cgst', 'sgst', 'igst', 'tax_amount', 'total']


class InvoiceItemCreateSerializer(serializers.Serializer):
    """Serializer for creating invoice items (used inside invoice creation)"""
    medicine_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)
    unit_price = serializers.DecimalField(max_digits=10, decimal_places=2)
    discount = serializers.DecimalField(max_digits=10, decimal_places=2, default=0)
    gst_rate = serializers.IntegerField(default=12)


class InvoiceCreateSerializer(serializers.Serializer):
    """Serializer for creating a complete invoice with items"""
    customer_name = serializers.CharField(max_length=255, default='Walk-in Customer')
    customer_phone = serializers.CharField(max_length=20, required=False, default='', allow_blank=True)
    customer_id = serializers.IntegerField(required=False, allow_null=True)
    patient_id = serializers.IntegerField(required=False, allow_null=True)
    payment_method = serializers.ChoiceField(choices=Invoice.PAYMENT_CHOICES, default='CASH')
    discount_type = serializers.ChoiceField(choices=Invoice.DISCOUNT_TYPE_CHOICES, default='FIXED')
    discount_value = serializers.DecimalField(max_digits=10, decimal_places=2, default=0)
    amount_paid = serializers.DecimalField(max_digits=12, decimal_places=2, required=False)
    notes = serializers.CharField(required=False, default='', allow_blank=True)
    items = InvoiceItemCreateSerializer(many=True)


class InvoiceSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True, read_only=True)
    customer_detail = CustomerSerializer(source='customer', read_only=True)
    
    class Meta:
        model = Invoice
        fields = '__all__'
        read_only_fields = [
            'invoice_number', 'subtotal', 'discount_amount', 'taxable_amount',
            'cgst', 'sgst', 'igst', 'total_tax', 'total', 'change_amount',
            'created_at', 'updated_at'
        ]


class InvoiceListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for invoice list"""
    item_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'customer_name', 'customer_phone',
            'total', 'payment_method', 'status', 'created_at', 'item_count'
        ]

    def get_item_count(self, obj):
        return obj.items.count()
