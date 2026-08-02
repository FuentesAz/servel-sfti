from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from django.db.models import Q

User = get_user_model()

class EmailOrUsernameBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        if not username or not password:
            return None

        clean_username = str(username).strip()
        clean_password = str(password).strip()

        print(f"[AUTH_DEBUG] Attempting auth for username: '{username}' (clean: '{clean_username}')")

        # Query user by username or email (case-insensitive)
        try:
            user = User.objects.filter(
                Q(username__iexact=clean_username) | Q(email__iexact=clean_username)
            ).first()

            if user:
                pwd_ok = user.check_password(clean_password)
                print(f"[AUTH_DEBUG] User found: '{user.username}'. Password match: {pwd_ok}")
                if pwd_ok:
                    return user
            else:
                print(f"[AUTH_DEBUG] User NOT found in database: '{clean_username}'")
        except Exception as e:
            print("[AUTH_DEBUG] Authentication exception:", e)
            return None

        return None

