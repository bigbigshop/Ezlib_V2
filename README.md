# EzLib – LemLib-based PROS V5 Chassis Library

EzLib 是一個 **基於 LemLib 開發** 的 PROS V5 底盤 Library：

- 保留 LemLib 原本的底盤／路徑控制（`chassis.moveToPoint/MoveToPose/follow/...`）
- 額外加入一層 **EZ-Template 風格的直行 / 轉向 PID**：
  - `chassis.drive`
  - `chassis.drive_in`
  - `chassis.turn`
  - `chassis.wait_until_PID`
  - `chassis.waitUntilDone`（整合 LemLib + EzPID）

同時專案內還提供：

- 牆距自動定位 / offset 校正工具（`fsm.cpp`）
- Intake 有限狀態機（`functions.cpp`）

> 你可以整個 zip 當成一個 PROS 專案直接打開玩，也可以只抄 `include/ezlib` + `src/ezlib` 當 Library。

---

## 1. 基於 LemLib 的底盤設定

EzLib 的底層仍然是 LemLib 的 `Chassis`：

- 使用 `Drivetrain` + `OdomSensors` + 各種 motion 函數（`moveToPoint`, `moveToPose`, `follow`, `turnToHeading`...）
- 構造方式、單位、座標系統都跟 LemLib 一樣  
  → 建議先看 LemLib 官方 README / 範例，把基本 Chassis 配好。

在這個專案裡，你會見到一個全域：

```cpp
extern ezlib::Chassis chassis;
```

並在 `initialize()` 裏面做額外 EzPID 設定。

---

## 2. EzPID 層：直行 / 轉向 PID 配置

在 `ezlib::Chassis` 裡多了一組 EzPID 控制器（見 `chassis.hpp` / `ez_pid.cpp`）：

```cpp
EzPID ez_drivePID{0, 0, 0};
EzPID ez_headingPID{0, 0, 0};
EzPID ez_turnPID{0, 0, 0};

double ez_cartridge_rpm = 600;
double ez_drive_slew_step = 0;
double ez_turn_slew_step = 0;
```

### 2.1 EzPID 行為（`ez_pid.cpp`）

`EzPID` 是一個簡單的 PID：

- `set_constants(p, i, d, start_i_range)`  
  - `start_i_range`：只有在誤差絕對值 < 這個範圍時才開始積分，避免一開始 overshoot。
- `compute(measurement, wrap = false)`：
  - `error = target - measurement`
  - `wrap = true` 時，會把角度誤差壓到 `[-180, 180]`，用於 heading。
- `set_exit_conditions(small_err, small_t, big_err, big_t, vel_t)`：
  - 小誤差 / 大誤差 + 對應時間
  - 以及速度（derivative）接近 0 的時間
- `is_settled()`：
  - 根據誤差 + derivative 是否連續一段時間都在容許範圍內，判斷「到位」。

### 2.2 初始化時的 EzPID 設定（來自 `main.cpp`）

在 `initialize()` 裡，你需要在 LemLib 底盤設定**之後**，加上這段 EzLib 的配置：

```cpp
void initialize() {
    pros::lcd::initialize(); // initialize brain screen
    chassis.calibrate();     // calibrate sensors

    // 1. 設定馬達 Cartridge (600: Blue, 200: Green, 100: Red)
    chassis.ez_cartridge_rpm = 600;

    // 2. 設定 PID 參數
    // [直行 PID] 控制前進後退的距離準確度
    // P: 0.85, I: 0, D: 12, Start I: 0
    chassis.ez_drivePID.set_constants(0.85, 0, 12, 0);

    // [直行修正 PID] 控制直行時修正歪掉的角度
    // P: 4, I: 0, D: 10, Start I: 0
    chassis.ez_headingPID.set_constants(4, 0, 10, 0);

    // [轉向 PID] 控制原地旋轉
    // P: 3, I: 0.02, D: 20, Start I: 15
    chassis.ez_turnPID.set_constants(3, 0.02, 20, 15);

    // 3. 設定 Slew Rate (加速度限制)
    // 數值愈小，起動愈溫和。設 255 代表不限制。
    chassis.ez_drive_slew_step = 10;  // 直行加速度限制
    chassis.ez_turn_slew_step = 255;  // 轉向加速度限制

    // 4. 設定退出條件 (Exit Conditions)
    // (小誤差範圍, 小誤差時間, 大誤差範圍, 大誤差時間, 速度限制時間)
    // 單位: 馬達度數
    chassis.ez_drivePID.set_exit_conditions(50, 100, 300, 500, 500);
    // 單位: 角度
    chassis.ez_turnPID.set_exit_conditions(1, 100, 3, 250, 500);
}
```

