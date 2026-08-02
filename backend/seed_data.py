import os
import django
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.services.models import Tecnico, OrdenServicio, PagoTecnico
from django.contrib.auth.models import User

def seed():
    # Create Admin & Zared Superusers (handling case variants for mobile keyboards)
    users_to_seed = [
        ('zared', '1234'),
        ('Zared', '1234'),
        ('admin', 'admin123'),
        ('Admin', 'admin123')
    ]
    for uname, pwd in users_to_seed:
        if not User.objects.filter(username=uname).exists():
            User.objects.create_superuser(uname, f'{uname.lower()}@servel.com', pwd)
            print(f"Superuser '{uname}' created with password '{pwd}'.")
        else:
            u = User.objects.get(username=uname)
            u.set_password(pwd)
            u.save()
            print(f"User '{uname}' password updated to '{pwd}'.")

    # Create Technicians
    angel, _ = Tecnico.objects.get_or_create(id=1, defaults={'name': 'Angel'})
    jonatan, _ = Tecnico.objects.get_or_create(id=2, defaults={'name': 'Jonatan'})
    moises, _ = Tecnico.objects.get_or_create(id=3, defaults={'name': 'Moises'})

    print("Technicians seeded.")

    # Create PagoTecnico
    pago, _ = PagoTecnico.objects.get_or_create(
        id=1,
        defaults={
            'total_ordenes': 8,
            'ingreso_total': Decimal('7968.40'),
            'total_comision': Decimal('3845.00'),
            'total_iva': Decimal('278.40'),
            'total_piezas': Decimal('0.00'),
        }
    )
    print("PagoTecnico seeded.")

    # Create Sample Orders
    sample_orders = [
        {'id': 706, 'numero_orden': '706', 'tecnico': moises, 'status': 'pending', 'costo_servicio': Decimal('950.00'), 'facturado': False, 'metodo_pago': 'cash'},
        {'id': 737, 'numero_orden': '737', 'tecnico': moises, 'status': 'pending', 'costo_servicio': Decimal('250.00'), 'facturado': False, 'metodo_pago': 'cash'},
        {'id': 729, 'numero_orden': '729', 'tecnico': jonatan, 'status': 'pending', 'costo_servicio': Decimal('200.00'), 'facturado': False, 'metodo_pago': 'transfer'},
        {'id': 735, 'numero_orden': '735', 'tecnico': jonatan, 'status': 'pending', 'costo_servicio': Decimal('500.00'), 'facturado': False, 'metodo_pago': 'cash'},
        {'id': 732, 'numero_orden': '732', 'tecnico': angel, 'status': 'paid', 'costo_servicio': Decimal('754.00'), 'facturado': True, 'metodo_pago': 'card', 'pago_tecnico': pago},
        {'id': 742, 'numero_orden': '742', 'tecnico': angel, 'status': 'paid', 'costo_servicio': Decimal('450.00'), 'facturado': False, 'metodo_pago': 'cash', 'pago_tecnico': pago},
        {'id': 722, 'numero_orden': '722', 'tecnico': angel, 'status': 'paid', 'costo_servicio': Decimal('950.00'), 'facturado': False, 'metodo_pago': 'cash', 'pago_tecnico': pago},
        {'id': 723, 'numero_orden': '723', 'tecnico': angel, 'status': 'paid', 'costo_servicio': Decimal('1000.00'), 'facturado': False, 'metodo_pago': 'transfer', 'pago_tecnico': pago},
        {'id': 702, 'numero_orden': '702', 'tecnico': angel, 'status': 'paid', 'costo_servicio': Decimal('1400.00'), 'facturado': False, 'metodo_pago': 'cash', 'pago_tecnico': pago},
        {'id': 739, 'numero_orden': '739', 'tecnico': angel, 'status': 'paid', 'costo_servicio': Decimal('650.00'), 'facturado': False, 'metodo_pago': 'cash', 'pago_tecnico': pago},
        {'id': 725, 'numero_orden': '725', 'tecnico': angel, 'status': 'paid', 'costo_servicio': Decimal('1500.00'), 'facturado': False, 'metodo_pago': 'cash', 'pago_tecnico': pago},
        {'id': 712, 'numero_orden': '712', 'tecnico': angel, 'status': 'paid', 'costo_servicio': Decimal('1264.40'), 'facturado': True, 'metodo_pago': 'card', 'pago_tecnico': pago},
    ]

    for ord_data in sample_orders:
        ord_id = ord_data.pop('id')
        orden, created = OrdenServicio.objects.get_or_create(id=ord_id, defaults=ord_data)
        if not created and ord_data.get('pago_tecnico'):
            orden.pago_tecnico = ord_data['pago_tecnico']
            orden.save()

    print("Sample orders and payment history seeded successfully!")

if __name__ == '__main__':
    seed()
