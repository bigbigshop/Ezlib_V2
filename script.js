// --- Lang + version switchers ---
function isEnglishDocs() {
    const langAttr = document.documentElement.getAttribute('data-lang');
    if (langAttr === 'en') return true;
    if (langAttr === 'zh') return false;
    return /en\.html$/i.test(window.location.pathname);
}

function docsPageForLang(lang) {
    return lang === 'en' ? '/en.html' : '/';
}

function buildDocsUrl(lang, version, hash) {
    const url = new URL(docsPageForLang(lang), window.location.origin);
    if (version === '2.0.1') url.searchParams.set('v', '2.0.1');
    url.hash = hash || '';
    return url.pathname + url.search + url.hash;
}

(function initDocsControls() {
    const verSelect = document.getElementById('docs-version');
    const langSelect = document.getElementById('docs-lang');

    function applyDocsVersion(v, pushUrl) {
        if (v !== '2.0.0' && v !== '2.0.1') v = '2.0.0';
        document.documentElement.setAttribute('data-docs-version', v);
        if (verSelect) verSelect.value = v;
        const mobileTitle = document.querySelector('.mobile-header .header-text');
        if (mobileTitle) mobileTitle.textContent = 'EzLib · ' + v;
        document.title = (isEnglishDocs() ? 'EzLib Docs · ' : 'EzLib說明書 · ') + v;

        if (pushUrl) {
            const url = new URL(window.location.href);
            if (v === '2.0.0') url.searchParams.delete('v');
            else url.searchParams.set('v', v);
            history.replaceState(null, '', url.pathname + url.search + url.hash);
        }

        const hash = window.location.hash.replace(/^#/, '');
        if (hash) {
            const target = document.getElementById(hash);
            if (target) {
                const hidden = target.closest('.only-v200, .only-v201');
                if (hidden && getComputedStyle(hidden).display === 'none') {
                    const intro = document.getElementById('intro');
                    const area = document.getElementById('scroll-area');
                    if (intro && area) {
                        area.scrollTo({ top: Math.max(0, intro.offsetTop - 40), behavior: 'smooth' });
                    }
                }
            }
        }
    }

    const params = new URLSearchParams(window.location.search);
    const initialVer = params.get('v') === '2.0.1' ? '2.0.1' : '2.0.0';
    applyDocsVersion(initialVer, false);

    if (verSelect) {
        verSelect.addEventListener('change', function () {
            applyDocsVersion(verSelect.value, true);
        });
    }

    if (langSelect) {
        langSelect.value = isEnglishDocs() ? 'en' : 'zh';
        langSelect.addEventListener('change', function () {
            const nextLang = langSelect.value === 'en' ? 'en' : 'zh';
            if ((nextLang === 'en') === isEnglishDocs()) return;
            const ver = (verSelect && verSelect.value) || initialVer;
            window.location.href = buildDocsUrl(nextLang, ver, window.location.hash);
        });
    }
})();

// --- Theme Toggle Logic ---
const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn, .mobile-theme-btn');

function updateThemeIcon(isDark) {
    themeToggleBtns.forEach(btn => {
        const icon = btn.querySelector('i');
        if (icon) {
            icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
        }
    });
}

function applyTheme(isDark) {
    if (isDark) {
        document.documentElement.classList.remove('light-mode');
    } else {
        document.documentElement.classList.add('light-mode');
    }
    updateThemeIcon(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// Initialize theme from localStorage
const savedTheme = localStorage.getItem('theme') || 'dark';
applyTheme(savedTheme === 'dark');

// Add click handlers to all theme toggle buttons
themeToggleBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        const currentTheme = localStorage.getItem('theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme === 'dark');
    });
});

// --- Navigation and Scroll Logic ---
const navLinks = document.querySelectorAll('.nav-link');
const scrollArea = document.getElementById('scroll-area');
const sections = document.querySelectorAll('section, h2[id], h3[id]');
const backToTopButton = document.getElementById('back-to-top');
const sidebar = document.querySelector('.sidebar');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');

