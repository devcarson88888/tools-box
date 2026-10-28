[English](README.md) | [简体中文](README_ZHCN.md) | 繁體中文

# Useful Tools Box（實用工具箱）

Useful Tools Box 是託管於 Cloudflare Workers 靜態資產的靜態網站。身分驗證與發布者審核使用 Supabase；已發布的工具透過 `github-publish` 邊緣函式儲存到此儲存庫的 `create/` 目錄。

## 將網站部署至 Cloudflare Workers

該 Worker 直接提供此儲存庫的靜態檔案；`.assetsignore` 用來避免專案設定與 Supabase 原始碼被當成公開資源發布。

1. 安裝 Node.js，接著執行 `npx wrangler login` 完成 Wrangler 身分驗證。
2. 在儲存庫根目錄執行 `npx wrangler deploy`。Wrangler 會輸出部署後的 `workers.dev` 網址。在調整正式環境設定前，請確認首頁、`/signup/`、`/search/`、`/create/`、`/my-tools/`、`/banned/` 以及 `/tools/Time-zone-converter/` 都能正常運作。
3. `wrangler.json` 內的 `name` 必須和 Cloudflare 上的 Worker 名稱一致，部署後的 Worker 名稱為 `tools-box`。
4. 在 Supabase 邊緣函式密碼中，將 `TOOLS_BOX_APP_ORIGIN` 設為 `[https://tools-box.carson88888.workers.dev](https://tools-box.carson88888.workers.dev)`。轉移期間請保留原本的 Pages 來源可正常存取。GitHub OAuth 回呼網址維持使用 Supabase 函式網址，不會遷移到 Workers。
5. 在 Supabase 身分驗證網址設定中，將 Workers 來源加入允許的重新導向網址，準備就緒後更新站台網址。註冊確認的重新導向會使用站台來源。
6. 在 Workers 環境驗證註冊確認、Supabase 請求以及 GitHub 發布／管理的 OAuth 流程。在所有檢查通過前，請保留 Pages 部署版本維持上線。

部署 Workers 需要 Cloudflare 帳號權限，GitHub 推送程式碼不會自動執行部署。重新執行 `npx wrangler deploy` 就會發布目前的工作目錄檔案。

## 管理主控台

私有帳號管理主控台位於 `/admin/`。對應的邊緣函式會驗證已登入的 Supabase 使用者，必須設定 `ADMIN_EMAILS` 及／或 `ADMIN_USER_IDS` 密碼；**不會信任使用者自行傳入的名稱或是瀏覽器提供的角色資訊**。在 Supabase 邊緣函式密碼填入管理員信箱至 `ADMIN_EMAILS`，多個信箱以英文逗號分隔。請勿將服務金鑰提交或貼到靜態網站內。

將 `supabase/functions/admin/index.ts` 部署成名為 `admin` 的邊緣函式，並執行 `supabase/migrations/` 底下所有遷移腳本；接著使用已加入白名單的帳號登入網站，開啟 `/admin/`。主控台可以檢視信箱、顯示名稱、出生日期、註冊時間、信箱驗證狀態與上次登入時間；能夠暫停或恢復登入權限，並在輸入信箱確認後永久刪除非管理員帳號。管理員帳號無法透過此主控台被暫停或刪除。密碼不會回傳。出生日期屬於敏感個人資料，僅開放給明確列入白名單的管理員檢視。在 `20261004174400_store_birth_dates_for_admin.sql` 建立前的帳號沒有留存出生日期，資料已刪除、無法復原。帳號必須可以正常登入，才能使用管理主控台。

## 註冊年齡檢查與發布者審核

部署更新版邊緣函式前：

1. 在正式環境的 Supabase 專案，透過 Supabase SQL 編輯器或是 Supabase CLI 執行 `supabase/migrations/20261004143000_age_gate_and_publisher_bans.sql`。此腳本會新增身分驗證觸發程序：拒絕未滿 18 歲的新帳號、捨棄送出的出生日期，只儲存管理員維護的驗證時間戳記；同時建立私有發布者封禁資料表。
2. 確認邊緣函式已設定 `SUPABASE_SERVICE_ROLE_KEY` 密碼。**絕對不要把這組金鑰放到靜態網站或是提交到程式庫**。Supabase 託管函式通常會自動取得專案服務角色金鑰；如果沒有，請在專案邊緣函式密碼頁面手動設定。
3. 部署 `supabase/functions/github-publish`，讓函式在發布者執行操作前檢查封禁狀態，並記錄永久封禁資訊。

年齡門檻機制會在建立身分使用者時強制生效，包含直接呼叫身分驗證 API 的請求，不只有註冊表單。一開始的年齡檢查遷移腳本只保留年齡驗證時間戳；後續出生日期遷移腳本會把完整生日存到私有資料表供管理員檢視，並從身分使用者中繼資料移除生日欄位。既有的舊帳號不會回溯執行年齡驗證。

成人內容審核會掃描送出的 HTML、CSS、JavaScript 以及工具描述，比對已知露骨內容關鍵字。一旦比對成功，就會永久封禁該 GitHub 發布者 ID 並記錄時間戳。自動文字檢查有誤判的可能，也無法可靠辨識圖片、編碼或混淆的負載、遠端內容；**不能當作完整的內容審核方案**。封禁通知頁面會顯示記錄的時間戳，並附上申請覆核的連結；覆核並不會自動恢復發布權限。

## 註冊信箱驗證碼

註冊頁面支援六位數信箱驗證碼。測試這個流程不需要自訂 SMTP：Supabase 預設寄信服務可以寄給專案授權團隊成員的信箱，但有嚴格的頻率限制，不適合對外開放給一般使用者收信。

1. 打開 Supabase 控制台 → **身分驗證 > 電子郵件範本 > 確認註冊**。
2. 修改信件內文，加入 `{{ .Token }}`（不能只依賴 `{{ .ConfirmationURL }}`），範例如下：

```
<h2>驗證你的信箱</h2>
<p>你的 Useful Tools Box 驗證碼是：</p>
<p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">{{ .Token }}</p>
<p>請在註冊頁面輸入這組驗證碼。如果你沒有申請註冊，可以忽略這封信。</p>
```
3. 儲存範本，接著使用 Supabase 專案授權的信箱測試註冊、驗證碼核對以及重發驗證碼功能。

如果要寄信給外部一般信箱，到 **身分驗證 > SMTP 設定** 設定自訂 SMTP 服務商。需要準備郵件服務商提供的憑證，以及服務商允許使用的寄件位址／網域；不要填入佔位假憑證。修改 Supabase 信件範本**不需要重新部署靜態網站**。

> 
> 說明：程式路徑、變數名、SQL檔名、CLI指令、template token 全部保留原文不翻，術語採台灣繁體技術用詞（邊緣函式、主控台、重新導向、信箱、程式庫等）