你可以根據自己底盤重新調 PID，但整體流程就是：

1. 設定馬達 RPM (`ez_cartridge_rpm`)
2. 設定三個 EzPID 的 P/I/D
3. 設定直行 / 轉向的 slew（加速度限制）
4. 設定 `set_exit_conditions` 讓 PID 知道何時「收工」

---

## 3. 新增的 EZ-Template 風格 API

除了 LemLib 原本所有 `chassis.xxx` 之外，EzLib 多了以下幾個常用接口：

### 3.1 `chassis.drive`

```cpp
void drive(double motor_degrees, int max_speed,
           int timeout = 1500, bool async = false);
```

行為（見 `chassis.cpp`）：

- 使用：
  - `ez_drivePID` 控制「走多遠」（motor degrees）
  - `ez_headingPID` 讓直行過程保持當前 heading
- 流程簡要：
  1. Reset 兩個 EzPID。
  2. 把當前 `getPose().theta` 設成 heading PID 的 target。
  3. 以平均馬達位置（或 tracking wheel）算出相對位移。
  4. 10ms loop：
     - `drive_out = ez_drivePID.compute(current_pos)`
     - `head_out  = ez_headingPID.compute(theta, wrap = true)`
     - 左右輪輸出 = `drive_out ± head_out`
     - 套用 `ez_drive_slew_step` 做斜坡
     - clamp 到 `[-max_speed, max_speed]`
- `timeout`：超時會自動停車。
- `async = false`：同步（函式會 block 到運動完成或 timeout）。

簡單例子：

```cpp
// 以 PID 直行 720 度馬達轉角（約 2 圈）
// 最大速度 100，timeout 1500ms
chassis.drive(720, 100);
```

### 3.2 `chassis.drive_in`

```cpp
void drive_in(double distance, int max_speed,
              int timeout, bool async = false);
```

- 方便版的 `drive`：
  - `distance` 以 **inch** 表示。
  - 內部會根據輪徑 / 齒比 / cartridge rpm 把 inch 轉成 motor degrees，然後呼叫 `drive(...)`。
- 用來寫 auton 時比較直覺：

```cpp
// 直行 24 吋
chassis.drive_in(24.0, 100, 2000);
```

### 3.3 `chassis.turn`

```cpp
void turn(double angle, int max_speed,
          int timeout = 1000,
          AngularDirection direction = AngularDirection::AUTO,
          bool async = false);
```

- 用 `ez_turnPID` 做原地旋轉：
  - `angle`：目標 heading（度數，跟 `getPose().theta` 同座標系）。
- `direction` 可以指定：
  - `AUTO`：自動選最近方向
  - `CW_CLOCKWISE`：強制順時針
  - `CCW_COUNTERCLOCKWISE`：強制逆時針
- 內部做法：
  1. 用 `getPose().theta` 算出 `error = target - current`，normalize 到 `[-180, 180]`。
  2. 若指定方向，會把 error 推到對應方向。
  3. 把這個 error 當成 EzPID 的 target，計算輸出，左右輪相反號。

例子：

