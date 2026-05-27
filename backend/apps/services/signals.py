from decimal import Decimal

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

from .models import Piezas


@receiver(post_save, sender=Piezas)
@receiver(post_delete, sender=Piezas)
def actualizar_totales_orden(sender, instance, **kwargs):

    orden = instance.orden_servicio

    total_piezas = Decimal('0.00')

    for pieza in orden.piezas.all():
        total_piezas += pieza.costo

    orden.total_piezas = total_piezas

    orden.total = (
        orden.subtotal +
        orden.iva +
        orden.total_piezas
    )

    orden.save(
        update_fields=[
            'total',
            'total_piezas'
        ]
    )