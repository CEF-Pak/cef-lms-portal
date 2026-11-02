import { useQuery } from "@tanstack/react-query";
import { baseUrl } from "@/config/authConfig";
import { setAuthCookie } from "@/lib/auth-cookie";

const login = async (email: string, password: string) => {
    const response = await fetch(`${baseUrl}login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password })
    })
    const data = await response.json()
    if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        localStorage.setItem('user_name', data.userDetails.name);
        localStorage.setItem('user_email', data.userDetails.email);
        localStorage.setItem('user_image', data.userDetails.image_url);
        localStorage.setItem('user_phone', data.userDetails.phone_number);
        localStorage.setItem('user_id', data.userDetails.id);
        if (data.userDetails.student) {
            localStorage.setItem('first_name', data.userDetails.student.first_name);
            localStorage.setItem('last_name', data.userDetails.student.last_name);
            localStorage.setItem('gender', data.userDetails.student.gender);
            localStorage.setItem('country_id', data.userDetails.student.country_id);
            localStorage.setItem('address', data.userDetails.student.address);
            localStorage.setItem('postal_code', data.userDetails.student.postal_code);
            localStorage.setItem('biography', data.userDetails.student.about_me);
        }
        setAuthCookie(data.token, data.role);
    }
    return data;
}

export const useAuthLogin = (formData: { email: string, password: string }, options = {}) => {
    return useQuery({
        queryKey: ['login', formData],
        queryFn: () => login(formData.email, formData.password),
        ...options
    })
}

export const useAuth = () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    return { token, role };
}

export type AuthContext = ReturnType<typeof useAuth>
