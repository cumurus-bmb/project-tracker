# データベース規約（MySQL + Eloquent）

## 接続設定

`.env` の以下の変数で管理する。

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1   # Docker環境では db（サービス名）
DB_PORT=3306
DB_DATABASE=データベース名
DB_USERNAME=ユーザー名
DB_PASSWORD=パスワード
```

## マイグレーション規約

### 基本テンプレート

```php
Schema::create('posts', function (Blueprint $table) {
    $table->id();                                              // BIGINT UNSIGNED AUTO_INCREMENT
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();  // 外部キー
    $table->string('title');
    $table->text('body')->nullable();
    $table->boolean('is_published')->default(false);
    $table->timestamps();                                      // created_at, updated_at
    $table->softDeletes();                                     // deleted_at（必要な場合）
});
```

### 命名規則

| 項目 | 規則 | 例 |
|------|------|----|
| テーブル名 | snake_case 複数形 | `user_profiles`, `work_logs` |
| カラム名 | snake_case | `user_id`, `created_at` |
| 外部キー | `{テーブル単数形}_id` | `post_id`, `category_id` |
| 中間テーブル | アルファベット順 単数形_単数形 | `post_tag` |
| インデックス | `{テーブル}_{カラム}_index` | `posts_user_id_index` |

### よく使うカラム型

```php
$table->string('name');               // VARCHAR(255)
$table->string('email')->unique();    // VARCHAR(255) UNIQUE
$table->text('body');                 // TEXT
$table->integer('count')->default(0);
$table->unsignedInteger('order');     // 順序管理
$table->decimal('amount', 10, 2);    // 金額（Stripe: 整数で保存を推奨）
$table->enum('status', ['active', 'inactive', 'pending']);
$table->json('metadata')->nullable();
$table->timestamp('published_at')->nullable();
```

### 変更・追加マイグレーション

```bash
php artisan make:migration add_status_to_posts_table
```

```php
// 既存テーブルへのカラム追加
public function up(): void
{
    Schema::table('posts', function (Blueprint $table) {
        $table->string('status')->default('draft')->after('body');
    });
}

public function down(): void
{
    Schema::table('posts', function (Blueprint $table) {
        $table->dropColumn('status');
    });
}
```

## Eloquentモデル規約

```php
class Post extends Model
{
    use SoftDeletes;  // ソフトデリートを使う場合

    // 大量代入可能カラム（$guarded = [] は禁止）
    protected $fillable = ['user_id', 'title', 'body', 'status'];

    // キャスト
    protected $casts = [
        'is_published' => 'boolean',
        'published_at' => 'datetime',
        'metadata'     => 'array',
    ];

    // リレーション
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class)->withTimestamps();
    }

    // スコープ（クエリの再利用）
    public function scopePublished(Builder $query): void
    {
        $query->where('is_published', true);
    }
}
```

## クエリ規約

```php
// 推奨：Eloquent チェーン
$posts = Post::with(['user', 'tags'])  // N+1対策: eager loading
    ->where('user_id', Auth::id())
    ->published()
    ->latest()
    ->paginate(20);

// 特定カラムのみ取得（パフォーマンス）
$posts = Post::select(['id', 'title', 'created_at'])->get();

// 更新（直接代入より updateOrCreate 推奨）
Post::updateOrCreate(
    ['user_id' => $userId, 'slug' => $slug],
    ['title' => $title, 'body' => $body]
);
```

## インデックス戦略

検索・結合で頻繁に使うカラムには必ずインデックスを追加する。

```php
// マイグレーション内
$table->index(['user_id', 'created_at']);  // 複合インデックス
$table->index('status');
```

## シーダー

```php
// database/seeders/PostSeeder.php
Post::factory()->count(50)->create();

// 特定ユーザーに紐づけ
Post::factory()->count(10)->for(User::factory())->create();
```

## 注意事項

- `DB::statement()` で生SQL を使う場合は必ずバインディングを使用
- トランザクションが必要な処理は `DB::transaction()` で囲む
- 本番環境（ConoHa WING）では `migrate:fresh` を絶対に実行しない
