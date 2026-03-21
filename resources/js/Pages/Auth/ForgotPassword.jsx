import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="パスワードをお忘れですか" />

            <h1 className="mb-4 text-xl font-semibold text-gray-900">
                パスワードをお忘れですか？
            </h1>

            <p className="mb-6 text-sm text-gray-600">
                登録済みのメールアドレスを入力してください。パスワード再設定用のリンクをお送りします。
            </p>

            {status && (
                <div className="mb-4 rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="block w-full"
                        placeholder="メールアドレス"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="flex items-center justify-between">
                    <Link
                        href={route('login')}
                        className="text-sm text-blue-700 underline hover:text-blue-800"
                    >
                        ログインに戻る
                    </Link>
                    <PrimaryButton disabled={processing}>
                        リセットリンクを送信
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
