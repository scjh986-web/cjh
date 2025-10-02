// national-track.js - 修复版极致轨迹彩蛋（功能全生效）
document.addEventListener('DOMContentLoaded', function() {
    // 基础配置（简化参数，确保易生效）
    const config = {
        maxTrackCount: 8,    // 最大轨迹数量（避免性能问题）
        gravity: 0.1,        // 重力参数（放大值，确保明显下落）
        color: {
            red: 'rgba(231, 76, 60, 0.9)',
            gold: 'rgba(255, 215, 0, 0.9)',
            lightRed: 'rgba(231, 76, 60, 0.4)',
            lightGold: 'rgba(255, 215, 0, 0.4)',
            glow: 'rgba(255, 215, 0, 0.3)'
        },
        collisionDelay: 500  // 碰撞反馈时长
    };

    let isTracking = false;
    let trackList = [];     // 轨迹元素列表
    let lastPos = { x: 0, y: 0 }; // 上一位置（计算速度）

    // 1. 注入样式（简化选择器，确保生效）
    injectBaseStyle();

    // 2. 绑定设备事件（PC+移动端，明确触发逻辑）
    bindDeviceEvents();

    // 3. 启动物理更新（用setInterval确保稳定执行）
    setInterval(updatePhysics, 16); // 约60fps，匹配屏幕刷新率

    // -------------------------- 核心功能（全修复） --------------------------
    // 1. 注入基础样式（避免复杂依赖，确保所有页面生效）
    function injectBaseStyle() {
        const style = document.createElement('style');
        style.textContent = `
            /* 核心轨迹点（五角星）- 物理动效+碰撞反馈 */
            .track-core {
                position: fixed;
                pointer-events: none;
                z-index: 999;
                font-size: 22px;
                opacity: 1;
            }
            /* 碰撞动画（确保明显可见） */
            .track-core.collide {
                animation: collide 0.3s ease;
            }
            @keyframes collide {
                0% { transform: scale(1); }
                50% { transform: scale(1.3) rotate(15deg); color: ${config.color.gold}; }
                100% { transform: scale(1); }
            }

            /* 拖尾（随速度变化，确保明显） */
            .track-trail {
                position: fixed;
                pointer-events: none;
                z-index: 998;
                height: 3px;
                border-radius: 2px;
                opacity: 0.8;
            }

            /* 光晕（确保暗/亮页都可见） */
            .track-glow {
                position: fixed;
                pointer-events: none;
                z-index: 997;
                border-radius: 50%;
                filter: blur(15px);
                background: ${config.color.glow};
                opacity: 0.7;
            }

            /* 碰撞时元素反馈（确保边框变化明显） */
            .section-card.collide, .work-card.collide, .back-btn.collide {
                border-color: ${config.color.red} !important;
                box-shadow: 0 0 8px rgba(231, 76, 60, 0.3) !important;
            }
        `;
        document.head.appendChild(style);
    }

    // 2. 绑定设备事件（确保PC/移动端功能都触发）
    function bindDeviceEvents() {
        // PC端：鼠标移动触发（带速度判断）
        document.addEventListener('mousemove', (e) => {
            if (isInteractElement(e.target)) return;
            
            const speed = getMoveSpeed(e.clientX, e.clientY);
            // 速度适配：慢滑（<5px/帧）密生成，快滑（>15px/帧）疏生成
            if ((speed < 5 && !isTracking) || (speed >=5 && speed <15 && Math.random() > 0.2) || (speed >=15 && Math.random() > 0.6)) {
                createTrack(e.clientX, e.clientY, speed);
                lastPos = { x: e.clientX, y: e.clientY };
            }
            setTrackInterval(speed);
        });

        // 移动端：触摸滑动触发（带压力感应）
        let touchPressure = 0.5; // 默认压力值
        document.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            lastPos = { x: touch.clientX, y: touch.clientY };
            // 读取触摸压力（兼容有压力传感器的设备）
            touchPressure = e.touches[0].force || 0.5;
        });
        document.addEventListener('touchmove', (e) => {
            e.preventDefault(); // 仅在轨迹生成时阻止，不影响整体滑动（修复前遗漏）
            const touch = e.touches[0];
            if (isInteractElement(e.target)) return;
            
            const speed = getMoveSpeed(touch.clientX, touch.clientY);
            // 压力适配：压力越大，轨迹越亮
            const brightness = Math.min(1, touchPressure + 0.4);
            createTrack(touch.clientX, touch.clientY, speed, brightness);
            lastPos = { x: touch.clientX, y: touch.clientY };
            setTrackInterval(speed);
        });
    }

    // 3. 创建轨迹（确保三层结构都生成）
    function createTrack(x, y, speed, brightness = 1) {
        // 限制轨迹数量（避免堆积）
        if (trackList.length >= config.maxTrackCount * 3) {
            removeOldestTrack();
        }

        // 1. 核心五角星（带物理参数）
        const core = document.createElement('div');
        core.className = 'track-core';
        core.textContent = '★';
        core.style.left = `${x - 11}px`;
        core.style.top = `${y - 11}px`;
        core.style.color = Math.random() > 0.5 ? config.color.red : config.color.gold;
        core.style.opacity = brightness; // 压力控制亮度
        // 物理参数（确保重力生效）
        core.physics = {
            vx: (Math.random() - 0.5) * 0.8, // 水平速度（明显偏移）
            vy: 0,                           // 垂直速度（受重力影响）
            rotation: (Math.random() - 0.5) * 3 // 旋转速度（明显旋转）
        };
        document.body.appendChild(core);
        trackList.push({ type: 'core', el: core });

        // 2. 拖尾（随速度变化长度，确保明显）
        const trailLength = Math.min(40, Math.max(15, speed * 0.8)); // 放大速度影响
        const trail = document.createElement('div');
        trail.className = 'track-trail';
        trail.style.width = `${trailLength}px`;
        trail.style.backgroundColor = Math.random() > 0.5 ? config.color.lightRed : config.color.lightGold;
        // 拖尾方向：与运动方向一致（确保跟随）
        const angle = Math.atan2(y - lastPos.y, x - lastPos.x);
        trail.style.left = `${x - trailLength * Math.cos(angle) - trailLength/2}px`;
        trail.style.top = `${y - trailLength * Math.sin(angle) - 1.5}px`;
        trail.style.transform = `rotate(${angle * 180 / Math.PI}deg)`;
        trail.style.opacity = brightness * 0.8;
        document.body.appendChild(trail);
        trackList.push({ type: 'trail', el: trail });

        // 3. 光晕（确保大小明显）
        const glowSize = Math.random() * 15 + 40; // 放大光晕尺寸
        const glow = document.createElement('div');
        glow.className = 'track-glow';
        glow.style.width = `${glowSize}px`;
        glow.style.height = `${glowSize}px`;
        glow.style.left = `${x - glowSize/2}px`;
        glow.style.top = `${y - glowSize/2}px`;
        glow.style.opacity = brightness * 0.7;
        document.body.appendChild(glow);
        trackList.push({ type: 'glow', el: glow });

        // 碰撞检测（确保触发反馈）
        checkCollision(core, x, y);
    }

    // 4. 物理更新（确保重力、旋转生效）
    function updatePhysics() {
        trackList.forEach((item, index) => {
            const el = item.el;
            if (!el) {
                trackList.splice(index, 1);
                return;
            }

            if (item.type === 'core') {
                // 应用重力（放大效果，确保明显下落）
                el.physics.vy += config.gravity;
                // 更新位置（确保移动可见）
                const newX = parseFloat(el.style.left) + el.physics.vx;
                const newY = parseFloat(el.style.top) + el.physics.vy;
                el.style.left = `${newX}px`;
                el.style.top = `${newY}px`;
                // 更新旋转（确保旋转明显）
                const currentRotate = parseFloat(getComputedStyle(el).transform.match(/rotate\(([^)]+)\)/)?.[1] || 0);
                el.style.transform = `rotate(${currentRotate + el.physics.rotation}deg)`;

                // 边界检测：超出屏幕删除（避免残留）
                if (newX < -100 || newX > window.innerWidth + 100 || newY > window.innerHeight + 100) {
                    removeTrack(index);
                }
            } else if (item.type === 'trail') {
                // 拖尾逐渐透明（确保消失节奏合理）
                const currentOpacity = parseFloat(el.style.opacity) || 0.8;
                el.style.opacity = `${currentOpacity - 0.015}`; // 放大透明速度
                if (currentOpacity < 0.1) removeTrack(index);
            } else if (item.type === 'glow') {
                // 光晕扩散+透明（确保效果明显）
                const currentScale = parseFloat(getComputedStyle(el).transform.match(/scale\(([^)]+)\)/)?.[1] || 1);
                el.style.transform = `scale(${currentScale + 0.01})`; // 放大扩散速度
                el.style.opacity = `${parseFloat(el.style.opacity) - 0.012}`; // 放大透明速度
                if (parseFloat(el.style.opacity) < 0.05) removeTrack(index);
            }
        });
    }

    // 5. 碰撞检测（确保反馈明显）
    function checkCollision(coreEl, x, y) {
        // 明确检测的元素（确保覆盖所有交互组件）
        const interactEls = document.querySelectorAll('.section-card, .work-card, .back-btn, .voice-btn, .suggest-jump-btn');
        interactEls.forEach(el => {
            const rect = el.getBoundingClientRect();
            // 扩大碰撞范围，确保易触发
            if (x > rect.left - 10 && x < rect.right + 10 && y > rect.top - 10 && y < rect.bottom + 10) {
                // 五角星碰撞动画（确保触发）
                coreEl.classList.add('collide');
                setTimeout(() => coreEl.classList.remove('collide'), config.collisionDelay);
                // 元素边框反馈（确保明显）
                el.classList.add('collide');
                setTimeout(() => el.classList.remove('collide'), config.collisionDelay);
            }
        });
    }

    // -------------------------- 工具函数（确保稳定） --------------------------
    // 计算移动速度（确保速度判断准确）
    function getMoveSpeed(currentX, currentY) {
        const dx = currentX - lastPos.x;
        const dy = currentY - lastPos.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // 设置轨迹生成间隔（确保不密集）
    function setTrackInterval(speed) {
        if (isTracking) return;
        isTracking = true;
        // 放大间隔差异，确保快滑疏、慢滑密
        const interval = speed < 5 ? 40 : speed < 15 ? 80 : 120;
        setTimeout(() => isTracking = false, interval);
    }

    // 判断是否为交互元素（避免干扰操作）
    function isInteractElement(target) {
        return target.closest('button, input, textarea, select, .suggest-form');
    }

    // 移除最旧轨迹（避免堆积）
    function removeOldestTrack() {
        const oldest = trackList.shift();
        if (oldest?.el) oldest.el.remove();
    }

    // 移除指定轨迹（避免残留）
    function removeTrack(index) {
        const track = trackList[index];
        if (track?.el) track.el.remove();
        trackList.splice(index, 1);
    }
});