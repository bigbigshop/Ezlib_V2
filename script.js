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
            q: "ezPID.drive(distance, …) 的距離單位是？",
            choices: [
                "英吋（沿該次呼叫開始航向）　　　　",
                "馬達編碼器累積嘅度數　　　　　　　",
                "場地量度用嘅公分單位　　　　　　　",
                "LemLib 計上嘅 tile 數"
            ],
            answer: 0,
            explain: "距離單位是英吋，不是馬達度數。"
        },
        {
            q: "ezPID.turn 的目標角係邊種？",
            choices: [
                "相對而家航向嘅增量角　　　　　　",
                "用弧度 rad 表示嘅角度　　　",
                "絕對航向（度；0°→+Y）　　　",
                "淨係跟住 tracking 角度"
            ],
            answer: 2,
            explain: "轉向目標是絕對航向（度）。"
        },
        {
            q: "bindEzDrive 之後，moveToPose／turnTo* 用邊套 PID？",
            choices: [
                "仍然只用 LemLib 內建設定　　　　　",
                "要另外再調一套 angular　　　　　　",
                "只共用 drive、turn 獨立　　　　",
                "共用 ezPID 嘅 drive／turn"
            ],
            answer: 3,
            explain: "bind 後 LemLib 長距／轉向共用 ezPID。"
        },
        {
            q: "Brain 主畫面（Dash／PID）點樣用？",
            choices: [
                "一定要連 PC terminal 先睇",
                "用 Dash、PID 頁同動畫頁　　　",
                "淨靠手掣三行字就夠　　　　　　　　　　",
                "只可以靠 SD CSV 睇數　　　　　"
            ],
            answer: 1,
            explain: "Brain 用 Dash、PID 頁與動畫 overlay。"
        },
        {
            q: "練習場 LEFT／RIGHT 換 auton（tuner 關）會 set_pose？",
            choices: [
                "唔會；只換名上 Dash／手掣　　　　　　",
                "會；每次都 set_pose(0,0,0)",
                "只清 X／Y，θ 永遠保留　　　　　　　　",
                "會順便呼叫 wallReset　　　　　　"
            ],
            answer: 0,
            explain: "←→ 只換 auton 名稱；tuner 內換 field 先會 set_pose。"
        },
        {
            q: "練習場按 DOWN（tuner 關、無 B／Y）做咩？",
            choices: [
                "強制打開 PID tuner 畫面　　",
                "刪除 Brain 全部 LVGL 頁　",
                "reset_pid 並且返回 Dash",
                "寫一行新嘅 SD CSV 頭　　　　　"
            ],
            answer: 2,
            explain: "DOWN = 清 traveled（reset_pid）+ 回 Dash。"
        },
        {
            q: "點解 Auto 唔好全程只信 odometry？",
            choices: [
                "因為 ezPID 完全唔支援長距　　　",
                "因為 PROS 禁止讀 getPose",
                "因為 moveToPose 唔使位姿　",
                "因為碰撞／打滑會累積 drift　　　"
            ],
            answer: 3,
            explain: "長距用 LemLib，短距用 ezPID，關鍵點要 reset。"
        },
        {
            q: "getRealPose 的用法重點係？",
            choices: [
                "一定要事先填 CAD offset",
                "用距離感測做相對校正　　　　　　　",
                "完全等同 wallReset 撞牆",
                "永遠只改 θ 唔改 X／Y　　　　"
            ],
            answer: 1,
            explain: "相對校正；低可信／大斜角時會放棄該次修正。"
        },
        {
            q: "DRV／MCH 溫度對應邊粒馬達，改邊個檔？",
            choices: [
                "customs/dash_config.hpp",
                "ezlib/telem_dash.cpp　　　",
                "firmware/liblvgl.a　　　　　",
                "auton_select 設定檔　　　　　　　"
            ],
            answer: 0,
            explain: "溫度對應寫喺 dash_config.hpp。"
        },
        {
            q: "開 PID tuner（練習場）正確做法？",
            choices: [
                "場控接住，淨係撳 X 就得　　　　　　",
                "一定要插 SD 卡先開到頁　　　　　　",
                "拔場控之後用 X+A 進入　　　　　　",
                "用 DOWN+Y 組合進入 tuner"
            ],
            answer: 2,
            explain: "拔場控；X+A 進入，單獨 X 退出。"
        },
        {
            q: "motion 的 timeout 單位同逾時行為？",
            choices: [
                "以秒計；逾時只寫 log　　",
                "以編碼器 tick 計時重置",
                "以 LVGL 幀數作為計時　",
                "以毫秒計；屆滿馬達停止　　　"
            ],
            answer: 3,
            explain: "timeout 係毫秒；時間到就停該次運動。"
        },
        {
            q: "set_heading_constants 主要服務邊種運動？",
            choices: [
                "moveToPose 曲線角向控制",
                "ezPID.drive 直線鎖航向",
                "所有 turnTo* 專用增益　　",
                "淨係改手掣顯示文字　　　　　　　　"
            ],
            answer: 1,
            explain: "heading 只服務 drive 直線；轉向用 set_turn_constants。"
        },
        {
            q: "MotorGroup.get_temperature(index) 嘅 index 係？",
            choices: [
                "list 次序 0、1、2…　",
                "等於 smart-port 號",
                "開機第一粒馬達　　　　　　　　",
                "反轉就要負 index　　　　"
            ],
            answer: 0,
            explain: "index 係 MotorGroup 宣告次序，唔係 port 號。"
        },
        {
            q: "getRealPose 防護邊項正確？",
            choices: [
                "永遠強制校正無上限　　　　　　",
                "斜角再大照樣寫入　　　　　　　",
                "低可信或大斜角跳過　　　　　　",
                "壞讀數固定 return -1"
            ],
            answer: 2,
            explain: "不可信時放棄／回 expected，並有單次修正上限。"
        },
        {
            q: "手推車量 For PID Distance 應睇邊？",
            choices: [
                "只睇 PC terminal 輸出",
                "一定要開住 tuner 先有　　　",
                "只能由 SD CSV 事後睇　　　",
                "手掣 menu=1 嘅 D:　　　"
            ],
            answer: 3,
            explain: "右搖桿切 menu 1，D: 即 get_traveled()（英吋）。"
        },
        {
            q: "DOWN+B 同 DOWN+Y（練習場）分別？",
            choices: [
                "兩個組合都只清 traveled　　　　　",
                "B 跑 auton；Y 去 (0,0,0)",
                "B 開 tuner；Y 換 auton　　",
                "B 刪 LVGL；Y 寫 SD　　　　　　"
            ],
            answer: 1,
            explain: "DOWN+B 跑 autonomous；DOWN+Y moveToPose(0,0,0)。"
        },
        {
            q: "inline PID（{.p,.i,.d}）結束後增益點樣？",
            choices: [
                "恢復返全域嘅 P／I／D　　",
                "永久覆寫晒全域常數　　　　　",
                "連 startI 都會一齊改",
                "只影響 Brain 頁面顯示"
            ],
            answer: 0,
            explain: "單次覆寫，結束後恢復全域；startI 不變。"
        },
        {
            q: "場控接上時系統會點處理 UI？",
            choices: [
                "強制維持 tuner 一直開住　　　",
                "只停止動畫，其他全照舊　　　　　　　",
                "關閉 tuner 並釋放 PID 頁",
                "自動立刻跑一次 autonomous"
            ],
            answer: 2,
            explain: "場控會 force_off tuner、釋放 PID／console；Dash／動畫仍可用。"
        },
        {
            q: "LVGL 記憶體設定邊句正確？",
            choices: [
                "固定使用 256KB BSS pool　　　",
                "必須使用 10MB 內建池　　　　　　　　　",
                "softfp 庫可配 hardfp 核　　　",
                "LV_MEM_CUSTOM 用 malloc"
            ],
            answer: 3,
            explain: "現行用 LV_MEM_CUSTOM（malloc）；liblvgl 要 hard float ABI。"
        },
        {
            q: "點樣揀 auton？",
            choices: [
                "一定要喺 Brain 撳選單頁　　　　　　",
                "auton_select 配 ←→ 換名稱",
                "main.cpp 入面只能寫死一個　　　　",
                "只靠 SD 檔名自動揀 auton　　　　"
            ],
            answer: 1,
            explain: "headless auton_select；controller／Dash 顯示名稱。"
        }
    ];;;;

                const questionBankEn = [
        {
            q: "What unit does ezPID.drive(distance, …) use?",
            choices: [
                "Inches along the start heading",
                "Motor encoder degree totals　　　",
                "Centimeters on the field tile　",
                "LemLib tile counts on grid　　　　"
            ],
            answer: 0,
            explain: "Drive distance is inches, not motor degrees."
        },
        {
            q: "What kind of angle does ezPID.turn target?",
            choices: [
                "Relative delta from heading now",
                "An angle written in radians　　　　",
                "Absolute heading (deg; 0°→+Y)　　",
                "Tracking-wheel angle values　　　　"
            ],
            answer: 2,
            explain: "Turn targets absolute heading in degrees."
        },
        {
            q: "After bindEzDrive, which PID do moveToPose / turnTo* use?",
            choices: [
                "Only LemLib built-in settings　　",
                "A separately tuned angular set　",
                "Shared drive, separate turn PID",
                "Shared ezPID drive and turn　　　　"
            ],
            answer: 3,
            explain: "After bind, those motions share ezPID."
        },
        {
            q: "How do you use Brain UI (Dash / PID)?",
            choices: [
                "Pose only on the PC terminal　",
                "Use Dash, PID, and anim pages",
                "Controller lines are enough　　",
                "Read numbers only from SD CSV"
            ],
            answer: 1,
            explain: "Brain shows Dash, PID overlay, and optional anim."
        },
        {
            q: "LEFT/RIGHT auton change (tuner off)—set_pose?",
            choices: [
                "No; name only on Dash/handset",
                "Yes; always set_pose(0,0,0)　　",
                "Clears X/Y but keeps theta　　　",
                "Also runs wallReset once　　　　　"
            ],
            answer: 0,
            explain: "←→ only changes auton name; tuner field change sets pose."
        },
        {
            q: "What does DOWN do (tuner off, no B/Y)?",
            choices: [
                "Force-opens the PID tuner UI　",
                "Deletes every LVGL Brain page",
                "reset_pid and return to Dash　",
                "Writes a new SD CSV header　　　"
            ],
            answer: 2,
            explain: "DOWN clears traveled and returns to Dash."
        },
        {
            q: "Why not trust odometry alone for full Auto?",
            choices: [
                "ezPID cannot do long moves　　　",
                "PROS forbids reading getPose　",
                "moveToPose needs no pose data",
                "Bumps and slip cause drift　　　"
            ],
            answer: 3,
            explain: "Use LemLib for long moves, ezPID for short precision, reset at key points."
        },
        {
            q: "What is the key idea of getRealPose?",
            choices: [
                "Requires a CAD sensor offset　　",
                "Relative pose fix via distance",
                "Same as wallReset every time　　",
                "Only theta changes, never XY　　"
            ],
            answer: 1,
            explain: "Relative correction; skips when confidence/angle is bad."
        },
        {
            q: "Where are Dash DRV/MCH temperature motors set?",
            choices: [
                "customs/dash_config.hpp",
                "ezlib/telem_dash.cpp　　　",
                "firmware/liblvgl.a　　　　　",
                "auton_select config　　　　"
            ],
            answer: 0,
            explain: "Temperature mapping lives in dash_config.hpp."
        },
        {
            q: "Correct way to open the PID tuner in practice?",
            choices: [
                "Field connected; press X alone",
                "SD card must be inserted first",
                "Unplug field, then press X+A　　",
                "Enter tuner with DOWN+Y keys　　"
            ],
            answer: 2,
            explain: "Unplug field control; X+A enters, X alone exits."
        },
        {
            q: "timeout unit and behavior when it expires?",
            choices: [
                "Seconds; only writes a log　　　　",
                "Encoder ticks; then auto-reset",
                "Counted in LVGL frame ticks　　　",
                "Milliseconds; motors stop then"
            ],
            answer: 3,
            explain: "timeout is ms; the motion ends when time is up."
        },
        {
            q: "What does set_heading_constants mainly serve?",
            choices: [
                "Angular path for moveToPose　",
                "Heading lock in ezPID.drive　",
                "Gains only for all turnTo*　　",
                "Controller display text only"
            ],
            answer: 1,
            explain: "Heading PID is for drive straight; turns use set_turn_constants."
        },
        {
            q: "What is index in MotorGroup.get_temperature(index)?",
            choices: [
                "List order 0, 1, 2…　　　　　　　",
                "The smart-port number　　　　　",
                "First motor at boot scan　　",
                "Negative if motor reversed"
            ],
            answer: 0,
            explain: "index is declaration order, not the port number."
        },
        {
            q: "Which getRealPose safety rule is correct?",
            choices: [
                "Always force unlimited fixes",
                "Any skew still writes pose　　",
                "Skip when conf/skew is bad　　",
                "Bad reads always return -1　　"
            ],
            answer: 2,
            explain: "Untrusted readings are skipped; corrections are capped."
        },
        {
            q: "Where do you read For PID Distance while pushing?",
            choices: [
                "Only from the PC terminal　",
                "Only while PID tuner open　",
                "Only afterward from SD CSV",
                "Handset menu=1 shows D:　　　"
            ],
            answer: 3,
            explain: "Menu 1 D: is get_traveled() in inches."
        },
        {
            q: "DOWN+B vs DOWN+Y in practice?",
            choices: [
                "Both combos only clear traveled",
                "B runs auton; Y goes (0,0,0)　　　",
                "B opens tuner; Y swaps auton　　　",
                "B deletes UI; Y writes the SD　　"
            ],
            answer: 1,
            explain: "DOWN+B runs autonomous; DOWN+Y moveToPose(0,0,0)."
        },
        {
            q: "After inline PID {.p,.i,.d}, what about gains?",
            choices: [
                "Global P/I/D values restore　",
                "Globals stay permanently set",
                "startI is changed together　　",
                "Brain display values only　　　"
            ],
            answer: 0,
            explain: "One-shot override; globals restore; startI unchanged."
        },
        {
            q: "When field control connects, UI does what?",
            choices: [
                "Keeps the tuner forced open　　",
                "Stops anim only; rest same　　　",
                "Closes tuner and frees PID UI",
                "Automatically runs autonomous"
            ],
            answer: 2,
            explain: "Field closes tuner/console UI; Dash and anim remain available."
        },
        {
            q: "Which LVGL memory statement is correct?",
            choices: [
                "Always a fixed 256KB BSS pool",
                "Must use a built-in 10MB pool",
                "softfp libs work on hardfp　　　",
                "LV_MEM_CUSTOM uses malloc　　　　"
            ],
            answer: 3,
            explain: "LV_MEM_CUSTOM malloc; liblvgl needs hard-float ABI."
        },
        {
            q: "How do you select auton?",
            choices: [
                "Must tap a Brain picker page　",
                "auton_select with ←→ names　　　",
                "Only one hard-coded in main　　",
                "SD filename alone picks auton"
            ],
            answer: 1,
            explain: "headless auton_select; name shows on controller/Dash."
        }
    ];;;;

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