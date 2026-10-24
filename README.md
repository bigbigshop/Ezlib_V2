# EzLib 說明書（GitHub Pages）

本倉庫是 [ezlib.ykyle.eu](https://ezlib.ykyle.eu/) 的公開靜態說明書網站（`index.html` + CSS／JS）。教學敘事、單位說明與章節流程以本站為準。

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