// Smooth scroll to section when clicking nav links
navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            // Add active class to clicked link
            this.classList.add('active');
            
            // Scroll to target
            scrollArea.scrollTo({
                top: targetElement.offsetTop - 40,
                behavior: 'smooth'
            });
            
            // Close mobile sidebar after clicking
            if (window.innerWidth <= 600) {
                sidebar.classList.remove('show');
            }
        }
    });
});

// Highlight active nav link on scroll
scrollArea.addEventListener('scroll', function() {
    const scrollPosition = scrollArea.scrollTop + 100;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionId = section.getAttribute('id');
        
        if (sectionTop <= scrollPosition && sectionId) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') && link.getAttribute('href').substring(1) === sectionId) {
                    link.classList.add('active');
                }
            });
        }
    });
    
    // Show/hide back to top button
    if (scrollArea.scrollTop > 300) {
        backToTopButton.classList.add('show');
    } else {
        backToTopButton.classList.remove('show');
    }
});

// Back to top functionality
backToTopButton.addEventListener('click', function() {
    scrollArea.scrollTo({ top: 0, behavior: 'smooth' });
});

// --- Mobile Menu Toggle ---
if (mobileMenuBtn && sidebar) {
    mobileMenuBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        sidebar.classList.toggle('show');
    });
    
    // Close sidebar when clicking outside
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 600) {
            const isClickInsideSidebar = sidebar.contains(e.target);
            const isClickOnMenuBtn = mobileMenuBtn.contains(e.target);
            
            if (!isClickInsideSidebar && !isClickOnMenuBtn && sidebar.classList.contains('show')) {
                sidebar.classList.remove('show');
            }
        }
    });
}

// --- Code Copy Functionality ---
function addCopyButtons() {
    document.querySelectorAll('.code-block-wrapper').forEach(wrapper => {
        const header = wrapper.querySelector('.code-header');
        const codeBlock = wrapper.querySelector('.code-block');
        
        if (header && codeBlock) {
            const copyButton = document.createElement('button');
            copyButton.className = 'code-copy-btn';
            const copyLabel = isEnglishDocs() ? 'Copy' : '複製代碼';
            const copiedLabel = isEnglishDocs() ? 'Copied!' : '已複製!';
            copyButton.textContent = copyLabel;
            header.appendChild(copyButton);
            
            copyButton.addEventListener('click', function() {
                navigator.clipboard.writeText(codeBlock.textContent).then(() => {
                    copyButton.textContent = copiedLabel;
                    copyButton.classList.add('copied');
                    setTimeout(() => {
                        copyButton.textContent = copyLabel;
                        copyButton.classList.remove('copied');
                    }, 2000);
                }).catch(err => {
                    console.error('Failed to copy:', err);
                });
            });
        }
    });
}

// Initialize copy buttons when page loads
window.addEventListener('load', () => {
    addCopyButtons();
    // Trigger initial scroll event for highlighting
    scrollArea.dispatchEvent(new Event('scroll'));
    initJudgeQuiz();
});

