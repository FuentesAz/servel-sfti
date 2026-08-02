from django.urls import include, path

from rest_framework.routers import DefaultRouter

from .api_views import (
    TecnicoViewSet,
    OrdenServicioViewSet,
    PiezasViewSet,
    PagoTecnicoViewSet
)

from .auth_views import (
    RegisterView,
    PendingUsersView,
    ApproveUserView,
    RejectUserView,
    CheckUserStatusView
)

routers = DefaultRouter()

routers.register(
    'pagos',
    PagoTecnicoViewSet
)

routers.register(
    'tecnicos',
    TecnicoViewSet
)

routers.register(
    'ordenes',
    OrdenServicioViewSet
)

routers.register(
    'piezas',
    PiezasViewSet
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('users/pending/', PendingUsersView.as_view(), name='pending_users'),
    path('users/<int:user_id>/approve/', ApproveUserView.as_view(), name='approve_user'),
    path('users/<int:user_id>/reject/', RejectUserView.as_view(), name='reject_user'),
    path('users/check-status/', CheckUserStatusView.as_view(), name='check_user_status'),
    path('users/check-status', CheckUserStatusView.as_view()),

    path('', include(routers.urls))
]