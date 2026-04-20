from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DepartmentViewSet, DoctorViewSet, StaffViewSet, RoomViewSet, PatientViewSet,
    AppointmentViewSet, LabTestViewSet, PharmacyItemViewSet, BloodStockViewSet,
    AmbulanceVehicleViewSet, AmbulanceDispatchViewSet
)

router = DefaultRouter()
router.register(r'departments', DepartmentViewSet)
router.register(r'doctors', DoctorViewSet)
router.register(r'staff', StaffViewSet)
router.register(r'rooms', RoomViewSet)
router.register(r'patients', PatientViewSet)
router.register(r'appointments', AppointmentViewSet)
router.register(r'lab-tests', LabTestViewSet)
router.register(r'pharmacy-items', PharmacyItemViewSet)
router.register(r'blood-stock', BloodStockViewSet)
router.register(r'ambulance-vehicles', AmbulanceVehicleViewSet)
router.register(r'ambulance-dispatch', AmbulanceDispatchViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
