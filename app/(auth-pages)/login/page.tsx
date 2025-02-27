"use client"
import styles from './login.module.css';
import { signInAction } from './actions';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInSchema } from '@lib/zod';

export default function LoginPage() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(signInSchema),
    });

    const onSubmit = async (data: any) => {
        try {
            const formData = new FormData();
            formData.append('email', data.email);
            formData.append('password', data.password);
            await signInAction(formData);
        } catch (error) {
            console.error('Login error:', error);
        }
    };

    return (
        <div className="pt-47 flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#111] to-[#222255] text-white">
            <div className="input-container box-border h-128 w-128 p-4 border-4 border-slate-700 content-center">
                <h2 className="banner text-center font-semibold underline-offset-8 font-mono drop-shadow-md text-3xl">User Login</h2>
                <div id="login" className="flex space-y-4">
                    <form className="login" onSubmit={handleSubmit(onSubmit)}>
                    <div className="form-item flex flex-row space-x-8 pt-10 justify-between">
                            <div className="label-container pl-10">
                                <label htmlFor="login">Email</label>
                            </div>
                            <div className={styles.inputcontainer}>
                                <input {...register('email')} className="w-50 text-white bg-slate-800" id="email" type="text" name="email" required />
                            </div>
                            {errors.email?.message && <p>{errors.email?.message}</p>}
                        </div>
                        <div className="form-item flex flex-row space-x-8 ps-5 pt-5 justify-between">
                            <div className="label-container pl-10">
                                <label htmlFor="password">Password</label>
                            </div>
                            <div className={styles.inputcontainer}>
                                <input {...register('password')} className="w-50 text-white bg-slate-800" id="password" type="password" name="password" required />
                            </div>
                            {errors.password?.message && <p>{errors.password?.message}</p>}
                        </div>
                        <div className="justify-center flex form-submit">
                            <button type="submit" className="text-white rounded-lg border-green-700 shadow shadow-green-500/50 hover:shadow-l active:pt-3 hover:shadow-white/50 drop-shadow-md border-4 bg-gradient-to-b from-[#33aa33] to-[#001100] px-5 py-3 mt-5 signup">Login</button>
                        </div>
                    </form>
                </div>
            </div>
            <div className="text-white pt-10" >
                <h3>New user? <a href="/signup" className="text-green-300 font-bold text-pretty login-link hover:underline">Sign up</a>!</h3>
            </div>
        </div>
    )
}