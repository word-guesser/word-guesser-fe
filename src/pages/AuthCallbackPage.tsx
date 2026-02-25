import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/ui/spinner';

export default function AuthCallbackPage() {
    const [searchParams] = useSearchParams();
    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');
        if (!token) {
            navigate('/login', { replace: true });
            return;
        }
        login(token).then(() => {
            navigate('/', { replace: true });
        }).catch(() => {
            navigate('/login', { replace: true });
        });
    }, [searchParams, login, navigate]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
            <Spinner className="size-12" />
            <p className="text-muted-foreground">Đang đăng nhập...</p>
        </div>
    );
}
