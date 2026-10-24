# EzLib 說明書（GitHub Pages）

本倉庫是 [ezlib.ykyle.eu](https://ezlib.ykyle.eu/) 的靜態說明書網站（`index.html` + CSS／JS）。

## 來源準則

**行為與 API 以源碼倉庫為準：**

- [bigbigshop/EzLib-EzDrive-motions](https://github.com/bigbigshop/EzLib-EzDrive-motions)（尤其 `main` 上的 `README.md`）

本站負責教學敘事（混合架構、G4 警告、章節流程）。若站上範例與 motions `main` 衝突，以 motions 為準。

## 單位速記

| API | 單位 |
| --- | --- |
| `ezPID.drive(distance, …)` | **英吋**（不是馬達度數） |
| `ezPID.turn(angle, …)` | 絕對航向，**度**（LemLib：0° → +Y，順時針為正） |
| `timeout` | 毫秒 |

`EzDrive` 建構後會 `bindEzDrive`：LemLib 的 `moveToPoint`／`moveToPose`／`turnTo*`／`swingTo*` 共用 `ezPID` 的 drive／turn PID。

## 本站檔案

| 檔案 | 說明 |
| --- | --- |
| `index.html` | 說明書正文 |
| `style.css`／`script.js` | 版面與側欄導航 |
| `CNAME` | `ezlib.ykyle.eu` |
| `G4.jpg` | 序章警示圖 |

下載 zip 連結刻意固定在站內，更新文件時請勿改動。
