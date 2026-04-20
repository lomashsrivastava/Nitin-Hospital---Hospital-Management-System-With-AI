from django.db import models

class Department(models.Model):
    name = models.CharField(max_length=200, unique=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name

class Doctor(models.Model):
    name = models.CharField(max_length=200)
    specialization = models.CharField(max_length=200)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, related_name='doctors')
    contact_number = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    opd_timings = models.CharField(max_length=200, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Dr. {self.name} - {self.specialization}"

class Staff(models.Model):
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other')
    ]
    name = models.CharField(max_length=200)
    role = models.CharField(max_length=150)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, default='M')
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, related_name='staff')
    contact_number = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    salary = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    shift_timings = models.CharField(max_length=200, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.role}"

class Room(models.Model):
    ROOM_TYPES = [
        ('NORMAL', 'Normal'),
        ('GENERAL_WARD', 'General Ward'),
        ('EMERGENCY', 'Emergency')
    ]
    room_number = models.CharField(max_length=50, unique=True)
    room_type = models.CharField(max_length=20, choices=ROOM_TYPES, default='NORMAL')
    floor = models.IntegerField(default=1)
    bed_count = models.IntegerField(default=1)
    is_occupied = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.room_number} ({self.get_room_type_display()})"

class Patient(models.Model):
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other')
    ]
    name = models.CharField(max_length=255)
    age = models.IntegerField()
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, default='M')
    contact_number = models.CharField(max_length=20)
    address = models.TextField(blank=True, default='')
    ailment = models.CharField(max_length=255, blank=True, default='')
    
    assigned_doctor = models.ForeignKey(Doctor, on_delete=models.SET_NULL, null=True, blank=True, related_name='patients')
    assigned_room = models.ForeignKey(Room, on_delete=models.SET_NULL, null=True, blank=True, related_name='patients')
    
    admission_date = models.DateTimeField(auto_now_add=True)
    is_discharged = models.BooleanField(default=False)
    
    def __str__(self):
        return self.name

class Appointment(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('CONFIRMED', 'Confirmed'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled')
    ]
    patient_name = models.CharField(max_length=255)
    contact_number = models.CharField(max_length=20)
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='appointments')
    appointment_date = models.DateField()
    appointment_time = models.TimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.patient_name} with {self.doctor.name} on {self.appointment_date}"

class LabTest(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed')
    ]
    CATEGORY_CHOICES = [
        ('PATHOLOGY', 'Pathology (Blood/Urine)'),
        ('RADIOLOGY', 'Radiology (X-Ray/MRI/CT)'),
        ('CARDIOLOGY', 'Cardiology (ECG)'),
        ('OTHER', 'Other')
    ]
    PRIORITY_CHOICES = [
        ('ROUTINE', 'Routine'),
        ('URGENT', 'Urgent'),
        ('STAT', 'STAT (Emergency)')
    ]
    patient_name = models.CharField(max_length=255)
    test_name = models.CharField(max_length=255)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='PATHOLOGY')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='ROUTINE')
    cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    referred_by = models.ForeignKey(Doctor, on_delete=models.SET_NULL, null=True, blank=True)
    result = models.TextField(blank=True, default='')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.test_name} for {self.patient_name}"

class PharmacyItem(models.Model):
    name = models.CharField(max_length=255, unique=True)
    stock_quantity = models.IntegerField(default=0)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    expiry_date = models.DateField(blank=True, null=True)
    manufacturer = models.CharField(max_length=255, blank=True, default='')

    def __str__(self):
        return self.name

class BloodStock(models.Model):
    blood_group = models.CharField(max_length=50, unique=True)
    bags_available = models.IntegerField(default=0)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.blood_group} - {self.bags_available} Bags"

class AmbulanceVehicle(models.Model):
    STATUS_CHOICES = [
        ('AVAILABLE', 'Available'),
        ('DISPATCHED', 'Dispatched'),
        ('MAINTENANCE', 'Under Maintenance')
    ]
    TYPE_CHOICES = [
        ('BLS', 'Basic Life Support (BLS)'),
        ('ALS', 'Advanced Life Support (ALS / Mobile ICU)'),
        ('PTS', 'Patient Transport Service (PTS)'),
    ]
    vehicle_number = models.CharField(max_length=50, unique=True)
    driver_name = models.CharField(max_length=255)
    contact_number = models.CharField(max_length=20)
    email = models.EmailField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='AVAILABLE')
    vehicle_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='BLS')
    has_o2 = models.BooleanField(default=False)
    has_defibrillator = models.BooleanField(default=False)
    has_ventilator = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.vehicle_number} ({self.driver_name})"

class AmbulanceDispatch(models.Model):
    ambulance = models.ForeignKey(AmbulanceVehicle, on_delete=models.CASCADE, related_name='dispatches')
    patient_name = models.CharField(max_length=255)
    pickup_location = models.TextField()
    drop_location = models.TextField()
    estimated_eta = models.CharField(max_length=50, blank=True, null=True)
    dispatch_time = models.DateTimeField(auto_now_add=True)
    is_completed = models.BooleanField(default=False)

    def __str__(self):
        return f"Dispatch {self.id} - {self.ambulance.vehicle_number}"
