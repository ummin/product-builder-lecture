// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').slice(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80, // Adjust for fixed header
                behavior: 'smooth'
            });
        }
    });
});

class LottoBall extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const number = this.getAttribute('number');
        const color = this.getColor(number);
        
        this.shadowRoot.innerHTML = `
            <style>
                .ball {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-size: 1.2rem;
                    font-weight: bold;
                    color: #fff;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                    animation: appear 0.4s ease-out;
                    background-image: radial-gradient(circle at 30% 30%, ${color} 40%, ${this.shadeColor(color, -30)} 100%);
                    border: 2px solid rgba(255,255,255,0.2);
                }

                @keyframes appear {
                    from { transform: scale(0) rotate(-180deg); opacity: 0; }
                    to { transform: scale(1) rotate(0deg); opacity: 1; }
                }
            </style>
            <div class="ball">${number}</div>
        `;
    }

    getColor(number) {
        if (number <= 10) return '#fbc02d'; // Yellow
        if (number <= 20) return '#1976d2'; // Blue
        if (number <= 30) return '#d32f2f'; // Red
        if (number <= 40) return '#7b1fa2'; // Purple
        return '#388e3c'; // Green
    }

    shadeColor(color, percent) {
        let f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
        return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
    }
}

customElements.define('lotto-ball', LottoBall);

// Theme toggle logic
const themeButton = document.getElementById('theme-button');
const currentTheme = localStorage.getItem('theme') || 'light';

if (currentTheme === 'dark') {
    document.body.setAttribute('data-theme', 'dark');
    if(themeButton) themeButton.textContent = '☀️';
}

if(themeButton) {
    themeButton.addEventListener('click', () => {
        let theme = document.body.getAttribute('data-theme');
        if (theme === 'dark') {
            document.body.removeAttribute('data-theme');
            themeButton.textContent = '🌙';
            localStorage.setItem('theme', 'light');
        } else {
            document.body.setAttribute('data-theme', 'dark');
            themeButton.textContent = '☀️';
            localStorage.setItem('theme', 'dark');
        }
    });
}

function generateLottoNumbers() {
    const numbers = new Set();
    while (numbers.size < 6) {
        numbers.add(Math.floor(Math.random() * 45) + 1);
    }
    return Array.from(numbers).sort((a, b) => a - b);
}

function displayLottoSet(container, numbers, delay = 0) {
    numbers.forEach((number, index) => {
        setTimeout(() => {
            const lottoBall = document.createElement('lotto-ball');
            lottoBall.setAttribute('number', number);
            container.appendChild(lottoBall);
        }, delay + index * 100);
    });
}

const genBtn = document.getElementById('generate-button');
const recBtn = document.getElementById('recommend-button');

if(genBtn) {
    genBtn.addEventListener('click', () => {
        const container = document.getElementById('lotto-balls-container');
        const recommendContainer = document.getElementById('recommend-container');
        container.innerHTML = '';
        recommendContainer.innerHTML = '';
        
        const numbers = generateLottoNumbers();
        displayLottoSet(container, numbers);
    });
}

if(recBtn) {
    recBtn.addEventListener('click', () => {
        const container = document.getElementById('lotto-balls-container');
        const recommendContainer = document.getElementById('recommend-container');
        container.innerHTML = '';
        recommendContainer.innerHTML = '';
        
        for (let i = 0; i < 5; i++) {
            const setDiv = document.createElement('div');
            setDiv.className = 'recommend-set';
            recommendContainer.appendChild(setDiv);
            
            const numbers = generateLottoNumbers();
            displayLottoSet(setDiv, numbers, i * 200);
        }
    });
}

// Partnership form handling
const partnershipForm = document.getElementById('partnership-form');
const formStatus = document.getElementById('form-status');

if (partnershipForm) {
    partnershipForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = new FormData(e.target);
        const submitButton = document.getElementById('submit-button');
        
        submitButton.disabled = true;
        submitButton.textContent = '보내는 중...';
        formStatus.textContent = '';

        try {
            const response = await fetch(e.target.action, {
                method: partnershipForm.method,
                body: data,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                formStatus.style.color = '#2ecc71';
                formStatus.textContent = '문의가 성공적으로 전송되었습니다. 감사합니다!';
                partnershipForm.reset();
            } else {
                const result = await response.json();
                if (Object.hasOwn(result, 'errors')) {
                    formStatus.style.color = '#e74c3c';
                    formStatus.textContent = result.errors.map(error => error.message).join(", ");
                } else {
                    formStatus.style.color = '#e74c3c';
                    formStatus.textContent = '오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
                }
            }
        } catch (error) {
            formStatus.style.color = '#e74c3c';
            formStatus.textContent = '네트워크 오류가 발생했습니다. 연결 상태를 확인해주세요.';
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = '문의 보내기';
        }
    });
}
