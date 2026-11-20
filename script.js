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
    if (version && version !== '2.0.2') url.searchParams.set('v', version);
    url.hash = hash || '';
    return url.pathname + url.search + url.hash;
}

(function initDocsControls() {
    const verSelect = document.getElementById('docs-version');
    const langSelect = document.getElementById('docs-lang');

    function applyDocsVersion(v, pushUrl) {
        if (v !== '2.0.0' && v !== '2.0.1' && v !== '2.0.2') v = '2.0.2';
        document.documentElement.setAttribute('data-docs-version', v);
        if (verSelect) verSelect.value = v;
        const mobileTitle = document.querySelector('.mobile-header .header-text');
        if (mobileTitle) mobileTitle.textContent = 'EzLib · ' + v;
        document.title = (isEnglishDocs() ? 'EzLib Docs · ' : 'EzLib說明書 · ') + v;

        if (pushUrl) {
            const url = new URL(window.location.href);
            if (v === '2.0.2') url.searchParams.delete('v');
            else url.searchParams.set('v', v);
            history.replaceState(null, '', url.pathname + url.search + url.hash);
        }

        const hash = window.location.hash.replace(/^#/, '');
        if (hash) {
            const target = document.getElementById(hash);
            if (target) {
                const hidden = target.closest('.only-v200, .only-v201, .only-v202, .since-v201');
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
    const rawVer = params.get('v');
    const initialVer = (rawVer === '2.0.0' || rawVer === '2.0.1' || rawVer === '2.0.2') ? rawVer : '2.0.2';
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
              lead: 'Pick a difficulty, then start. Easy = basics; Hard = edge cases.',
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
              lead: '請先選擇難度，再開始。容易＝基礎；困難＝邊界細節。',
              start: '開始練習',
              next: '下一題',
              results: '看成績',
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
    const questionBankZhEasy = [
        {
            q: "ezPID.drive(distance, …) 的距離單位是？",
            choices: [
                "英吋（與行程一致）··　　",
                "公分（再自行換算）··　　",
                "編碼器輸出度數····　　",
                "LemLib 的 tile"
            ],
            answer: 0,
            explain: "drive 距離單位為英吋。"
        },
        {
            q: "ezPID.turn 的目標角度是？",
            choices: [
                "相對目前航向差值",
                "絕對航向（度）值",
                "以弧度表示目標　",
                "僅輪式角度目標　"
            ],
            answer: 1,
            explain: "turn 目標為絕對航向（度）。"
        },
        {
            q: "bindEzDrive 之後，moveToPose 主要使用？",
            choices: [
                "建構時 LemLib 增益",
                "另一套獨立 angular",
                "與轉向共用 ezPID　　",
                "只改畫面不改出力···　　"
            ],
            answer: 2,
            explain: "bind 後 moveToPose／turnTo* 共用 ezPID。"
        },
        {
            q: "在 Brain 上查看電量／位姿／溫度，主要靠？",
            choices: [
                "PC 端 USB terminal",
                "Dash（telem_dash）　",
                "只讀 SD 內 CSV····　　",
                "只靠手掣三行字········　　"
            ],
            answer: 1,
            explain: "使用 Brain 上的 Dash。"
        },
        {
            q: "練習場用 ←→ 切換 auton 時，會 set_pose(0,0,0) 嗎？",
            choices: [
                "不會，只更換名稱····　　",
                "會，每次都先歸零····　　",
                "只清除 X／Y 軸···　　",
                "會並執行 wallReset"
            ],
            answer: 0,
            explain: "←→ 只換名稱，不重設位姿。"
        },
        {
            q: "練習場單獨按 DOWN（未按 B／Y）會？",
            choices: [
                "直接開啟 PID tuner··",
                "刪除全部 LVGL 頁····　",
                "返回 Dash（常 reset）",
                "只寫入 CSV header·　"
            ],
            answer: 2,
            explain: "DOWN 返回 Dash；練習場通常 reset_pid。"
        },
        {
            q: "長距離 Auto 不宜全程只信 odometry，主因是？",
            choices: [
                "ezPID 無法走遠路··　　",
                "PROS 禁止 getPose",
                "moveToPose 不用位姿",
                "會漂移，中段要 reset　　"
            ],
            answer: 3,
            explain: "碰撞／打滑累積誤差，需中段 reset。"
        },
        {
            q: "getRealPose 的主要用途是？",
            choices: [
                "必須先填 CAD offset",
                "做相對位姿校正用·····　　",
                "等同 wallReset 撞牆",
                "只改 θ 不改 XY···　　"
            ],
            answer: 1,
            explain: "以距離感測做相對位姿校正。"
        },
        {
            q: "要改 DRV／MCH 溫度對應哪顆馬達，應改？",
            choices: [
                "dash_config.hpp 對照",
                "telem_dash.cpp 寫死·",
                "重編 liblvgl.a 庫···　",
                "auton_select 註冊表·　"
            ],
            answer: 0,
            explain: "修改 customs/dash_config.hpp。"
        },
        {
            q: "練習場如何進入 PID tuner？",
            choices: [
                "接場控後只按 X·　　",
                "必須先插入 SD 卡　",
                "拔場控後按 X+A　　",
                "DOWN+Y 直接進入"
            ],
            answer: 2,
            explain: "拔除場控後按 X+A。"
        },
        {
            q: "timeout 單位與逾時行為是？",
            choices: [
                "秒；只寫一筆 log·····　　",
                "tick；自動 wallReset",
                "以 LVGL 幀計時·····　　",
                "毫秒；該次運動停止······　　"
            ],
            answer: 3,
            explain: "timeout 為毫秒；届滿停止該次運動。"
        },
        {
            q: "set_heading_constants 主要服務？",
            choices: [
                "moveToPose 曲線角向",
                "drive 直線時鎖航向·　　",
                "全部 turnTo* 專用　　",
                "只改手掣上顯示······　　"
            ],
            answer: 1,
            explain: "heading 用於 drive() 直線鎖向。"
        },
        {
            q: "MotorGroup.get_temperature(index) 的 index 是？",
            choices: [
                "宣告 list 次序（0 起）　",
                "等於 smart-port 號碼",
                "開機掃到的第一顆······　　",
                "反轉馬達要用負值······　　"
            ],
            answer: 0,
            explain: "是 MotorGroup 宣告次序，不是 port 號。"
        },
        {
            q: "getRealPose 遇到不可信讀數時通常？",
            choices: [
                "仍然強制寫入位姿······",
                "斜角再大也照樣用·····　",
                "跳過並回傳 expected",
                "固定回 -1 令崩潰···　"
            ],
            answer: 2,
            explain: "低可信或大斜角會跳過該次修正。"
        },
        {
            q: "手推車量測 For PID Distance，應看？",
            choices: [
                "只能看 PC terminal",
                "必須開著 PID tuner　",
                "只能事後開 CSV 檔··　　",
                "手掣 menu 1 的 D:　"
            ],
            answer: 3,
            explain: "displayMenu=1 顯示 get_traveled()（英吋）。"
        },
        {
            q: "練習場按下 DOWN+B 會？",
            choices: [
                "只清除 traveled 值·",
                "執行 autonomous()",
                "開啟 PID tuner 頁　",
                "刪 LVGL 重建 Dash　"
            ],
            answer: 1,
            explain: "DOWN+B 執行 autonomous()。"
        },
        {
            q: "inline PID {.p,.i,.d} 跑完之後？",
            choices: [
                "恢復原來的全域增益··　　",
                "永久覆寫全域設定···　　",
                "連 startI 一併永改",
                "只改顯示不改出力···　　"
            ],
            answer: 0,
            explain: "單次覆寫，結束後恢復全域。"
        },
        {
            q: "場控接上後，PID tuner 會？",
            choices: [
                "保持開啟方便場邊調·····　　",
                "只停動畫仍會刷新······　　",
                "關閉並釋放 PID UI··　　",
                "自動跑 autonomous()"
            ],
            answer: 2,
            explain: "場控會 force_off／釋放 PID UI。"
        },
        {
            q: "LV_MEM_CUSTOM 設為 1 表示？",
            choices: [
                "固定 256KB 禁 malloc",
                "必須用 10MB 內建池···　　",
                "softfp 可配 hardfp　",
                "LVGL 改用系統 malloc　"
            ],
            answer: 3,
            explain: "CUSTOM=1 使用系統 malloc／free。"
        },
        {
            q: "如何切換目前 auton？",
            choices: [
                "必須點 Brain Selector",
                "控制器 ←→ 換名稱······　　",
                "main.cpp 只能寫死···　　",
                "只靠 SD 檔名決定······　　"
            ],
            answer: 1,
            explain: "auton_select + 控制器 ←→ 換名。"
        }
    ];

    const questionBankEnEasy = [
        {
            q: "What unit does ezPID.drive(distance, …) use?",
            choices: [
                "Inches (matches travel)··　　",
                "Centimeters (convert later)",
                "Motor encoder degrees····　　",
                "LemLib tile units········　　"
            ],
            answer: 0,
            explain: "Drive distance is inches."
        },
        {
            q: "What does ezPID.turn target?",
            choices: [
                "Relative delta heading",
                "Absolute heading (deg)",
                "Target in radians···　　",
                "Wheel angle only····　　"
            ],
            answer: 1,
            explain: "Turn targets absolute heading in degrees."
        },
        {
            q: "After bindEzDrive, moveToPose mainly uses?",
            choices: [
                "Ctor LemLib gain sets　　",
                "A separate angular set　",
                "Shared ezPID gains···　　",
                "Display only, no motors"
            ],
            answer: 2,
            explain: "After bind, moveToPose/turnTo* share ezPID."
        },
        {
            q: "Where do you read battery/pose/temps on Brain?",
            choices: [
                "PC USB terminal view　",
                "Dash (telem_dash) UI　",
                "SD CSV files only··　　",
                "Controller lines only"
            ],
            answer: 1,
            explain: "Use the Brain Dash (telem_dash)."
        },
        {
            q: "Does practice ←→ changing auton also set_pose(0,0,0)?",
            choices: [
                "No; name change only　　",
                "Yes; zeros pose always",
                "Clears X/Y axes only　　",
                "Yes, plus wallReset·　　"
            ],
            answer: 0,
            explain: "←→ only changes the auton name."
        },
        {
            q: "Solo DOWN in practice (no B/Y held) does?",
            choices: [
                "Opens the PID tuner·······",
                "Deletes every LVGL page··　",
                "Returns Dash (often reset)",
                "Writes CSV header only···　"
            ],
            answer: 2,
            explain: "DOWN returns to Dash; practice usually reset_pid."
        },
        {
            q: "Why not trust odometry alone for a long Auto?",
            choices: [
                "ezPID cannot go far···　　",
                "PROS forbids getPose··　　",
                "moveToPose needs no pose",
                "Drift; reset mid-run··　　"
            ],
            answer: 3,
            explain: "Bumps/slip accumulate error; reset mid-run."
        },
        {
            q: "What is getRealPose mainly for?",
            choices: [
                "Needs a CAD offset first",
                "Relative pose correction",
                "Same as wallReset hits　　",
                "Only changes θ, not XY　　"
            ],
            answer: 1,
            explain: "Relative pose correction from ranging."
        },
        {
            q: "Where do you map DRV/MCH temperature motors?",
            choices: [
                "dash_config.hpp map　　",
                "telem_dash.cpp ports　",
                "Rebuild liblvgl.a··　　",
                "auton_select registry"
            ],
            answer: 0,
            explain: "Edit customs/dash_config.hpp."
        },
        {
            q: "How do you open the PID tuner in practice?",
            choices: [
                "Field on, press X only",
                "SD card is required·　　",
                "Unplug field, then X+A",
                "DOWN+Y opens tuner··　　"
            ],
            answer: 2,
            explain: "Unplug field control, then X+A."
        },
        {
            q: "timeout unit and behavior on expiry?",
            choices: [
                "Seconds; log only······",
                "Ticks; auto wallReset·　",
                "Counted in LVGL frames　",
                "Milliseconds; stop move"
            ],
            answer: 3,
            explain: "timeout is ms; that motion stops when time is up."
        },
        {
            q: "set_heading_constants mainly serves?",
            choices: [
                "moveToPose curve heading",
                "drive() heading lock··　　",
                "All turnTo* calls only　　",
                "Controller display only　"
            ],
            answer: 1,
            explain: "Heading PID locks heading during drive()."
        },
        {
            q: "index in MotorGroup.get_temperature(index)?",
            choices: [
                "List order starting at 0　　",
                "Equals smart-port number　　",
                "First motor found at boot　",
                "Negative if motor reversed"
            ],
            answer: 0,
            explain: "Declaration order, not port number."
        },
        {
            q: "getRealPose on a bad or skewed reading?",
            choices: [
                "Still forces a pose write",
                "Uses raw even if skewed　　",
                "Skips / returns expected　",
                "Returns -1 and crashes·　　"
            ],
            answer: 2,
            explain: "Low confidence or large skew skips the correction."
        },
        {
            q: "Where is For PID Distance while pushing?",
            choices: [
                "PC terminal readout only·",
                "Only while tuner is open　",
                "Only later via CSV file·　",
                "Controller menu 1 D: line"
            ],
            answer: 3,
            explain: "displayMenu=1 shows get_traveled() in inches."
        },
        {
            q: "What does DOWN+B do in practice mode?",
            choices: [
                "Only clears traveled　　",
                "Runs autonomous() now　",
                "Opens the PID tuner·　　",
                "Deletes LVGL, rebuilds"
            ],
            answer: 1,
            explain: "DOWN+B runs autonomous()."
        },
        {
            q: "After an inline PID {.p,.i,.d} move?",
            choices: [
                "Global gains restore···　　",
                "Globals stay overwritten　",
                "startI also stays changed",
                "Display only, no motors　　"
            ],
            answer: 0,
            explain: "One-shot override; globals restore afterward."
        },
        {
            q: "When field control connects, the PID tuner?",
            choices: [
                "Stays open for pit tune　　",
                "Anim stops; still refresh",
                "Closes / releases PID UI　",
                "Auto-runs autonomous()·　　"
            ],
            answer: 2,
            explain: "Field control force_off / releases PID UI."
        },
        {
            q: "LV_MEM_CUSTOM set to 1 means?",
            choices: [
                "Fixed 256KB; no malloc·",
                "Must use a 10MB pool··　",
                "softfp with hardfp OK·　",
                "LVGL uses system malloc"
            ],
            answer: 3,
            explain: "LV_MEM_CUSTOM uses system malloc/free."
        },
        {
            q: "How do you switch the current auton?",
            choices: [
                "Brain Selector page only",
                "Controller ←→ renames·　　",
                "One hard-coded auton··　　",
                "SD filename alone picks　"
            ],
            answer: 1,
            explain: "auton_select + controller ←→ changes the name."
        }
    ];

    const questionBankZhHard = [
        {
            q: "省略 async 時，ezPID.drive 與 LemLib moveToPoint 預設？",
            choices: [
                "兩者皆預設 async 並回傳···········",
                "ezPID 預設阻塞；LemLib 多為 async",
                "兩者皆預設阻塞，要手動非阻塞···········　",
                "只有 turn 阻塞；drive 與點對點相同··　"
            ],
            answer: 1,
            explain: "EzDrive 預設 async=false；LemLib 多數運動預設 true。"
        },
        {
            q: "wallReset('x', …) 實際會把哪一軸鎖成 0？",
            choices: [
                "把 X 設 0，Y／θ 都不變",
                "把 Y 設 0，字母直覺易反　",
                "X 與 Y 都歸零，只留 θ　",
                "只重設 θ，兩軸都不改··　　"
            ],
            answer: 1,
            explain: "'x' → setPose(x, 0, θ)，鎖定的是 Y=0。"
        },
        {
            q: "bindEzDrive 之後，建構時的 LemLib ControllerSettings？",
            choices: [
                "仍是 moveToPose 主增益　",
                "只影響 swing 不影響轉向·　　",
                "大致擱置，改走 ezPID···　　",
                "每次 autonomous 自動還原"
            ],
            answer: 2,
            explain: "bind 後主要走 ezPID；建構設定實質 unused。"
        },
        {
            q: "getRealPose 在大斜角或低 confidence 時？",
            choices: [
                "仍強制寫入並放大修正······　　",
                "回傳 -1 並令 setPose 崩",
                "跳過修正，回傳 expected　　",
                "改呼叫 wallReset 作後備　"
            ],
            answer: 2,
            explain: "不可信或大斜角時跳過，回傳 expected。"
        },
        {
            q: "練習場按住 Y 再按 DOWN（DOWN+Y）會？",
            choices: [
                "開啟 tuner 並寫入 CSV·····",
                "只清 traveled，車不動·····　",
                "moveToPose(0,0,0) 回原點",
                "與單獨 DOWN 一樣回 Dash···　"
            ],
            answer: 2,
            explain: "DOWN+Y：chassis.moveToPose(0,0,0, …)。"
        },
        {
            q: "set_heading_constants 調的是哪一條迴路？",
            choices: [
                "moveToPose 曲線角向 lead",
                "全部 turnTo／swingTo 專用",
                "僅 drive() 直線時鎖航向··　　",
                "只改 Dash 的 θ 顯示值···　　"
            ],
            answer: 2,
            explain: "headingPID 只服務 drive() 鎖向；轉向用 turnPID。"
        },
        {
            q: "inline PID {.p,.i,.d} 對 startI 的影響？",
            choices: [
                "一併覆寫且結束不還原········",
                "暫時改 startI 結束再還··　",
                "PIDGains 不含 startI",
                "強制 startI=0 防暴衝··　"
            ],
            answer: 2,
            explain: "inline 只覆寫 p／i／d；startI 不從 PIDGains 來。"
        },
        {
            q: "場控接上後，PID tuner 與 Dash 分別？",
            choices: [
                "兩者銷毀，要重開機········　　",
                "tuner 釋放；Dash 常保留　　",
                "tuner 仍開，只讀增益····　　",
                "自動重開 tuner 並跑 auton"
            ],
            answer: 1,
            explain: "場控 force_off 釋放 PID UI；Dash 一般保留。"
        },
        {
            q: "getRealPose 成功修正時，單次位移大約？",
            choices: [
                "不限制，差值多大寫多大····　　",
                "固定每次只改 0.1 英吋··　　",
                "軟夾限約 ±6 英吋·····　　",
                "逾 1 英吋改 wallReset"
            ],
            answer: 2,
            explain: "修正量約有 ±6″ soft clamp。"
        },
        {
            q: "PID tuner 內 LEFT／RIGHT 與練習場 ←→？",
            choices: [
                "兩者都只切 auton 名稱　　",
                "tuner 切增益欄／可歸零　　",
                "tuner 內等同 DOWN+B",
                "快捷鍵完全同一處理函式···　　"
            ],
            answer: 1,
            explain: "tuner 的 ←→ 切增益欄位／可 zero_pose。"
        },
        {
            q: "LemLib slew step 設成 ≥250（如 255）？",
            choices: [
                "代表硬體最大爬升斜率·····　　",
                "視為 0，即關閉 slew··　　",
                "每 10ms 加 255 近滿出力",
                "只影響轉向，直線無效·····　　"
            ],
            answer: 1,
            explain: "step≥250 當成 0＝unslewed。"
        },
        {
            q: "練習場單獨新按下 UP 通常會？",
            choices: [
                "開啟 PID tuner 畫面·　　",
                "立刻執行 autonomous()　",
                "取消運動並 reset_pid·　　",
                "寫入 auton_sel.txt 檔"
            ],
            answer: 2,
            explain: "練習場 UP：cancel + reset_pid。"
        },
        {
            q: "ezPID.waitUntil 與 chassis.waitUntil 量的距離？",
            choices: [
                "完全相同，皆 distTraveled···",
                "ezPID 歐氏距；chassis 累計行程",
                "兩者皆 IMU 路徑積分·········　",
                "ezPID 度數；chassis 英吋··　"
            ],
            answer: 1,
            explain: "語意不同：hypot 位移 vs distTraveled。"
        },
        {
            q: "auton_select 名稱在重開機後通常？",
            choices: [
                "一定回到清單第一個·········",
                "存 SD：auton_sel.txt",
                "存 EEPROM，與 SD 無關·　",
                "僅當次有效，auton 前清···　"
            ],
            answer: 1,
            explain: "持久化於 SD：/usd/auton_sel.txt。"
        },
        {
            q: "drive／turn 未給 timeout 時，預設約？",
            choices: [
                "無限制直到 settle····　　",
                "約 1500 ms 後停止···　　",
                "固定 5000 ms 同 xPose",
                "約九十個 LVGL 幀·····　　"
            ],
            answer: 1,
            explain: "drive／turn 預設約 1500ms；xPose timeout 必填。"
        },
        {
            q: "Dash DRV／MCH 溫度要對到正確馬達？",
            choices: [
                "改 telem_dash.cpp port··",
                "改 dash_config；index 為次序",
                "改 auton_select motor 欄　",
                "改 lv_conf 的 MEM_SIZE··　"
            ],
            answer: 1,
            explain: "改 dash_config.hpp；index≠smart-port。"
        },
        {
            q: "LV_MEM_CUSTOM=1 時加大 LV_MEM_SIZE？",
            choices: [
                "立刻擴大靜態記憶體池········　　",
                "幾乎無影響，走系統 malloc··　　",
                "強制 softfp 並禁 realloc",
                "Dash RAM 改顯示該常數···　　"
            ],
            answer: 1,
            explain: "CUSTOM=1 時靜態池無關，走 libc 配置。"
        },
        {
            q: "←→ 切 auton 與進入 autonomous() 的位姿？",
            choices: [
                "兩者都會 set_pose 歸零···",
                "←→ 不重設；跑 auton 常先歸零",
                "只有 ←→ 重設；auton 保留·　",
                "兩者都不動，只改名稱········　"
            ],
            answer: 1,
            explain: "切名不重設；跑 auton 時 main 常先歸零。"
        },
        {
            q: "moveToPoint／Pose 接近目標（約 <7.5″）？",
            choices: [
                "加大 angular 做最終對準·",
                "angular 強制 0，不再扭頭",
                "改由 headingPID 接管　",
                "用 wallReset 微調 θ　"
            ],
            answer: 1,
            explain: "接近目標進入 close，angularOut=0。"
        },
        {
            q: "LiftSys soft min／max 對手動 setVoltage／teleop？",
            choices: [
                "只擋 moveTo，手動可衝過",
                "庫內硬擋；反向永遠可拉離邊界",
                "只警告，唔停出力",
                "要自己每幀 if 角度"
            ],
            answer: 1,
            explain: "有 limit 時 setVoltage／PID 都不可突破；反向永遠放行。"
        }
    ];

    const questionBankEnHard = [
        {
            q: "Omitting async: ezPID.drive vs LemLib moveToPoint?",
            choices: [
                "Both default async and return······",
                "ezPID blocks; most LemLib are async",
                "Both block; set true to free······　",
                "Only turn blocks; drive matches···　"
            ],
            answer: 1,
            explain: "EzDrive defaults async=false; most LemLib moves default true."
        },
        {
            q: "wallReset('x', …) locks which axis to 0?",
            choices: [
                "Sets X=0; Y/θ unchanged·········",
                "Sets Y=0; letter is easy to flip",
                "Zeros X and Y; keeps θ·········　",
                "Resets θ only; axes stay·······　"
            ],
            answer: 1,
            explain: "'x' → setPose(x, 0, θ), i.e. Y=0."
        },
        {
            q: "After bindEzDrive, ctor LemLib ControllerSettings?",
            choices: [
                "Still main moveToPose gains",
                "Swing only, not drive/turn　",
                "Mostly unused; ezPID drives",
                "Restored each autonomous()　"
            ],
            answer: 2,
            explain: "After bind, motion uses ezPID; ctor settings unused."
        },
        {
            q: "getRealPose when skew is large or confidence low?",
            choices: [
                "Forces write and doubles fix",
                "Returns -1; setPose crashes　",
                "Skips fix; returns expected　",
                "Falls back to wallReset···　　"
            ],
            answer: 2,
            explain: "Untrusted or skewed readings skip; return expected."
        },
        {
            q: "Practice: hold Y then DOWN (DOWN+Y) does?",
            choices: [
                "Opens tuner and writes CSV·",
                "Clears traveled; no motion　",
                "moveToPose(0,0,0) to origin",
                "Same as solo DOWN to Dash·　"
            ],
            answer: 2,
            explain: "DOWN+Y: chassis.moveToPose(0,0,0, …)."
        },
        {
            q: "set_heading_constants tunes which loop?",
            choices: [
                "moveToPose curve heading/lead",
                "All turnTo/swingTo calls···　　",
                "Only drive() heading lock··　　",
                "Dash θ display only········　　"
            ],
            answer: 2,
            explain: "headingPID serves drive() lock; turns use turnPID."
        },
        {
            q: "Inline PID {.p,.i,.d} effect on startI?",
            choices: [
                "Overwrites startI for good　　",
                "Changes startI then restores",
                "PIDGains has no startI····　　",
                "Forces startI=0 always····　　"
            ],
            answer: 2,
            explain: "Inline overrides p/i/d only; startI not from PIDGains."
        },
        {
            q: "Field connected: tuner vs Dash behavior?",
            choices: [
                "Both destroyed; reboot needed···",
                "Tuner released; Dash often stays",
                "Tuner open, gains read-only····　",
                "Reopens tuner and runs auton···　"
            ],
            answer: 1,
            explain: "Field force_off releases PID UI; Dash generally kept."
        },
        {
            q: "getRealPose successful fix: correction size?",
            choices: [
                "Unlimited; raw diff written",
                "Always 0.1 inches exactly　　",
                "Soft-clamped about ±6 in·　　",
                "Over 1 in uses wallReset·　　"
            ],
            answer: 2,
            explain: "Correction is soft-clamped around ±6″."
        },
        {
            q: "LEFT/RIGHT in PID tuner vs practice ←→?",
            choices: [
                "Both only change auton name····",
                "Tuner cycles fields / zero_pose",
                "Tuner runs same as DOWN+B·····　",
                "Identical shared key handler··　"
            ],
            answer: 1,
            explain: "Tuner ←→ cycles gain fields / may zero_pose."
        },
        {
            q: "LemLib slew step set to ≥250 (e.g. 255)?",
            choices: [
                "Max hardware ramp rate····　　",
                "Treated as 0: slew disabled　",
                "Add 255/10ms near full power",
                "Turn only; lateral ignores　　"
            ],
            answer: 1,
            explain: "step≥250 is treated as 0 = unslewed."
        },
        {
            q: "Solo new-press UP in practice usually?",
            choices: [
                "Opens the PID tuner UI·····",
                "Runs autonomous() at once·　",
                "Cancel motion and reset_pid",
                "Writes auton_sel.txt file·　"
            ],
            answer: 2,
            explain: "Practice UP: cancel + reset_pid."
        },
        {
            q: "ezPID.waitUntil vs chassis.waitUntil measure?",
            choices: [
                "Same: both distTraveled····　　",
                "ezPID hypot; chassis travel　　",
                "Both IMU path length only··　　",
                "ezPID degrees; chassis inches"
            ],
            answer: 1,
            explain: "Different semantics: hypot vs distTraveled."
        },
        {
            q: "After reboot, auton_select name usually?",
            choices: [
                "Always first list entry　　",
                "SD file auton_sel.txt··　　",
                "Brain EEPROM; no SD····　　",
                "Cleared before each auton"
            ],
            answer: 1,
            explain: "Persisted on SD: /usd/auton_sel.txt."
        },
        {
            q: "Default timeout when drive/turn omit it?",
            choices: [
                "Unlimited until settle　　",
                "About 1500 ms then stop　",
                "Fixed 5000 ms like xPose",
                "About ninety LVGL frames"
            ],
            answer: 1,
            explain: "drive/turn default ~1500ms; xPose timeout required."
        },
        {
            q: "Map Dash DRV/MCH temps to correct motors?",
            choices: [
                "Edit telem_dash.cpp ports···",
                "Edit dash_config; list index",
                "Edit auton_select motors···　",
                "Edit lv_conf MEM_SIZE······　"
            ],
            answer: 1,
            explain: "Edit dash_config.hpp; index ≠ smart-port."
        },
        {
            q: "LV_MEM_CUSTOM=1 and raising LV_MEM_SIZE?",
            choices: [
                "Grows LVGL static pool now····",
                "Mostly irrelevant; uses malloc",
                "Forces softfp; bans realloc··　",
                "Dash RAM shows that constant·　"
            ],
            answer: 1,
            explain: "CUSTOM=1: static pool unused; libc allocation."
        },
        {
            q: "←→ change auton vs enter autonomous() — pose?",
            choices: [
                "Both set_pose(0,0,0)··········",
                "←→ keeps pose; run often zeros",
                "Only ←→ resets; auton keeps··　",
                "Neither touches pose; name···　"
            ],
            answer: 1,
            explain: "Name change keeps pose; running auton often zeros."
        },
        {
            q: "Near target (~<7.5″) in moveToPoint/Pose?",
            choices: [
                "Raise angular for final snap",
                "Force angularOut=0 in close　",
                "Hand off to headingPID····　　",
                "wallReset nudges θ a bit··　　"
            ],
            answer: 1,
            explain: "In close, angularOut=0."
        },
        {
            q: "LiftSys soft min/max vs manual setVoltage/teleop?",
            choices: [
                "Only clamps moveTo; manual can overshoot",
                "Hard-blocked in-lib; reverse always allowed",
                "Warn only; motors keep pushing",
                "You must if-angle every loop yourself"
            ],
            answer: 1,
            explain: "With limits, setVoltage/PID cannot breach; reverse always OK."
        }
    ];

    let difficulty = (localStorage.getItem('ezlib-quiz-difficulty') === 'hard') ? 'hard' : 'easy';

    function currentBank() {
        if (en) return difficulty === 'hard' ? questionBankEnHard : questionBankEnEasy;
        return difficulty === 'hard' ? questionBankZhHard : questionBankZhEasy;
    }

    function leadForDifficulty() {
        if (en) {
            return difficulty === 'hard'
                ? 'Hard · 20 edge-case questions (async defaults, wallReset axes, slew, waitUntil, soft limits, …).'
                : 'Easy · 20 basics (units, bind, Dash, controls, odom/reset, dash_config, field, LVGL, auton_select).';
        }
        return difficulty === 'hard'
            ? '困難 · 20 題邊界細節（async 預設、wallReset 軸向、slew、waitUntil、軟限位等）。'
            : '容易 · 20 題基礎（單位、bind、Dash、練習掣、odom／reset、dash_config、場控、LVGL、auton_select）。';
    }

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
        const bank = currentBank();
        const order = shuffleInPlace(bank.map((_, i) => i));
        session = order.map((qi) => {
            const src = bank[qi];
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
        const easyLabel = en ? 'Easy' : '容易';
        const hardLabel = en ? 'Hard' : '困難';
        stage.innerHTML = `
            <div class="judge-quiz-diff">
                <label for="quiz-difficulty">${en ? 'Difficulty' : '難度'}</label>
                <select id="quiz-difficulty" aria-label="${en ? 'Difficulty' : '難度'}">
                    <option value="easy" ${difficulty === 'easy' ? 'selected' : ''}>${easyLabel}</option>
                    <option value="hard" ${difficulty === 'hard' ? 'selected' : ''}>${hardLabel}</option>
                </select>
            </div>
            <p class="judge-quiz-lead">${leadForDifficulty()}</p>
            <button type="button" id="quiz-start-btn" class="judge-quiz-btn primary">${ui.start}</button>
        `;
        const diffSel = stage.querySelector('#quiz-difficulty');
        diffSel.addEventListener('change', () => {
            difficulty = diffSel.value === 'hard' ? 'hard' : 'easy';
            localStorage.setItem('ezlib-quiz-difficulty', difficulty);
            showIntro();
        });
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

    showIntro();
}