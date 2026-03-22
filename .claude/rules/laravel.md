# Laravel 規約

## ディレクトリ構成

```
app/
├── Http/
│   ├── Controllers/     # Inertia::render() でページを返す
│   ├── Middleware/      # ミドルウェア
│   └── Requests/        # FormRequest（バリデーションはここに集約）
├── Models/              # Eloquentモデル
├── Policies/            # 認可ポリシー
└── Services/            # ビジネスロジック（Controllerに書かない）

routes/
├── web.php              # Webルート（Inertia経由のページ）
└── auth.php             # 認証ルート（Breeze生成）
```

## ルート定義

```php
// routes/web.php
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::resource('posts', PostController::class);
});
```

### ルート構成

| ルート | 認証 | 説明 |
|--------|------|------|
| `/` | 不要 | トップページ |
| `/login` | guest | ログインページ |
| `/register` | guest | 新規登録ページ |
| `/dashboard` | auth | ダッシュボード |
| `/profile` | auth | プロフィール管理 |

## コントローラー

- 1コントローラー = 1リソース（7アクション以内）
- ビジネスロジックは `Services/` クラスへ移譲
- レスポンスは必ず `Inertia::render()` で返す（JSON APIは原則作らない）

```php
use Inertia\Inertia;
use Inertia\Response;

class PostController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Posts/Index', [
            'posts' => Post::where('user_id', Auth::id())
                         ->latest()
                         ->paginate(20),
        ]);
    }

    public function store(StorePostRequest $request): \Illuminate\Http\RedirectResponse
    {
        Post::create([...$request->validated(), 'user_id' => Auth::id()]);
        return redirect()->route('posts.index')->with('flash', ['message' => '作成しました']);
    }
}
```

## FormRequest（バリデーション）

コントローラーにバリデーションロジックは書かない。必ず FormRequest に分離する。

```php
class StorePostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Auth::check();
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'body'  => ['required', 'string'],
        ];
    }
}
```

## 認証（Laravel Breeze）

- 認証ルートは `routes/auth.php` で管理
- ミドルウェア: `auth`（ログイン必須）、`guest`（未ログイン専用）
- ユーザーモデル: `App\Models\User`
- バックエンドでのユーザー取得: `Auth::user()` または `$request->user()`
- フロントエンドでのユーザー取得: `usePage().props.auth.user`

## 認可（Policy）

ルートにアクセス制御を直書きせず、Policy に集約する。

```php
// Policy 使用例
public function update(Request $request, Post $post): Response
{
    $this->authorize('update', $post);
    return Inertia::render('Posts/Edit', ['post' => $post]);
}
```

## セキュリティ規約

### 大量代入保護
```php
// モデルには必ず $fillable を定義する（$guarded = [] は禁止）
protected $fillable = ['title', 'body', 'user_id'];
```

### SQL インジェクション対策
- クエリは Eloquent ORM またはクエリビルダーを使用
- 生 SQL が必要な場合は必ずパラメーターバインディングを使用

### CSRF
- Inertia は自動で CSRF トークンを送信するため手動設定不要
- API ルートを追加する場合は `VerifyCsrfToken` ミドルウェアの除外設定を確認

## Flash メッセージ

```php
// コントローラー
return redirect()->route('posts.index')->with('flash', ['message' => '保存しました']);

// HandleInertiaRequests ミドルウェアで共有
public function share(Request $request): array
{
    return [
        ...parent::share($request),
        'flash' => [
            'message' => $request->session()->get('flash.message'),
            'error'   => $request->session()->get('flash.error'),
        ],
    ];
}
```

## コーディング規約

- PHP は PSR-12 準拠（`./vendor/bin/pint` でフォーマット）
- クラス名・モデル名: PascalCase
- メソッド名・変数名: camelCase
- DB カラム名・ルート名: snake_case

## 認可（Laravel 12 対応）

Laravel 12 の基底 `Controller` クラスから `AuthorizesRequests` トレイトが削除された。`$this->authorize()` は使用不可。

代わりに `abort_if()` で所有者チェックを行う。

```php
// NG（Laravel 12 では動かない）
$this->authorize('update', $post);

// OK
abort_if($post->user_id !== Auth::id(), 403);
```
