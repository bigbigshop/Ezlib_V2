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
            copyButton.textContent = '複製代碼';
            header.appendChild(copyButton);
            
            copyButton.addEventListener('click', function() {
                navigator.clipboard.writeText(codeBlock.textContent).then(() => {
                    copyButton.textContent = '已複製!';
                    copyButton.classList.add('copied');
                    setTimeout(() => {
                        copyButton.textContent = '複製代碼';
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
    const questions = [
        {
            q: 'ezPID.drive(distance, …) 的距離單位是？裁判問「你 drive 寫 24 係咩意思？」',
            choices: [
                '英吋（沿該次呼叫開始時的航向計算）',
                '馬達編碼器度數',
                '公分',
                'LemLib tile（1 tile = 24"）'
            ],
            answer: 0,
            explain: '單位是英吋，不是馬達度數。見序言單位表與第二章。'
        },
        {
            q: 'ezPID.turn 的目標角係邊種？',
            choices: [
                '相對當前航向的增量（度）',
                '弧度（rad）',
                '絕對航向（度；LemLib：0° → +Y，順時針為正）',
                '只跟 tracking wheel 有關，與 IMU 無關'
            ],
            answer: 2,
            explain: '轉向目標是絕對航向（度）。'
        },
        {
            q: 'EzDrive 建構並 bindEzDrive 之後，chassis.moveToPose／turnTo*／swingTo* 的 drive／turn PID 走邊套？',
            choices: [
                '仍只用 LemLib ControllerSettings，與 ezPID 無關',
                '必須另調一套 LemLib angular gains',
                '只共用 drive，turn 永遠獨立',
                '共用 ezPID 的 drive／turn PID'
            ],
            answer: 3,
            explain: 'bind 後 moveToPoint／moveToPose／turnTo*／swingTo* 共用 ezPID。'
        },
        {
            q: 'EzLib_2.0.0_beta（PROS 4.2.2）Brain UI 正確描述係？',
            choices: [
                '繼續用 robodash Console／Selector 做主畫面',
                'robodash 已淡出；只用 standalone LVGL（Type R Dash／PID／Anim）',
                '完全唔用 LVGL，只印 terminal',
                '必須保留 rd::Console::printf 先睇到 pose'
            ],
            answer: 1,
            explain: '隨 4.2.2 hard float 路線，robodash 淡出，改 standalone LVGL + Type R Dash。'
        },
        {
            q: '練習場（tuner 關）按 LEFT／RIGHT 換 auton 時，會唔會 set_pose？',
            choices: [
                '唔會 set_pose；只換名（上 Dash／手掣）',
                '會，每次都 set_pose(0,0,0)',
                '只清 X／Y，保留 θ',
                '會呼叫 wallReset'
            ],
            answer: 0,
            explain: '←→ 只換 auton，不 set_pose。Tuner 內 ←→ 換 field 才會 set_pose。'
        },
        {
            q: '練習場按 DOWN（tuner 關）做咩？',
            choices: [
                'focus 舊 robodash Console',
                '強制開 PID tuner',
                'reset_pid（清 traveled）+ 回 Type R Dash',
                '刪除全部 LVGL 頁並重開機'
            ],
            answer: 2,
            explain: 'DOWN = reset_pid + 回 Dash；舊「focus Console」已過期。'
        },
        {
            q: '點解 Auto 唔可以全程只信 LemLib odometry、從不重置？',
            choices: [
                '因為 ezPID 唔支援長距離',
                'PROS 4.2.2 禁止讀 chassis.getPose()',
                'moveToPose 唔需要位姿',
                '碰撞／打滑等會累積誤差（drift），中後段座標會偏'
            ],
            answer: 3,
            explain: '混合架構：曲線／長距用 LemLib，短距精準用 ezPID，關鍵點 wallReset／getRealPose。'
        },
        {
            q: 'getRealPose 的設計重點（相對校正）係？',
            choices: [
                '要你提供 CAD sensor offset 先用',
                'expected − (actual_perp − golden)×side；小角度 cos 投影；golden 已包安裝 offset',
                '等同 wallReset，一定要撞牆',
                '只改 θ，永遠唔改 X／Y'
            ],
            answer: 1,
            explain: '相對公式 + golden；唔使 CAD offset。|α|>25°／低 conf 回 expected；clamp ±6″。'
        },
        {
            q: 'Brain Dash 嘅 DRV／MCH 溫度應對應邊粒馬達，改邊個檔？',
            choices: [
                'include/customs/dash_config.hpp',
                '直接改 ezlib/telem_dash.cpp',
                'firmware/liblvgl.a',
                'rd::Selector 設定頁'
            ],
            answer: 0,
            explain: '溫度 map 集中在 dash_config.hpp；唔使改庫內 telem_dash。'
        },
        {
            q: '開 PID tuner（練習場）嘅正確做法？',
            choices: [
                '場控接住都得，按 X 即可',
                '一定要插 SD 先開到',
                '拔場控後用 X+A 進入；單獨 X 退出',
                '按 DOWN+Y 進入 tuner'
            ],
            answer: 2,
            explain: '須拔場控；X+A 進入，單獨 X 退出。場控接上會 force_off。'
        },
        {
            q: 'ezPID / LemLib motion 的 timeout 單位係？逾時後會點？',
            choices: [
                '秒；逾時只記 log，馬達繼續跑',
                '編碼器 tick；逾時自動 wallReset',
                '幀數（LVGL tick）',
                '毫秒；時間屆滿後馬達停止，該次運動結束'
            ],
            answer: 3,
            explain: 'timeout 單位是毫秒；屆滿後馬達停、該次運動結束（安全網）。'
        },
        {
            q: 'set_heading_constants 主要服務邊種運動？',
            choices: [
                'moveToPose 的角向／lead 曲線',
                '只服務 ezPID.drive() 直線鎖向；唔用於 moveToPose 角向',
                '所有 LemLib turnTo* 專用，與 drive 無關',
                '只改 controller 顯示，唔影響出力'
            ],
            answer: 1,
            explain: 'heading PID 只服務 ezPID.drive 直線；turn／曲線角向走 set_turn_constants（bind 後共用）。'
        },
        {
            q: 'dash_config 用 MotorGroup.get_temperature(index) 時，index 係咩？',
            choices: [
                'main.cpp MotorGroup list 裡面次序（0、1、2…），唔係 smart-port 號',
                '永遠等於 smart-port 號碼（如 port 14 → index 14）',
                'Brain 開機自動掃描到嘅第一粒馬達',
                '必須寫成負數先對應反轉 port'
            ],
            answer: 0,
            explain: '例 leftMotors({-14,-15,-16}) → index 0 = port 14。獨立 Motor 用 motor.get_temperature()。'
        },
        {
            q: 'getRealPose 內部防護：邊項正確？',
            choices: [
                '永遠強制校正，無上限',
                '斜超過 45° 仍照樣用 raw 距離寫 pose',
                '|α|>25° 或低 conf 時放棄／回 expected；單次 correction clamp ±6″',
                '壞讀數一律 return −1 令 setPose 崩潰'
            ],
            answer: 2,
            explain: 'cos 投影；|α|>25°／低 conf 回 expected；clamp ±6″。壞讀走 999／上一格 filter，唔再 −1。'
        },
        {
            q: '練習場要量「For PID Distance」（手推車睇走咗幾吋）應睇邊度？',
            choices: [
                '只睇 terminal 的 rd::Console',
                '必須開 tuner 先有 D:',
                '只能睇 SD CSV，手掣無顯示',
                '右搖桿切 displayMenu = 1 → D: = ezPID.get_traveled()（英吋）'
            ],
            answer: 3,
            explain: '練習場 menu 1 顯示 traveled；Brain Dash 可同時睇 pose／DIST／溫。'
        },
        {
            q: '練習場 DOWN+B 同 DOWN+Y 分別做咩？',
            choices: [
                '兩者都只係清 traveled',
                'DOWN+B：focus Dash + 跑 autonomous()；DOWN+Y：moveToPose(0,0,0,…)',
                'DOWN+B 開 tuner；DOWN+Y 換 auton',
                'DOWN+B 刪 LVGL；DOWN+Y 寫 SD header'
            ],
            answer: 1,
            explain: '見第七章練習掣表：DOWN+B 驗證 auton；DOWN+Y 回 (0,0,0) pose 曲線。'
        },
        {
            q: 'Inline PID（drive／turn 傳 {.p,.i,.d}）結束後增益點樣？startI 呢？',
            choices: [
                '結束後恢復全域 P／I／D；startI 不變',
                '永久覆寫全域常數，要人手 set_*_constants 先返',
                '連 startI 一齊改成該次傳入值',
                '只影響 Brain PID 頁顯示，唔改實際出力'
            ],
            answer: 0,
            explain: '單次覆寫；結束恢復全域；startI 不變。'
        },
        {
            q: '場控接上（competition::is_connected()）時，系統會點處理 tuner／UI？',
            choices: [
                '強制保持 tuner 開住方便場邊調',
                '只關動畫，tuner 同 Dash 全部保留狂刷',
                'pidTuner.force_off()、禁 X+A、停動畫並釋放 Anim／Dash／PID UI；拔出後重建',
                '自動跑 autonomous() 一次'
            ],
            answer: 2,
            explain: '場控 teardown：關 tuner、釋放 UI、手掣精簡三行；拔出場控再重建 PID／Dash。'
        },
        {
            q: 'EzLib_2.0.0_beta 的 LVGL 記憶體設定，邊句正確？',
            choices: [
                '固定 256KB BSS pool，禁止 malloc',
                '必須用 robodash 內建 10MB pool',
                '可用官方 softfp liblvgl.a 直接配 hard float kernel',
                'lv_conf：LV_MEM_CUSTOM 1（malloc／free）；beta 的 liblvgl.a 須 hard float ABI'
            ],
            answer: 3,
            explain: 'CUSTOM malloc；Dash 用 mallinfo 顯示 free RAM。beta 對齊 PROS 4.2.2 hardfp。'
        },
        {
            q: '現行 beta 點樣揀 auton？同舊 robodash Selector 有咩分別？',
            choices: [
                '仍要 Brain 上 rd::Selector LVGL 頁點選',
                'headless auton_select::init({名, 函數})；←→ 換名上 Dash／手掣，無 Selector 頁',
                '只能改 main.cpp 硬編碼一個 auton，無法切換',
                '靠 SD 卡檔名自動揀，與 controller 無關'
            ],
            answer: 1,
            explain: '唔再有 Selector 頁；auton_select headless + controller／Dash 顯示名。'
        }
    ];

    let index = 0;
    let score = 0;
    let answered = false;

    function setProgress(label, ratio) {
        progressLabel.textContent = label;
        progressFill.style.width = `${Math.max(0, Math.min(100, ratio * 100))}%`;
    }

    function showIntro() {
        index = 0;
        score = 0;
        answered = false;
        setProgress('準備開始', 0);
        stage.innerHTML = `
            <p class="judge-quiz-lead">共 ${questions.length} 題選擇題，涵蓋 PID 單位、底盤 bind、Dash 與舊 Console、練習掣、odom／getRealPose、dash_config、場控 teardown、standalone LVGL、auton_select 等。</p>
            <button type="button" id="quiz-start-btn" class="judge-quiz-btn primary">開始練習</button>
        `;
        stage.querySelector('#quiz-start-btn').addEventListener('click', () => {
            index = 0;
            score = 0;
            renderQuestion();
        });
    }

    function renderQuestion() {
        answered = false;
        const item = questions[index];
        setProgress(`第 ${index + 1} / ${questions.length} 題`, index / questions.length);
        stage.innerHTML = `
            <p class="judge-quiz-q">${item.q}</p>
            <div class="judge-quiz-options" role="group" aria-label="選項"></div>
            <p class="judge-quiz-feedback" id="quiz-feedback"></p>
            <div class="judge-quiz-actions">
                <button type="button" id="quiz-next-btn" class="judge-quiz-btn primary" disabled>下一題</button>
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
                feedback.textContent = (correct ? '正確。' : '未中。') + ' ' + item.explain;
                nextBtn.disabled = false;
                nextBtn.textContent = index === questions.length - 1 ? '睇成績' : '下一題';
                setProgress(`第 ${index + 1} / ${questions.length} 題`, (index + 1) / questions.length);
            });
            optionsEl.appendChild(btn);
        });

        nextBtn.addEventListener('click', () => {
            if (!answered) return;
            if (index >= questions.length - 1) {
                renderResult();
            } else {
                index += 1;
                renderQuestion();
            }
        });
    }

    function renderResult() {
        const pct = score / questions.length;
        const pass = pct >= PASS_RATIO;
        const pctLabel = Math.round(pct * 100);
        setProgress(`完成 · ${score}/${questions.length}`, 1);
        stage.innerHTML = `
            <div class="judge-quiz-result">
                <p class="score-line">${score} / ${questions.length}（${pctLabel}%）</p>
                <p class="${pass ? 'pass' : 'fail'}">${pass ? '熟用 EzLib' : '未達「熟用 EzLib」——再讀相關章節後重試'}</p>
                <p class="judge-quiz-lead" style="margin-top:12px;">及格線：答對率 ≥90%。建議對照第七章 Dash／LVGL、第二章單位、第四章 reset。</p>
                <div class="judge-quiz-actions">
                    <button type="button" id="quiz-retry-btn" class="judge-quiz-btn primary">再試一次</button>
                </div>
            </div>
        `;
        stage.querySelector('#quiz-retry-btn').addEventListener('click', showIntro);
    }

    const startBtn = document.getElementById('quiz-start-btn');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            index = 0;
            score = 0;
            renderQuestion();
        });
    }
}