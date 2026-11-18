# EzLib 說明書（GitHub Pages）

本倉庫是 [ezlib.ykyle.eu](https://ezlib.ykyle.eu/) 的公開靜態說明書網站。

右上角 **Version** 可切換文件版本（**預設 2.0.0**）：

| URL | 對齊 branch | 重點 |
| --- | --- | --- |
| [`/`](https://ezlib.ykyle.eu/)（default） | `EzLib_2.0.0_beta` | PROS 4.2.3、standalone LVGL、Dash／loading 主題 |
| [`/2.0.1/`](https://ezlib.ykyle.eu/2.0.1/) | `EzLib_2.0.1_liftSys` | nested LemLib、Liftlib 1.0.0、`ezlib::printf` CONSOLE、PID deferred release |

教學敘事、單位說明與章節流程以本站為準；細節以 [EzLib-EzDrive-motions](https://github.com/bigbigshop/EzLib-EzDrive-motions) 對應 branch 的 README／原始碼為準。

## 單位速記

| API | 單位 |
| --- | --- |
| `ezPID.drive(distance, …)` | **英吋**（不是馬達度數） |
| `ezPID.turn(angle, …)` | 絕對航向，**度**（LemLib：0° → +Y，順時針為正） |
| `timeout` | 毫秒 |

`EzDrive` 建構後會 `bindEzDrive`：LemLib 的 `moveToPoint`／`moveToPose`／`turnTo*`／`swingTo*` 共用 `ezPID` 的 drive／turn PID。

線上輔助：[pid.ykyle.eu](https://pid.ykyle.eu)（PID）、[moveToPose 模擬器](https://vex.ykyle.eu/moveToPose)。

## 本站檔案

| 檔案 | 說明 |
| --- | --- |
| `index.html` | **2.0.0** 說明書正文（站根＝default） |
| `2.0.1/index.html` | **2.0.1** 說明書正文 |
| `style.css`／`script.js` | 共用版面、側欄、Version 切換 |
| `CNAME` | `ezlib.ykyle.eu` |
| `G4.jpg` | 序章警示圖 |

下載 zip 連結刻意固定在站內，更新文件時請勿改動。
