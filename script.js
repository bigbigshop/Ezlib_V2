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
            q: "ezPID.drive(distance, …) 用咩單位？",
            choices: [
                "英吋（同 tracking 行程一致）",
                "馬達編碼器度數",
                "公分",
                "LemLib tile"
            ],
            answer: 0,
            explain: "drive 距離係英吋。"
        },
        {
            q: "ezPID.turn 的目標係？",
            choices: [
                "相對而家航向再加減幾多度",
                "絕對航向（度），唔係相對 delta",
                "弧度",
                "净係 tracking wheel 角度"
            ],
            answer: 1,
            explain: "turn 目標係絕對航向（度）。"
        },
        {
            q: "bindEzDrive 之後，chassis.moveToPose 用邊套 PID？",
            choices: [
                "建構時嗰套 LemLib ControllerSettings",
                "另外再調一套 LemLib angular gains",
                "同 turnTo* 一樣改用 ezPID",
                "drive 用 ezPID，turn 永遠另一套"
            ],
            answer: 2,
            explain: "bind 後 moveToPose／turnTo* 共用 ezPID。"
        },
        {
            q: "Brain 上邊度睇電量／pose／溫度？",
            choices: [
                "PC USB terminal",
                "Brain 上嘅 Dash（telem_dash）",
                "淨讀 /usd 入面 CSV",
                "手掣三行就夠，Brain 無畫面"
            ],
            answer: 1,
            explain: "用 Brain Dash（telem_dash）。"
        },
        {
            q: "練習場 ←→ 換 auton，會唔會 set_pose(0,0,0)？",
            choices: [
                "唔會；只換名稱，位姿照舊",
                "會；每次換名都強制回原點",
                "只清 X／Y，θ 保留",
                "會，同埋自動 wallReset"
            ],
            answer: 0,
            explain: "←→ 只換名稱；唔會 set_pose。"
        },
        {
            q: "練習場撳 DOWN（無按住 B／Y）做咩？",
            choices: [
                "強制開 PID tuner",
                "刪晒 LVGL 頁再重建 Dash",
                "返 Dash，練習場通常一併 reset_pid",
                "寫 SD CSV header 之後先清 traveled"
            ],
            answer: 2,
            explain: "DOWN 返 Dash；練習場會 reset_pid。"
        },
        {
            q: "點解長 Auto 唔好全程只信 odometry？",
            choices: [
                "因為 ezPID 完全唔可以行長距離",
                "因為 PROS 禁止呼叫 getPose()",
                "因為 moveToPose 根本唔需要位姿",
                "碰撞／打滑會 drift，中段要 reset"
            ],
            answer: 3,
            explain: "碰撞／打滑會累積誤差，要中段 reset。"
        },
        {
            q: "getRealPose 主要做咩？",
            choices: [
                "一定要你提供 CAD 上嘅 sensor offset",
                "用距離感測做相對位姿校正",
                "同 wallReset 完全一樣，一定要撞牆",
                "只改 θ，X／Y 永遠唔郁"
            ],
            answer: 1,
            explain: "用距離感測做相對位姿校正。"
        },
        {
            q: "改 DRV／MCH 溫度對應邊粒馬達，改邊個檔？",
            choices: [
                "customs/dash_config.hpp 入面嘅對應表",
                "ezlib/telem_dash.cpp 硬編碼",
                "firmware/liblvgl.a 要重編",
                "auton_select 註冊表一併決定溫度"
            ],
            answer: 0,
            explain: "改 customs/dash_config.hpp。"
        },
        {
            q: "練習場點入 PID tuner？",
            choices: [
                "場控接住撳 X 就得",
                "一定要插 SD 先開到",
                "拔場控之後撳 X+A",
                "DOWN+Y 會直接進入 tuner 頁"
            ],
            answer: 2,
            explain: "拔場控後 X+A 進入。"
        },
        {
            q: "timeout 單位係？逾時會點？",
            choices: [
                "秒；逾時只寫 log，馬達繼續",
                "編碼器 tick；逾時自動 wallReset",
                "LVGL 幀數",
                "毫秒；該次運動會停"
            ],
            answer: 3,
            explain: "timeout 毫秒；屆滿該次運動停止。"
        },
        {
            q: "set_heading_constants 主要畀邊個用？",
            choices: [
                "moveToPose 成條曲線嘅角向／lead",
                "ezPID.drive() 直線時鎖向",
                "所有 turnTo*／swingTo* 專用",
                "只改手掣顯示，唔影響出力"
            ],
            answer: 1,
            explain: "heading 服務 drive 直線鎖向。"
        },
        {
            q: "MotorGroup.get_temperature(index) 嘅 index？",
            choices: [
                "MotorGroup 宣告 list 次序（由 0 起）",
                "等於 smart-port 號碼（port 14 → 14）",
                "開機自動掃到嘅第一粒馬達",
                "反轉接線嘅馬達必須用負 index"
            ],
            answer: 0,
            explain: "係 MotorGroup 宣告次序，唔係 port 號。"
        },
        {
            q: "getRealPose 碰到不可信／大斜角讀數會點？",
            choices: [
                "仍然強制寫入，無上限",
                "斜角再大都照用 raw 距離",
                "跳過該次修正，或回 expected",
                "固定 return -1 令 setPose 崩潰"
            ],
            answer: 2,
            explain: "低可信或大斜角會放棄該次修正。"
        },
        {
            q: "手推車量距離（For PID Distance）睇邊？",
            choices: [
                "只可以睇 PC terminal",
                "一定要開住 PID tuner",
                "只能事後開 SD CSV",
                "手掣 menu 1 嘅 D:（get_traveled）"
            ],
            answer: 3,
            explain: "displayMenu=1 顯示 get_traveled()（英吋）。"
        },
        {
            q: "DOWN+B 做咩？（練習場）",
            choices: [
                "只清 traveled，唔跑程式",
                "跑 autonomous()（同場邊測 auton）",
                "打開 PID tuner",
                "刪 LVGL 之後先重建 Dash"
            ],
            answer: 1,
            explain: "DOWN+B：跑 autonomous()。"
        },
        {
            q: "inline PID {.p,.i,.d} 跑完之後？",
            choices: [
                "恢復全域增益，唔永久覆寫",
                "永久覆寫全域，要人手 set_*_constants",
                "連 startI 一齊改成今次傳入值",
                "只改 Brain 顯示，實際出力唔變"
            ],
            answer: 0,
            explain: "單次覆寫，結束後恢復全域。"
        },
        {
            q: "場控接上之後，PID tuner 會點？",
            choices: [
                "保持開住方便場邊調",
                "只停動畫，tuner 繼續刷新",
                "會關掉／force_off 釋放 PID UI",
                "自動跑一次 autonomous()"
            ],
            answer: 2,
            explain: "場控會 force_off／釋放 PID UI。"
        },
        {
            q: "LV_MEM_CUSTOM 1 代表？",
            choices: [
                "固定 256KB BSS，禁止 malloc",
                "必須用 10MB 內建 pool",
                "softfp 庫可以直接配 hardfp kernel",
                "LVGL 改用系統 malloc／free"
            ],
            answer: 3,
            explain: "LV_MEM_CUSTOM 走系統 malloc／free。"
        },
        {
            q: "點樣換 auton？",
            choices: [
                "一定要 Brain 上有 Selector 頁點選",
                "手掣 ←→（auton_select 換名）",
                "main.cpp 只能寫死一個，無法切換",
                "只靠 SD 檔名，同手掣無關"
            ],
            answer: 1,
            explain: "auton_select + 手掣 ←→ 換名。"
        }
    ];;;;;;

                        const questionBankEn = [
        {
            q: "What unit does ezPID.drive(distance, …) use?",
            choices: [
                "Inches (same as tracking travel)",
                "Motor encoder degrees",
                "Centimeters",
                "LemLib tiles"
            ],
            answer: 0,
            explain: "Drive distance is inches."
        },
        {
            q: "What does ezPID.turn target?",
            choices: [
                "A relative delta from current heading",
                "Absolute heading in degrees, not a delta",
                "Radians",
                "Tracking-wheel angle only"
            ],
            answer: 1,
            explain: "Turn targets absolute heading in degrees."
        },
        {
            q: "After bindEzDrive, which PID does moveToPose use?",
            choices: [
                "Only LemLib ControllerSettings from construction",
                "A separate LemLib angular gain set you tune",
                "ezPID, same as turnTo*",
                "ezPID for drive; turn stays on another set"
            ],
            answer: 2,
            explain: "After bind, moveToPose/turnTo* share ezPID."
        },
        {
            q: "Where do you read battery / pose / temps on the Brain?",
            choices: [
                "PC USB terminal",
                "Brain Dash (telem_dash)",
                "Only CSV files on the SD card",
                "Controller three lines; Brain has no UI"
            ],
            answer: 1,
            explain: "Use the Brain Dash (telem_dash)."
        },
        {
            q: "Does ←→ changing auton also set_pose(0,0,0)?",
            choices: [
                "No; only the name changes, pose stays",
                "Yes; every name change resets pose",
                "Clears X/Y only; keeps last theta",
                "Yes, and it also runs wallReset"
            ],
            answer: 0,
            explain: "←→ only changes the auton name."
        },
        {
            q: "What does DOWN do (no B/Y held)?",
            choices: [
                "Force-opens the PID tuner",
                "Deletes every LVGL page then rebuilds Dash",
                "Returns to Dash; practice usually reset_pid too",
                "Writes an SD CSV header, then clears traveled"
            ],
            answer: 2,
            explain: "DOWN returns to Dash; practice also reset_pid."
        },
        {
            q: "Why not trust odometry alone for a long Auto?",
            choices: [
                "ezPID cannot travel long distances at all",
                "PROS forbids calling getPose()",
                "moveToPose does not use pose at all",
                "Bumps/slip cause drift; reset mid-run"
            ],
            answer: 3,
            explain: "Bumps/slip accumulate error; reset mid-run."
        },
        {
            q: "What is getRealPose mainly for?",
            choices: [
                "You must supply a CAD sensor offset first",
                "Relative pose correction from ranging",
                "Identical to wallReset; always hit a wall",
                "Only changes theta; never touches X/Y"
            ],
            answer: 1,
            explain: "Relative pose correction from distance sensing."
        },
        {
            q: "Where do you map DRV/MCH temperature motors?",
            choices: [
                "The map inside customs/dash_config.hpp",
                "Hardcodes in ezlib/telem_dash.cpp",
                "Rebuild firmware/liblvgl.a for it to apply",
                "auton_select’s registry also sets temperatures"
            ],
            answer: 0,
            explain: "Edit customs/dash_config.hpp."
        },
        {
            q: "How do you open the PID tuner in practice?",
            choices: [
                "Field connected; press X only",
                "SD card is required before it opens",
                "Unplug field control, then press X+A",
                "DOWN+Y enters the tuner page directly"
            ],
            answer: 2,
            explain: "Unplug field control, then X+A."
        },
        {
            q: "timeout unit, and on expiry?",
            choices: [
                "Seconds; log only, motors keep going",
                "Encoder ticks; then automatic wallReset",
                "LVGL frame counts",
                "Milliseconds; that motion stops"
            ],
            answer: 3,
            explain: "timeout is ms; that motion stops when time is up."
        },
        {
            q: "set_heading_constants mainly serves?",
            choices: [
                "Full moveToPose curve heading / lead",
                "Heading lock during ezPID.drive()",
                "All turnTo* / swingTo* exclusively",
                "Controller display only; no motor effect"
            ],
            answer: 1,
            explain: "Heading PID locks heading during drive()."
        },
        {
            q: "index in MotorGroup.get_temperature(index)?",
            choices: [
                "Declaration list order in the group (from 0)",
                "Equal to the smart-port number (14 → 14)",
                "The first motor auto-scanned at boot",
                "Reversed motors must use a negative index"
            ],
            answer: 0,
            explain: "Declaration order in the group, not port number."
        },
        {
            q: "getRealPose on a bad / skewed reading?",
            choices: [
                "Still forces a write with no cap",
                "Uses raw distance even at huge skew",
                "Skips that correction, or returns expected",
                "Always returns -1 and crashes setPose"
            ],
            answer: 2,
            explain: "Low confidence or large skew skips the correction."
        },
        {
            q: "Where is For PID Distance while pushing the robot?",
            choices: [
                "PC terminal only",
                "Only while the PID tuner is open",
                "Only later from the SD CSV",
                "Controller menu 1 D: (get_traveled)"
            ],
            answer: 3,
            explain: "displayMenu=1 shows get_traveled() in inches."
        },
        {
            q: "What does DOWN+B do in practice?",
            choices: [
                "Only clears traveled; does not run code",
                "Runs autonomous() for sideline testing",
                "Opens the PID tuner",
                "Deletes LVGL, then rebuilds Dash"
            ],
            answer: 1,
            explain: "DOWN+B runs autonomous()."
        },
        {
            q: "After an inline PID {.p,.i,.d} move?",
            choices: [
                "Global gains restore; not a permanent overwrite",
                "Globals stay overwritten until set_*_constants",
                "startI also becomes the inline value",
                "Brain display changes only; motors unchanged"
            ],
            answer: 0,
            explain: "One-shot override; globals restore afterward."
        },
        {
            q: "When field control connects, the PID tuner?",
            choices: [
                "Stays open for pit-side tuning",
                "Only anim stops; tuner keeps refreshing",
                "Closes / force_off releases the PID UI",
                "Automatically runs autonomous() once"
            ],
            answer: 2,
            explain: "Field control force_off / releases PID UI."
        },
        {
            q: "LV_MEM_CUSTOM 1 means?",
            choices: [
                "Fixed 256KB BSS; malloc forbidden",
                "Must use a built-in 10MB pool",
                "softfp libs can pair with a hardfp kernel",
                "LVGL uses system malloc / free"
            ],
            answer: 3,
            explain: "LV_MEM_CUSTOM uses system malloc/free."
        },
        {
            q: "How do you switch auton?",
            choices: [
                "Must tap a Selector page on the Brain",
                "Controller ←→ (auton_select renames)",
                "Only one hard-coded auton in main.cpp",
                "SD filename alone; controller unused"
            ],
            answer: 1,
            explain: "auton_select + controller ←→ changes the name."
        }
    ];;;;;;

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