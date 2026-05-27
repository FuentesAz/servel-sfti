from django.db import models
from decimal import Decimal
from django.utils import timezone


# Create your models here.

#------ GENERA LA INFORMACION DEL TECNICO --------
class Tecnico(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name
#--------------------------------------------------

class OrdenServicio(models.Model):
    class StatusChoice(models.TextChoices):
        PENDING = 'pending','Pendiente'
        PAID = 'paid','Pagado'
    
    class PaymentMethodChoices(models.TextChoices):
        CASH = 'cash', 'Efectivo'
        TRANSFER = 'transfer' , 'Transferencia'
        CARD = 'card' , 'Tarjeta'
    
    numero_orden = models.CharField(
        max_length=20,
        unique=True
    )
    
    tecnico = models.ForeignKey(
        Tecnico,
        on_delete=models.CASCADE,
        related_name='Orden_servicio'
    )
    
    status = models.CharField(
        max_length=20,
        choices=StatusChoice.choices,
        default=StatusChoice.PENDING
    )
    
    costo_servicio = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )
    
    facturado = models.BooleanField(default=False)
    
    metodo_pago = models.CharField(
        max_length=20,
        choices=PaymentMethodChoices.choices,
        default=PaymentMethodChoices.CASH)
    
    subtotal = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )
    
    iva = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )
    
    total = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )
    
    total_piezas = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )
    
    comision = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )
    
    ganancia_taller = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )
    
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    
    fecha_cierre = models.DateTimeField(
        blank=True,
        null=True
    )
    
    def save(self, *args, **kwargs):
        
        self.subtotal = self.costo_servicio
        
        if self.facturado:
            self.iva = self.costo_servicio * Decimal('0.16')
        else:
            self.iva = Decimal('0.00')
            
        self.comision = self.costo_servicio / Decimal('2')
        self.ganancia_taller = self.costo_servicio / Decimal('2')
        
        if self.status == 'paid' and not self.fecha_cierre:
            self.fecha_cierre = timezone.now()
        
        super().save(*args, **kwargs)

        self.total = self.subtotal + self.iva  
        
    def __str__(self):
        
        facturado_str = "Sí" if self.facturado else "No"
        
        fecha_c = self.fecha_creacion.strftime('%d/%m/%Y') if self.fecha_creacion else "N/A"
        fecha_f = self.fecha_cierre.strftime('%d/%m/%Y') if self.fecha_cierre else "N/A"
        
        return (
        f"Orden: {self.numero_orden} | "
        f"Técnico: {self.tecnico} | "
        f"Pago: {self.metodo_pago} | "
        f"Total: ${self.total} | "
        f"Estatus: {self.status} | "
        f"Facturado: {facturado_str} | "
        f"Creación: {fecha_c} | "
        f"Cierre: {fecha_f}"
    )
    
class Piezas(models.Model):
    
    class PaymentMethodChoices(models.TextChoices):
        CASH = 'cash', 'Efectivo'
        TRANSFER = 'transfer', 'Transferencia'
        CARD = 'card', 'Tarjeta'
    
    orden_servicio = models.ForeignKey(
        OrdenServicio,
        on_delete=models.CASCADE,
        related_name='piezas'
    )
    
    nombre = models.CharField(max_length=255)
    
    costo = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )
    
    metodo_pago = models.CharField(
        max_length=20,
        choices=PaymentMethodChoices.choices
    )
    
    comentarios = models.TextField(
        blank=True,
        null=True
    )
    
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.nombre
    
    