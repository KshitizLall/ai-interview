import re
import zxcvbn
from typing import Tuple, Dict, Any
from passlib.context import CryptContext
from app.core.config import settings

# Initialize password context with higher security
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=settings.BCRYPT_ROUNDS
)


class PasswordValidator:
    """Enhanced password validation with strength checking"""
    
    @staticmethod
    def validate_password_strength(password: str) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Comprehensive password validation with strength analysis
        Returns: (is_valid, message, details)
        """
        if not password:
            return False, "Password is required", {}
        
        # Length checks
        if len(password) < settings.PASSWORD_MIN_LENGTH:
            return False, f"Password must be at least {settings.PASSWORD_MIN_LENGTH} characters long", {}
        
        if len(password) > settings.PASSWORD_MAX_LENGTH:
            return False, f"Password must not exceed {settings.PASSWORD_MAX_LENGTH} characters", {}
        
        # Character composition checks
        validation_errors = []
        
        if settings.PASSWORD_REQUIRE_LOWERCASE and not re.search(r'[a-z]', password):
            validation_errors.append("at least one lowercase letter")
        
        if settings.PASSWORD_REQUIRE_UPPERCASE and not re.search(r'[A-Z]', password):
            validation_errors.append("at least one uppercase letter")
        
        if settings.PASSWORD_REQUIRE_DIGITS and not re.search(r'\d', password):
            validation_errors.append("at least one digit")
        
        if settings.PASSWORD_REQUIRE_SYMBOLS and not re.search(r'[!@#$%^&*(),.?\":{}|<>]', password):
            validation_errors.append("at least one special character (!@#$%^&*(),.?\":{}|<>)")
        
        if validation_errors:
            return False, f"Password must contain {', '.join(validation_errors)}", {}
        
        # Common password patterns to reject
        common_patterns = [
            r'(.)\1{3,}',  # 4+ repeated characters
            r'(012|123|234|345|456|567|678|789|890)',  # Sequential numbers
            r'(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)',  # Sequential letters
            r'(qwe|asd|zxc|qaz|wsx|edc)',  # Keyboard patterns
        ]
        
        for pattern in common_patterns:
            if re.search(pattern, password.lower()):
                return False, "Password contains common patterns that are easy to guess", {}
        
        # Use zxcvbn for advanced password strength analysis
        try:
            strength_analysis = zxcvbn.zxcvbn(password)
            score = strength_analysis['score']  # 0-4 scale
            
            if score < 2:  # Require at least score 2 (out of 4)
                feedback = strength_analysis.get('feedback', {})
                suggestions = feedback.get('suggestions', [])
                warning = feedback.get('warning', '')
                
                message = "Password is too weak"
                if warning:
                    message += f": {warning}"
                if suggestions:
                    message += f". Suggestions: {'; '.join(suggestions[:2])}"
                
                return False, message, {
                    'strength_score': score,
                    'feedback': feedback
                }
            
            return True, "Password is strong", {
                'strength_score': score,
                'crack_time': strength_analysis.get('crack_times_display', {})
            }
            
        except Exception as e:
            # Fallback if zxcvbn fails
            print(f"Password strength analysis failed: {e}")
            return True, "Password meets basic requirements", {}
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash password with enhanced bcrypt settings"""
        return pwd_context.hash(password)
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify password against hash with error handling"""
        try:
            return pwd_context.verify(plain_password, hashed_password)
        except Exception as e:
            print(f"Password verification error: {e}")
            return False
    
    @staticmethod
    def check_password_reuse(password: str, previous_hashes: list) -> bool:
        """Check if password was recently used (prevent reuse)"""
        if not previous_hashes:
            return False
        
        for old_hash in previous_hashes[-5:]:  # Check last 5 passwords
            if PasswordValidator.verify_password(password, old_hash):
                return True
        
        return False


class EmailValidator:
    """Enhanced email validation"""
    
    @staticmethod
    def validate_email_format(email: str) -> Tuple[bool, str]:
        """Validate email format with enhanced checks"""
        if not email:
            return False, "Email is required"
        
        email = email.strip().lower()
        
        # Length check
        if len(email) > 254:  # RFC 5321 limit
            return False, "Email address is too long"
        
        # Basic format validation
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, email):
            return False, "Invalid email format"
        
        # Additional checks
        local_part, domain_part = email.rsplit('@', 1)
        
        # Local part checks
        if len(local_part) > 64:  # RFC 5321 limit
            return False, "Email local part is too long"
        
        if local_part.startswith('.') or local_part.endswith('.'):
            return False, "Email local part cannot start or end with a period"
        
        if '..' in local_part:
            return False, "Email local part cannot contain consecutive periods"
        
        # Domain part checks
        if len(domain_part) > 253:  # RFC 5321 limit
            return False, "Email domain is too long"
        
        # Check for common typos in domains
        common_domains = {
            'gmial.com': 'gmail.com',
            'gmai.com': 'gmail.com',
            'yahooo.com': 'yahoo.com',
            'hotmial.com': 'hotmail.com',
            'outlok.com': 'outlook.com'
        }
        
        suggested_domain = common_domains.get(domain_part)
        if suggested_domain:
            return False, f"Did you mean {local_part}@{suggested_domain}?"
        
        return True, "Email is valid"


class InputSanitizer:
    """Input sanitization utilities"""
    
    @staticmethod
    def sanitize_name(name: str) -> str:
        """Sanitize user name input"""
        if not name:
            return ""
        
        # Remove potentially dangerous characters
        name = re.sub(r'[<>\"\'&]', '', name.strip())
        
        # Limit length
        if len(name) > 100:
            name = name[:100]
        
        return name
    
    @staticmethod
    def sanitize_text_input(text: str, max_length: int = 1000) -> str:
        """Sanitize general text input"""
        if not text:
            return ""
        
        # Remove null bytes and control characters
        text = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', text)
        
        # Limit length
        if len(text) > max_length:
            text = text[:max_length]
        
        return text.strip()