// --- Judge interview practice quiz ---
function initJudgeQuiz() {
    const root = document.getElementById('judge-quiz');
    const stage = document.getElementById('quiz-stage');
    const progressLabel = document.getElementById('quiz-progress-label');
    const progressFill = document.getElementById('quiz-progress-fill');
    if (!root || !stage || !progressLabel || !progressFill) return;

    const PASS_RATIO = 0.9;
    const en = isEnglishDocs();
    const ui = en
        ? {
              ready: 'Ready',
              lead: '20 multiple-choice questions on units, bind, Dash, controls, odom/reset, dash_config, field control, LVGL, and auton_select.',
              start: 'Start practice',
              next: 'Next',
              results: 'See results',
              correct: 'Correct.',
              wrong: 'Not quite.',
              progress: (i, t) => `Question ${i} / ${t}`,
              done: (s, t) => `Done · ${s}/${t}`,
              pass: 'Fluent with EzLib',
              fail: 'Not yet “fluent with EzLib” — re-read the related chapters and retry',
              passHint: 'Pass line: ≥90% correct. Review Chapter 7 Dash/LVGL, Chapter 2 units, and Chapter 4 reset.',
              retry: 'Try again',
              optGroup: 'Options'
          }
        : {
              ready: '準備開始',
              lead: '共 20 題：單位、bind、Dash、練習掣、odom／reset、dash_config、場控、LVGL、auton_select 等。',
              start: '開始練習',
              next: '下一題',
              results: '睇成績',
              correct: '正確。',
              wrong: '未中。',
              progress: (i, t) => `第 ${i} / ${t} 題`,
              done: (s, t) => `完成 · ${s}/${t}`,
              pass: '熟用 EzLib',
              fail: '未達「熟用 EzLib」——再讀相關章節後重試',
              passHint: '及格線：答對率 ≥90%。建議對照第七章 Dash／LVGL、第二章單位、第四章 reset。',
              retry: '再試一次',
              optGroup: '選項'
          };
                                const questionBankZh = [
        {
            q: "省略 async 參數時，ezPID.drive 與 LemLib moveToPoint 的預設有何差異？",
            choices: [
                "兩者皆預設 async=true，會立刻回傳並排隊",
                "ezPID 預設阻塞（false）；LemLib 多數運動預設 async=true",
                "兩者皆預設 false，必須手動設 true 才非阻塞",
                "只有 turn 會阻塞；drive 與 moveToPoint 行為相同"
            ],
            answer: 1,
            explain: "EzDrive 預設 async=false；LemLib 多數運動預設 async=true。"
        },
        {
            q: "wallReset('x', …) 實際會把哪一軸鎖成 0？",
            choices: [
                "把 X 設為 0，Y 與 θ 完全不動",
                "把 Y 設為 0（以該牆為基準校正），易與字母直覺相反",
                "同時把 X 與 Y 都歸零，只保留 θ",
                "只重設 θ，座標軸完全不變"
            ],
            answer: 1,
            explain: "'x' → setPose(x, 0, θ)，鎖定的是 Y=0。"
        },
        {
            q: "bindEzDrive 之後，建構時傳入的 LemLib ControllerSettings 實質上？",
            choices: [
                "仍是 moveToPose 的主要增益來源",
                "只影響 swing，不影響 lateral／angular",
                "大致被擱置；lateral／angular 改走 ezPID",
                "每次 autonomous() 開頭會自動還原使用"
            ],
            answer: 2,
            explain: "bind 後主要走 ezPID；建構時設定實質上被 unused。"
        },
        {
            q: "getRealPose 在 |α| 過大或 confidence 過低時會？",
            choices: [
                "仍強制寫入，並把修正量放大兩倍",
                "直接 return -1，接著 setPose 會崩潰",
                "跳過修正並回傳 expected（不硬扯位姿）",
                "改呼叫 wallReset('y') 作為後備方案"
            ],
            answer: 2,
            explain: "不可信或大斜角時跳過，回傳 expected。"
        },
        {
            q: "練習場按下 DOWN+Y（按住 Y 再 DOWN）會做什麼？",
            choices: [
                "開啟 PID tuner 並自動寫入 CSV",
                "只清除 traveled，不移動底盤",
                "執行 moveToPose(0,0,0, …) 回原點附近",
                "與單獨 DOWN 相同，只返回 Dash"
            ],
            answer: 2,
            explain: "DOWN+Y：chassis.moveToPose(0,0,0, …)。"
        },
        {
            q: "set_heading_constants 調的是哪一條控制迴路？",
            choices: [
                "moveToPose 整段曲線的角向／lead",
                "所有 turnToHeading／swingToHeading",
                "僅 ezPID.drive() 直線時用來鎖航向",
                "Dash 上顯示的 θ，不影響馬達出力"
            ],
            answer: 2,
            explain: "headingPID 只服務 drive() 直線鎖向；轉向用 turnPID。"
        },
        {
            q: "inline PID {.p,.i,.d} 對於 startI 的影響是？",
            choices: [
                "會一併覆寫 startI，結束後也不還原",
                "會暫時改 startI，該次運動結束後還原",
                "PIDGains 不帶 startI；startI 維持原全域設定",
                "startI 會被強制設成 0，避免積分暴衝"
            ],
            answer: 2,
            explain: "inline 只覆寫 p／i／d；startI 不從 PIDGains 讀取。"
        },
        {
            q: "場控接上後，PID tuner 與 Dash 分別會如何？",
            choices: [
                "兩者一併銷毀，必須重開機才恢復",
                "tuner 被 force_off／釋放；Dash 通常保留",
                "tuner 繼續開著，只是不能改增益",
                "自動重開 tuner，並立刻跑 autonomous()"
            ],
            answer: 1,
            explain: "場控：force_off 釋放 PID UI；Dash 一般保留。"
        },
        {
            q: "getRealPose 成功修正時，單次位移修正量大致如何限制？",
            choices: [
                "完全不限制，差值多大就寫多大",
                "固定每次只改 0.1 英吋",
                "軟性夾限約 ±6 英吋，避免一次扯太遠",
                "超過 1 英吋就改呼叫 wallReset"
            ],
            answer: 2,
            explain: "修正量有約 ±6″ 的 soft clamp。"
        },
        {
            q: "PID tuner 裡按 LEFT／RIGHT，與練習場 ←→ 的差異是？",
            choices: [
                "兩者都只切換 auton 名稱",
                "tuner 裡用來切 PID 欄位，並可能 zero_pose",
                "tuner 裡會執行 DOWN+B 同一套 auton",
                "沒有差異；快捷鍵完全共用同一處理函式"
            ],
            answer: 1,
            explain: "tuner 的 ←→ 切增益欄位／可 zero_pose；不是切 auton。"
        },
        {
            q: "LemLib 的 slew step 設成 ≥250（例如 255）時，實際意義是？",
            choices: [
                "達到硬體允許的最大斜率",
                "視為 0，即關閉 slew（不等於最快爬升）",
                "每 10ms 固定加 255，幾乎瞬間滿出力",
                "只影響轉向，對直線 lateral 無效"
            ],
            answer: 1,
            explain: "step≥250 會被當成 0＝unslewed。"
        },
        {
            q: "練習場單獨按 UP（新按下）通常會？",
            choices: [
                "開啟 PID tuner",
                "執行 autonomous()",
                "取消運動並 reset_pid（不一定回 Dash）",
                "寫入 /usd/auton_sel.txt"
            ],
            answer: 2,
            explain: "練習場 UP：cancel + reset_pid；長按才偏動畫。"
        },
        {
            q: "ezPID.waitUntil(dist) 與 chassis.waitUntil(dist) 量的「距離」？",
            choices: [
                "完全相同，都是 motion 的 distTraveled",
                "ezPID 用快照位姿的歐氏距離；chassis 用運動累計行程",
                "兩者都以 IMU 積分路徑長度為準",
                "ezPID 用編碼器度數；chassis 用英吋"
            ],
            answer: 1,
            explain: "語意不同：EzDrive 看 hypot 位移；chassis 看 distTraveled。"
        },
        {
            q: "auton_select 選到的 auton 名稱，重開機後通常？",
            choices: [
                "一定回到清單第一個",
                "寫在 /usd/auton_sel.txt，載入時 index % size",
                "存在 Brain 內部 EEPROM，與 SD 無關",
                "只在當次 opcontrol 有效，auton 前必清"
            ],
            answer: 1,
            explain: "持久化於 SD：/usd/auton_sel.txt。"
        },
        {
            q: "drive／turn 未指定 timeout 時，預設大約是？",
            choices: [
                "無限制，直到 settle 為止",
                "約 1500 ms；届滿該次運動停止",
                "固定 5000 ms，與 xPose 相同",
                "以 LVGL 幀數換算，約 90 幀"
            ],
            answer: 1,
            explain: "drive／turn 預設約 1500ms；xPose 的 timeout 為必填。"
        },
        {
            q: "Dash 上 DRV／MCH 溫度要對應到正確馬達，應改？",
            choices: [
                "ezlib/telem_dash.cpp 內的 port 硬編碼",
                "customs/dash_config.hpp，且 index 是 MotorGroup 宣告次序",
                "auton_select 註冊表裡的 motor 欄位",
                "lv_conf.h 的 LV_MEM_SIZE"
            ],
            answer: 1,
            explain: "改 dash_config.hpp；index≠smart-port 號。"
        },
        {
            q: "LV_MEM_CUSTOM 為 1 時，加大 LV_MEM_SIZE 會？",
            choices: [
                "立刻擴大 LVGL 靜態記憶體池",
                "幾乎不影響；配置改走系統 malloc／free",
                "強制改用 softfp，並禁止 realloc",
                "讓 Dash 的 RAM 數值改顯示 LV_MEM_SIZE"
            ],
            answer: 1,
            explain: "CUSTOM=1 時靜態池無關緊要，走 libc 配置。"
        },
        {
            q: "←→ 切換 auton 與真正進入 autonomous() 時，位姿行為差在？",
            choices: [
                "兩者都會 set_pose(0,0,0)",
                "←→ 不重設位姿；autonomous() 開頭常會 setPose(0,0,0)+reset_pid",
                "只有 ←→ 會重設；autonomous() 保留場上座標",
                "兩者都不動位姿，只改名稱"
            ],
            answer: 1,
            explain: "切名不重設；跑 auton 時 main 常先歸零位姿。"
        },
        {
            q: "moveToPoint／moveToPose 接近目標（約 <7.5″）時，角向輸出通常？",
            choices: [
                "加大 angularOut 以最後對準",
                "把 angularOut 強制為 0（close 區不再扭頭）",
                "自動切換到 headingPID 接管",
                "改用 wallReset 微調 θ"
            ],
            answer: 1,
            explain: "接近目標進入 close，angularOut=0。"
        },
        {
            q: "Liftlib 的軟限位（soft min／max）在何時生效？",
            choices: [
                "addPosition 當下就會改寫已存的目標度數",
                "開始移動時 clampTarget，命名位置本身仍存原值",
                "只在 Brain Dash 顯示警告，不限制馬達",
                "僅在 nest／CONSOLE 開啟時才夾限"
            ],
            answer: 1,
            explain: "命名位置存原值；移動時才套用 soft clamp。"
        }
    ];;;;;;;;

                            const questionBankEn = [
        {
            q: "If you omit async, how do ezPID.drive and LemLib moveToPoint differ?",
            choices: [
                "Both default async=true and return immediately",
                "ezPID blocks by default (false); most LemLib moves default async=true",
                "Both default false; you must set true for non-blocking",
                "Only turn blocks; drive and moveToPoint behave the same"
            ],
            answer: 1,
            explain: "EzDrive defaults async=false; most LemLib moves default async=true."
        },
        {
            q: "wallReset('x', …) actually locks which axis to 0?",
            choices: [
                "Sets X to 0; Y and θ stay completely unchanged",
                "Sets Y to 0 (wall-based); easy to invert vs the letter",
                "Zeros both X and Y; keeps θ only",
                "Resets θ only; axes unchanged"
            ],
            answer: 1,
            explain: "'x' → setPose(x, 0, θ), i.e. Y=0."
        },
        {
            q: "After bindEzDrive, the LemLib ControllerSettings from construction?",
            choices: [
                "Remain the main gains for moveToPose",
                "Affect swing only, not lateral/angular",
                "Are largely unused; lateral/angular go through ezPID",
                "Are restored automatically at each autonomous() start"
            ],
            answer: 2,
            explain: "After bind, motion uses ezPID; ctor settings are effectively unused."
        },
        {
            q: "getRealPose when |α| is large or confidence is low?",
            choices: [
                "Still forces a write and doubles the correction",
                "Returns -1 and then setPose crashes",
                "Skips the correction and returns expected",
                "Falls back to wallReset('y')"
            ],
            answer: 2,
            explain: "Untrusted or skewed readings skip; return expected."
        },
        {
            q: "In practice, what does DOWN+Y (hold Y, press DOWN) do?",
            choices: [
                "Opens the PID tuner and writes CSV",
                "Only clears traveled; chassis does not move",
                "Runs moveToPose(0,0,0, …) toward origin",
                "Same as solo DOWN: only returns to Dash"
            ],
            answer: 2,
            explain: "DOWN+Y: chassis.moveToPose(0,0,0, …)."
        },
        {
            q: "set_heading_constants tunes which loop?",
            choices: [
                "Full moveToPose curve heading / lead",
                "All turnToHeading / swingToHeading calls",
                "Only heading lock during ezPID.drive()",
                "Dash θ display only; no motor effect"
            ],
            answer: 2,
            explain: "headingPID serves drive() lock; turns use turnPID."
        },
        {
            q: "What does inline PID {.p,.i,.d} do to startI?",
            choices: [
                "Overwrites startI permanently",
                "Temporarily changes startI, then restores it",
                "PIDGains carries no startI; global startI stays",
                "Forces startI to 0 to avoid integral windup"
            ],
            answer: 2,
            explain: "Inline overrides p/i/d only; startI is not from PIDGains."
        },
        {
            q: "When field control connects, tuner vs Dash?",
            choices: [
                "Both are destroyed; reboot required",
                "Tuner is force_off/released; Dash usually stays",
                "Tuner stays open but gains become read-only",
                "Tuner reopens and immediately runs autonomous()"
            ],
            answer: 1,
            explain: "Field: force_off releases PID UI; Dash is generally kept."
        },
        {
            q: "When getRealPose applies a fix, the correction size is?",
            choices: [
                "Unlimited; whatever the raw diff is",
                "Always exactly 0.1 inches",
                "Soft-clamped about ±6 inches",
                "If over 1 inch, switches to wallReset"
            ],
            answer: 2,
            explain: "Correction is soft-clamped around ±6″."
        },
        {
            q: "LEFT/RIGHT in the PID tuner vs practice ←→?",
            choices: [
                "Both only change the auton name",
                "In the tuner they cycle PID fields and may zero_pose",
                "In the tuner they run the same path as DOWN+B",
                "Identical; they share one handler"
            ],
            answer: 1,
            explain: "Tuner ←→ cycles gain fields / may zero_pose; not auton."
        },
        {
            q: "LemLib slew step ≥250 (e.g. 255) means?",
            choices: [
                "Maximum hardware-allowed ramp",
                "Treated as 0: slew off (not “fastest ramp”)",
                "Add 255 every 10ms, nearly instant full power",
                "Affects turn only; lateral ignores it"
            ],
            answer: 1,
            explain: "step≥250 is treated as 0 = unslewed."
        },
        {
            q: "Solo new-press UP in practice usually?",
            choices: [
                "Opens the PID tuner",
                "Runs autonomous()",
                "Cancels motion and reset_pid (not necessarily Dash)",
                "Writes /usd/auton_sel.txt"
            ],
            answer: 2,
            explain: "Practice UP: cancel + reset_pid; hold UP is more about anim."
        },
        {
            q: "ezPID.waitUntil(dist) vs chassis.waitUntil(dist) measure?",
            choices: [
                "The same: both use motion distTraveled",
                "ezPID: Euclidean from a pose snapshot; chassis: motion travel",
                "Both use IMU-integrated path length",
                "ezPID: encoder degrees; chassis: inches"
            ],
            answer: 1,
            explain: "Different semantics: hypot displacement vs distTraveled."
        },
        {
            q: "After reboot, the auton_select name usually?",
            choices: [
                "Always resets to the first entry",
                "Persists in /usd/auton_sel.txt; load uses index % size",
                "Lives in Brain EEPROM; SD is unused",
                "Only lasts for that opcontrol; cleared before auton"
            ],
            answer: 1,
            explain: "Persisted on SD: /usd/auton_sel.txt."
        },
        {
            q: "Default timeout when drive/turn omit timeout?",
            choices: [
                "Unlimited until settle",
                "About 1500 ms; that motion then stops",
                "Fixed 5000 ms, same as xPose",
                "Derived from LVGL frames (~90)"
            ],
            answer: 1,
            explain: "drive/turn default ~1500ms; xPose timeout is required."
        },
        {
            q: "To map Dash DRV/MCH temps to the right motors, edit?",
            choices: [
                "Port hardcodes in ezlib/telem_dash.cpp",
                "customs/dash_config.hpp; index = MotorGroup list order",
                "The motor field in the auton_select registry",
                "LV_MEM_SIZE in lv_conf.h"
            ],
            answer: 1,
            explain: "Edit dash_config.hpp; index ≠ smart-port number."
        },
        {
            q: "With LV_MEM_CUSTOM=1, raising LV_MEM_SIZE?",
            choices: [
                "Immediately grows LVGL’s static pool",
                "Mostly irrelevant; alloc goes through system malloc/free",
                "Forces softfp and forbids realloc",
                "Makes Dash RAM display equal LV_MEM_SIZE"
            ],
            answer: 1,
            explain: "CUSTOM=1: static pool unused; libc allocation."
        },
        {
            q: "←→ changing auton vs entering autonomous() — pose?",
            choices: [
                "Both call set_pose(0,0,0)",
                "←→ keeps pose; autonomous() often setPose(0,0,0)+reset_pid",
                "Only ←→ resets; autonomous() keeps field pose",
                "Neither touches pose; name only"
            ],
            answer: 1,
            explain: "Name change keeps pose; running auton often zeros first."
        },
        {
            q: "Near the target (~<7.5″) in moveToPoint/Pose, angular out?",
            choices: [
                "Increases angularOut for a final snap",
                "Forces angularOut to 0 in the close zone",
                "Hands control to headingPID",
                "Uses wallReset to nudge θ"
            ],
            answer: 1,
            explain: "In close, angularOut=0."
        },
        {
            q: "When do Liftlib soft min/max limits apply?",
            choices: [
                "addPosition rewrites stored target degrees immediately",
                "clampTarget at move start; named positions keep raw values",
                "Dash warns only; motors are never limited",
                "Only while nest/CONSOLE is open"
            ],
            answer: 1,
            explain: "Stored raw; soft clamp applies when a move starts."
        }
    ];;;;;;;

    const questionBank = en ? questionBankEn : questionBankZh;

    let session = [];
    let index = 0;
    let score = 0;
    let answered = false;

    function shuffleInPlace(arr) {
        for (let i = arr.length - 1; i > 0; i -= 1) {
            const j = Math.floor(Math.random() * (i + 1));
            const tmp = arr[i];
            arr[i] = arr[j];
            arr[j] = tmp;
        }
        return arr;
    }

    function buildSession() {
        const order = shuffleInPlace(questionBank.map((_, i) => i));
        session = order.map((qi) => {
            const src = questionBank[qi];
            const choiceOrder = shuffleInPlace(src.choices.map((_, i) => i));
            const choices = choiceOrder.map((ci) => src.choices[ci]);
            const answer = choiceOrder.indexOf(src.answer);
            return { q: src.q, choices, answer, explain: src.explain };
        });
    }

    function startSession() {
        buildSession();
        index = 0;
        score = 0;
        answered = false;
        renderQuestion();
    }

    function setProgress(label, ratio) {
        progressLabel.textContent = label;
        progressFill.style.width = `${Math.max(0, Math.min(100, ratio * 100))}%`;
    }

    function showIntro() {
        index = 0;
        score = 0;
        answered = false;
        session = [];
        setProgress(ui.ready, 0);
        stage.innerHTML = `
            <p class="judge-quiz-lead">${ui.lead}</p>
            <button type="button" id="quiz-start-btn" class="judge-quiz-btn primary">${ui.start}</button>
        `;
        stage.querySelector('#quiz-start-btn').addEventListener('click', startSession);
    }

    function renderQuestion() {
        answered = false;
        const item = session[index];
        const total = session.length;
        setProgress(ui.progress(index + 1, total), index / total);
        stage.innerHTML = `
            <p class="judge-quiz-q">${item.q}</p>
            <div class="judge-quiz-options" role="group" aria-label="${ui.optGroup}"></div>
            <p class="judge-quiz-feedback" id="quiz-feedback"></p>
            <div class="judge-quiz-actions">
                <button type="button" id="quiz-next-btn" class="judge-quiz-btn primary" disabled>${ui.next}</button>
            </div>
        `;
        const optionsEl = stage.querySelector('.judge-quiz-options');
        const feedback = stage.querySelector('#quiz-feedback');
        const nextBtn = stage.querySelector('#quiz-next-btn');

        item.choices.forEach((text, i) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'judge-quiz-option';
            btn.textContent = `${String.fromCharCode(65 + i)}. ${text}`;
            btn.addEventListener('click', () => {
                if (answered) return;
                answered = true;
                const correct = i === item.answer;
                if (correct) score += 1;
                optionsEl.querySelectorAll('.judge-quiz-option').forEach((el, j) => {
                    el.disabled = true;
                    if (j === item.answer) el.classList.add('correct');
                    if (j === i && !correct) el.classList.add('wrong');
                });
                feedback.className = `judge-quiz-feedback ${correct ? 'ok' : 'bad'}`;
                feedback.textContent = (correct ? ui.correct : ui.wrong) + ' ' + item.explain;
                nextBtn.disabled = false;
                nextBtn.textContent = index === total - 1 ? ui.results : ui.next;
                setProgress(ui.progress(index + 1, total), (index + 1) / total);
            });
            optionsEl.appendChild(btn);
        });

        nextBtn.addEventListener('click', () => {
            if (!answered) return;
            if (index >= total - 1) {
                renderResult();
            } else {
                index += 1;
                renderQuestion();
            }
        });
    }

    function renderResult() {
        const total = session.length;
        const pct = score / total;
        const pass = pct >= PASS_RATIO;
        const pctLabel = Math.round(pct * 100);
        setProgress(ui.done(score, total), 1);
        stage.innerHTML = `
            <div class="judge-quiz-result">
                <p class="score-line">${score} / ${total} (${pctLabel}%)</p>
                <p class="${pass ? 'pass' : 'fail'}">${pass ? ui.pass : ui.fail}</p>
                <p class="judge-quiz-lead" style="margin-top:12px;">${ui.passHint}</p>
                <div class="judge-quiz-actions">
                    <button type="button" id="quiz-retry-btn" class="judge-quiz-btn primary">${ui.retry}</button>
                </div>
            </div>
        `;
        stage.querySelector('#quiz-retry-btn').addEventListener('click', showIntro);
    }

    const startBtn = document.getElementById('quiz-start-btn');
    if (startBtn) {
        startBtn.addEventListener('click', startSession);
    }
}