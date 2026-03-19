# Stripe 決済統合規約

## 前提

- 認証は **Laravel Breeze**、決済は **Stripe**（Clerk は使用しない）
- Laravel Cashier（`laravel/cashier-stripe`）を使用してサブスクリプション管理
- Stripe MCP でAPI仕様を確認する（プロンプトに `use context7` または Stripe MCP を活用）

## インストール・設定

```bash
composer require laravel/cashier
php artisan vendor:publish --tag="cashier-migrations"
php artisan migrate
```

### 環境変数

```env
STRIPE_KEY=pk_live_xxx          # 公開可能キー
STRIPE_SECRET=sk_live_xxx       # 秘密キー（サーバーサイドのみ）
STRIPE_WEBHOOK_SECRET=whsec_xxx # Webhook署名シークレット
CASHIER_CURRENCY=jpy
CASHIER_CURRENCY_LOCALE=ja_JP
```

## Userモデルへの Billable トレイト

```php
// app/Models/User.php
use Laravel\Cashier\Billable;

class User extends Authenticatable
{
    use Billable;
}
```

## サブスクリプション

### プラン作成フロー

```php
// Checkout Session を作成してStripeホスト型決済ページへリダイレクト
class SubscriptionController extends Controller
{
    public function checkout(Request $request, string $plan): \Illuminate\Http\RedirectResponse
    {
        return $request->user()
            ->newSubscription('default', $plan)
            ->checkout([
                'success_url' => route('dashboard').'?subscribed=1',
                'cancel_url'  => route('pricing'),
            ]);
    }

    public function billingPortal(Request $request): \Illuminate\Http\RedirectResponse
    {
        return $request->user()->redirectToBillingPortal(route('dashboard'));
    }
}
```

### プラン確認

```php
// バックエンド
if ($user->subscribed('default')) { /* ... */ }
if ($user->subscribedToPrice('price_xxx', 'default')) { /* ... */ }
if ($user->onTrial('default')) { /* ... */ }

// Inertia で共有してフロントエンドで使う
// HandleInertiaRequests::share() に追加
'subscription' => [
    'isSubscribed' => $user?->subscribed('default') ?? false,
    'onTrial'      => $user?->onTrial('default') ?? false,
],
```

```tsx
// フロントエンドでのプラン確認
const { subscription } = usePage().props;
if (!subscription.isSubscribed) {
    return <UpgradePrompt />;
}
```

## Webhook 処理

Laravel Cashier が標準 Webhook エンドポイントを提供する。

```php
// routes/web.php に追加（CSRF除外）
// config/cashier.php または AppServiceProvider で設定済みの場合は不要

// app/Http/Middleware/VerifyCsrfToken.php
protected $except = [
    'stripe/webhook',
];
```

```bash
# Webhook の Stripe CLI ローカルテスト（Docker内）
stripe listen --forward-to localhost:8000/stripe/webhook
```

### カスタム Webhook ハンドリング

標準外のイベントが必要な場合は `EventServiceProvider` でリスナーを登録する。

```php
// app/Listeners/StripeEventListener.php
use Laravel\Cashier\Events\WebhookReceived;

class StripeEventListener
{
    public function handle(WebhookReceived $event): void
    {
        if ($event->payload['type'] === 'customer.subscription.deleted') {
            // 解約時の処理
        }
    }
}
```

## 一回払い（都度課金）

```php
// Checkout Session（一回払い）
return $request->user()->checkout([
    'price_xxx' => 1,  // Stripe Price ID => 数量
], [
    'success_url' => route('purchase.success'),
    'cancel_url'  => route('purchase.cancel'),
]);
```

## セキュリティ注意事項

- `STRIPE_SECRET` は絶対にフロントエンドに渡さない（`NEXT_PUBLIC_` や `VITE_` プレフィックスを付けない）
- 金額は**整数（最小通貨単位）**でDBに保存（JPY は円、USD はセント）
- Webhook の署名検証は Cashier が自動で行うため、エンドポイントを勝手に変更しない

## ルート例

```php
Route::middleware('auth')->group(function () {
    Route::get('/pricing', [SubscriptionController::class, 'pricing'])->name('pricing');
    Route::post('/subscribe/{plan}', [SubscriptionController::class, 'checkout'])->name('subscribe');
    Route::get('/billing', [SubscriptionController::class, 'billingPortal'])->name('billing');
});
```
