from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import (
    Department, Doctor, Staff, Room, Patient,
    Appointment, LabTest, PharmacyItem, BloodStock,
    AmbulanceVehicle, AmbulanceDispatch
)
from .serializers import (
    DepartmentSerializer, DoctorSerializer, StaffSerializer, RoomSerializer, PatientSerializer,
    AppointmentSerializer, LabTestSerializer, PharmacyItemSerializer, BloodStockSerializer,
    AmbulanceVehicleSerializer, AmbulanceDispatchSerializer
)

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all().order_by('name')
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]

class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.all().order_by('name')
    serializer_class = DoctorSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        department_id = self.request.query_params.get('department', None)
        if department_id is not None:
            queryset = queryset.filter(department_id=department_id)
        
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(name__icontains=search) | queryset.filter(specialization__icontains=search)
            
        return queryset

class StaffViewSet(viewsets.ModelViewSet):
    queryset = Staff.objects.all().order_by('name')
    serializer_class = StaffSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        department_id = self.request.query_params.get('department', None)
        if department_id is not None:
            queryset = queryset.filter(department_id=department_id)
        
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(name__icontains=search) | queryset.filter(role__icontains=search)
            
        return queryset

class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all().order_by('floor', 'room_number')
    serializer_class = RoomSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        room_type = self.request.query_params.get('type', None)
        unoccupied = self.request.query_params.get('unoccupied', None)
        
        if room_type:
            queryset = queryset.filter(room_type=room_type)
        if unoccupied == 'true':
            queryset = queryset.filter(is_occupied=False)
            
        return queryset

class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all().order_by('-admission_date')
    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(name__icontains=search) | queryset.filter(contact_number__icontains=search) | queryset.filter(ailment__icontains=search)
        return queryset

class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all().order_by('-appointment_date', '-appointment_time')
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

class LabTestViewSet(viewsets.ModelViewSet):
    queryset = LabTest.objects.all().order_by('-created_at')
    serializer_class = LabTestSerializer
    permission_classes = [IsAuthenticated]

class PharmacyItemViewSet(viewsets.ModelViewSet):
    queryset = PharmacyItem.objects.all().order_by('name')
    serializer_class = PharmacyItemSerializer
    permission_classes = [IsAuthenticated]

class BloodStockViewSet(viewsets.ModelViewSet):
    queryset = BloodStock.objects.all().order_by('blood_group')
    serializer_class = BloodStockSerializer
    permission_classes = [IsAuthenticated]

class AmbulanceVehicleViewSet(viewsets.ModelViewSet):
    queryset = AmbulanceVehicle.objects.all().order_by('vehicle_number')
    serializer_class = AmbulanceVehicleSerializer
    permission_classes = [IsAuthenticated]

class AmbulanceDispatchViewSet(viewsets.ModelViewSet):
    queryset = AmbulanceDispatch.objects.all().order_by('-dispatch_time')
    serializer_class = AmbulanceDispatchSerializer
    permission_classes = [IsAuthenticated]