```cpp
// 轉到場地 heading 90 度
chassis.turn(90, 80, 1500);

// 強制逆時針轉到 180 度
chassis.turn(180, 80, 2000, AngularDirection::CCW_COUNTERCLOCKWISE);
```

### 3.4 `chassis.wait_until_PID`

```cpp
void wait_until_PID(double dist);
```

- 以 motor degrees 計，block 到底盤走了指定距離。
- 會用 `get_absolute_motor_dist()` 記錄起點，然後 loop 等到：
  ```cpp
  abs(current - start) >= dist
  ```

例子：

```cpp
chassis.drive(720, 100, 2000, true);    // async 直行
chassis.wait_until_PID(360);            // 等走到一半
// 做其他動作...
```

### 3.5 `chassis.waitUntilDone`

```cpp
void waitUntilDone();
```

這個函式把 **LemLib 的 motion queue** 以及 **EzPID 動作** 一次等完：

1. 先等 LemLib 的 motion：
   - 根據 `distTraveled` 與 `motionRunning`。
2. 再等 EzPID（drive/turn）：
   - 持續檢查 `ez_drivePID.is_settled()` 與 `ez_turnPID.is_settled()`。

用途：

- 無論你之前是用 `moveToPoint` / `moveToPose` 還是 `drive` / `turn`，
- 呼叫一次 `chassis.waitUntilDone()` 就可以確保所有動作都停下來再做下一步。

---

## 4. 其他有用工具（fsm.cpp）

`fsm.hpp` / `fsm.cpp` 不是 EzLib core API，但提供幾個實用工具（你可以 copy 到自己專案）：

- `double get_filtered_dist(pros::Distance& s)`  
  - 讀取多次 Distance 值，做中值濾波，回傳 inch。
- `void auto_init_universal(double start_theta_field_deg, int sensor_mask = USE_AUTO);`  
  - 利用 4 個 Distance + IMU，在比賽開始時 **自動修正機器人位置**，更新 `chassis.setPose(...)`。
- `double getRealPose(double expected, double golden, pros::Distance& sensor, int side);`  
  - 根據理論牆距 `golden` 與感測器讀值，對 `expected` 位置做微調。
- `void wallReset(char axis, int velocity, float theta, int timeout_ms = 1500);`  
  - 用推牆方式對齊後，重設 X 或 Y 座標（撞南牆 → Y=0 等）。
- `void calibrateTrackingOffsets();`  
  - 做多次 360° 旋轉，估計 tracking wheels 的 offset（輸出建議值）。

---

## 5. Intake FSM（functions.cpp）

`functions.hpp` / `functions.cpp` 提供一個簡單但實用的 Intake 狀態機：

- 狀態：
  ```cpp
  enum class IntakeState {
      STOP,
      INTAKE,
      L1,
      L2,
      REVERSE,
      REVERSING
  };
  ```
- API：
  - `void setIntakeState(IntakeState state);`
  - `void updateIntakeFSM();`
  - `void pneumaticsBtn();`（處理 arm / hook 的 toggle）

特色：

- 根據馬達電流自動檢測 Jam，進入 `REVERSING` 狀態短暫反轉，之後回到原本狀態。
- 在 `opcontrol()` 迴圈中每次呼叫 `updateIntakeFSM()` 即可。

---

## 6. 總結

- EzLib = **LemLib + EZ-Template 風格直行 / 轉向 PID API**。
- 你仍然可以使用所有 LemLib 的 `chassis.xxx` 函式，
- 另外多了：
  - `chassis.drive` / `chassis.drive_in`
  - `chassis.turn`
  - `chassis.wait_until_PID`
  - `chassis.waitUntilDone`
  - 以及 EzPID 相關配置（`ez_drivePID`, `ez_headingPID`, `ez_turnPID`）。

直接照 LemLib 做好底盤設定，再把 `initialize()` 中的 EzPID config 貼過去，就可以開始用這些新函式寫 auton。
