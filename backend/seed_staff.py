import os
import django
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nitin_billing.settings')
django.setup()

from hospital.models import Department, Staff

def seed_staff():
    roles = ['Nurse', 'Ward Boy', 'Receptionist', 'Lab Technician', 'Pharmacist', 'Sweeper']
    shifts = ['Morning (8AM - 4PM)', 'Evening (4PM - 12AM)', 'Night (12AM - 8AM)', 'General (10AM - 6PM)']
    
    male_names = ['Rahul Sharma', 'Amit Kumar', 'Ravi Singh', 'Deepak Patel', 'Suresh Verma', 'Mohit Das', 'Vikram Yadav', 'Ajay Gupta', 'Vijay Mishra', 'Ramesh Tiwari']
    female_names = ['Priya Singh', 'Neha Sharma', 'Anjali Kumar', 'Pooja Patel', 'Kavita Verma', 'Sneha Das', 'Riya Yadav', 'Megha Gupta', 'Swati Mishra', 'Nisha Tiwari']

    departments = list(Department.objects.all())
    if not departments:
        print("No departments found. Creating default departments...")
        depts_to_create = ['General Ward', 'ICU', 'Emergency', 'Pathology Lab', 'Pharmacy', 'OPD']
        for dept in depts_to_create:
            Department.objects.get_or_create(name=dept)
        departments = list(Department.objects.all())

    # Create 10 males and 10 females
    staff_count = 0
    for name in male_names:
        Staff.objects.get_or_create(
            name=name,
            defaults={
                'role': random.choice(roles),
                'gender': 'M',
                'department': random.choice(departments),
                'contact_number': f"9{random.randint(100000000, 999999999)}",
                'email': f"{name.lower().replace(' ', '.')}@hospital.com",
                'salary': random.randint(15000, 45000),
                'shift_timings': random.choice(shifts)
            }
        )
        staff_count += 1
        
    for name in female_names:
        Staff.objects.get_or_create(
            name=name,
            defaults={
                'role': random.choice(roles),
                'gender': 'F',
                'department': random.choice(departments),
                'contact_number': f"9{random.randint(100000000, 999999999)}",
                'email': f"{name.lower().replace(' ', '.')}@hospital.com",
                'salary': random.randint(15000, 45000),
                'shift_timings': random.choice(shifts)
            }
        )
        staff_count += 1

    print(f"Successfully seeded 20 staff members (10 Male, 10 Female).")

if __name__ == '__main__':
    seed_staff()
