from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.contrib.auth.models import User
from django.db.models import Q

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username', '').strip()
        email = request.data.get('email', '').strip()
        password = request.data.get('password', '').strip()
        full_name = request.data.get('first_name', '').strip()

        if not username or not password:
            return Response(
                {'detail': 'El usuario y la contraseña son requeridos.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if username or email already exists
        if User.objects.filter(username__iexact=username).exists():
            return Response(
                {'detail': 'El nombre de usuario ya está registrado.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if email and User.objects.filter(email__iexact=email).exists():
            return Response(
                {'detail': 'El correo electrónico ya está registrado.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create user as inactive (pending admin approval)
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=full_name,
            is_active=False
        )

        return Response(
            {
                'detail': 'Solicitud de registro enviada con éxito. Tu cuenta debe ser aprobada por el administrador antes de ingresar.',
                'username': user.username
            },
            status=status.HTTP_201_CREATED
        )


class PendingUsersView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        pending_users = User.objects.filter(is_active=False).order_by('-date_joined')
        data = [
            {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'date_joined': user.date_joined.isoformat() if user.date_joined else None,
                'is_active': user.is_active
            }
            for user in pending_users
        ]
        return Response(data, status=status.HTTP_200_OK)


class ApproveUserView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            user.is_active = True
            user.save()
            return Response({'detail': f'Usuario {user.username} aprobado correctamente.'}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'detail': 'Usuario no encontrado.'}, status=status.HTTP_404_NOT_FOUND)


class RejectUserView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            username = user.username
            user.delete()
            return Response({'detail': f'Solicitud de usuario {username} rechazada y eliminada.'}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'detail': 'Usuario no encontrado.'}, status=status.HTTP_404_NOT_FOUND)


class CheckUserStatusView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username', '').strip()
        if not username:
            return Response({'status': 'unknown'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(
            Q(username__iexact=username) | Q(email__iexact=username)
        ).first()

        if user:
            if not user.is_active:
                return Response({'status': 'pending', 'detail': 'La cuenta existe pero está pendiente de aprobación por el administrador.'}, status=status.HTTP_200_OK)
            return Response({'status': 'active'}, status=status.HTTP_200_OK)
        return Response({'status': 'not_found'}, status=status.HTTP_404_NOT_FOUND)

