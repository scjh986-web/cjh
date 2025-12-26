// 弹窗操作函数 - 优化动画逻辑
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  setTimeout(() => {
    updateCloseBtnPosition(modalId);
  }, 10);
  if (modalId === 'skills-modal') {
    initSkillsChart();
  }
}
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.classList.remove('active');
  document.body.style.overflow = 'auto';
}
// 点击弹窗外部关闭 - 优化事件委托
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.remove('active');
      document.body.style.overflow = 'auto';
    }
  });
});
// 头像点击三次惊喜 - 优化计数逻辑
let clickCount = 0;
const surpriseAvatar = document.getElementById('surprise-avatar');
if (surpriseAvatar) {
  surpriseAvatar.addEventListener('click', () => {
    clickCount++;
    if (clickCount === 3) {
      const alertBox = document.createElement('div');
      alertBox.style.position = 'fixed';
      alertBox.style.top = '50%';
      alertBox.style.left = '50%';
      alertBox.style.transform = 'translate(-50%, -50%)';
      alertBox.style.backgroundColor = 'var(--primary)';
      alertBox.style.color = 'white';
      alertBox.style.padding = '1rem 2rem';
      alertBox.style.borderRadius = '8px';
      alertBox.style.boxShadow = 'var(--shadow-lg)';
      alertBox.style.zIndex = '9999';
      alertBox.style.animation = 'scaleIn 0.3s ease';
      alertBox.textContent = '🎉 惊喜触发！祝你学业有成，事事顺利！';
      document.body.appendChild(alertBox);
      
      setTimeout(() => {
        alertBox.style.opacity = '0';
        alertBox.style.transition = 'opacity 0.3s ease';
        setTimeout(() => document.body.removeChild(alertBox), 300);
      }, 3000);
      
      clickCount = 0;
    }
  });
}
// 访问计数器 - 优化本地存储
let visitorCount = localStorage.getItem('visitorCount') || 0;
visitorCount++;
localStorage.setItem('visitorCount', visitorCount);
const visitorCountEl = document.getElementById('visitor-count');
if (visitorCountEl) {
  let current = 0;
  const timer = setInterval(() => {
    current++;
    visitorCountEl.textContent = current;
    if (current >= visitorCount) {
      clearInterval(timer);
    }
  }, 20);
}
// 回到顶部按钮与进度条 - 优化滚动监听
const backToTopBtn = document.querySelector('.back-to-top');
window.addEventListener('scroll', () => {
  if (window.scrollY > 300) {
    backToTopBtn.classList.add('active');
  } else {
    backToTopBtn.classList.remove('active');
  }
  const scrollHeight = document.body.scrollHeight - window.innerHeight;
  const scrollProgress = (window.scrollY / scrollHeight) * 100;
  document.getElementById('progress-bar').style.width = `${scrollProgress}%`;
});
// 技能图表初始化 - 网状雷达图
let skillsChart = null;
function initSkillsChart() {
  const ctx = document.getElementById('skills-chart').getContext('2d');
  if (skillsChart) {
    skillsChart.destroy();
  }
  skillsChart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['软件代码编写', 'UI设计基础', 'HTML基础', '短视频剪辑', '工具使用'],
      datasets: [{
        label: '技能熟练度',
        data: [75, 60, 65, 55, 80],
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: 'var(--primary)',
        pointBackgroundColor: 'var(--primary)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'var(--primary)',
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            font: { size: 11, family: 'Inter' },
            padding: 15,
            color: 'var(--text-gray)',
            boxWidth: 12
          }
        },
        tooltip: {
          callbacks: { label: (ctx) => `${ctx.label}: ${ctx.raw}%` },
          backgroundColor: 'var(--text-dark)',
          padding: 10,
          cornerRadius: 6,
          titleFont: { size: 12, weight: '600' },
          bodyFont: { size: 11 }
        }
      },
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: { stepSize: 20, color: 'var(--text-gray)', font: { size: 10 } },
          grid: { color: 'rgba(0, 0, 0, 0.05)' },
          angleLines: { color: 'rgba(0, 0, 0, 0.08)' },
          pointLabels: { color: 'var(--text-dark)', font: { size: 11, weight: '500' } }
        }
      },
      animation: { animateRotate: true, animateScale: true, duration: 1000 }
    }
  });
}
// 动态更新关闭按钮位置 - 兼容旧逻辑
function updateCloseBtnPosition(modalId) {
  const modalContent = document.querySelector(`#${modalId} .modal-content`);
  const closeBtn = document.querySelector(`#${modalId} .close-modal`);
  if (!modalContent || !closeBtn) return;
  const modalRect = modalContent.getBoundingClientRect();
  closeBtn.style.top = `${modalRect.top + 10}px`;
  closeBtn.style.right = `${window.innerWidth - modalRect.right + 10}px`;
}
// 窗口大小变化监听 - 优化防抖
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    document.querySelectorAll('.modal-overlay.active').forEach(modal => {
      updateCloseBtnPosition(modal.id);
    });
  }, 100);
});
// 页面加载完成初始化
window.addEventListener('load', () => {
  document.body.style.opacity = '1';
  document.body.style.transition = 'opacity 0.5s ease';
});
// 核心新增：腾讯问卷新窗口打开函数（不覆盖当前页面）
function openTencentSurvey() {
  const surveyUrl = 'https://wj.qq.com/s2/24102021/c843/';
  window.open(
    surveyUrl,
    'tencentSurveyWindow',
    'width=800,height=700,top=100,left=100'
  );
}
