from rest_framework import serializers
from .models import (
    Department, Doctor, Staff, Room, Patient,
    Appointment, LabTest, PharmacyItem, BloodStock,
    AmbulanceVehicle, AmbulanceDispatch
)

class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = '__all__'

class PatientSerializer(serializers.ModelSerializer):
    assigned_doctor_name = serializers.ReadOnlyField(source='assigned_doctor.name')
    assigned_room_number = serializers.ReadOnlyField(source='assigned_room.room_number')
    
    class Meta:
        model = Patient
        fields = '__all__'

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'

class DoctorSerializer(serializers.ModelSerializer):
    department_name = serializers.ReadOnlyField(source='department.name')
    
    class Meta:
        model = Doctor
        fields = '__all__'
class StaffSerializer(serializers.ModelSerializer):
    department_name = serializers.ReadOnlyField(source='department.name')
    
    class Meta:
        model = Staff
        fields = '__all__'

class AppointmentSerializer(serializers.ModelSerializer):
    doctor_name = serializers.ReadOnlyField(source='doctor.name')
    class Meta:
        model = Appointment
        fields = '__all__'

class LabTestSerializer(serializers.ModelSerializer):
    referred_by_name = serializers.ReadOnlyField(source='referred_by.name')
    class Meta:
        model = LabTest
        fields = '__all__'

class PharmacyItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PharmacyItem
        fields = '__all__'

class BloodStockSerializer(serializers.ModelSerializer):
    class Meta:
        model = BloodStock
        fields = '__all__'

class AmbulanceVehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = AmbulanceVehicle
        fields = '__all__'

class AmbulanceDispatchSerializer(serializers.ModelSerializer):
    ambulance_number = serializers.ReadOnlyField(source='ambulance.vehicle_number')
    driver_name = serializers.ReadOnlyField(source='ambulance.driver_name')
    class Meta:
        model = AmbulanceDispatch
        fields = '__all__'
