const GameState = {
    IDLE: 'IDLE',
    READY: 'READY',
    PLAYING: 'PLAYING',
    VALIDATING: 'VALIDATING',
    GAMEOVER: 'GAMEOVER'
};

let currentState = GameState.IDLE;

function transitionTo(newState) {
    console.log(`State changing from ${currentState} to ${newState}`);
    currentState = newState;

    switch (newState) {
        case GameState.READY:
            startCountdown(); // 触发 3, 2, 1 动画
            break;
        case GameState.PLAYING:
            enableDragging(); // 激活 CSS/JS 拖拽监听
            startTimer();
            break;
        case GameState.VALIDATING:
            checkSpelling(); // 核心逻辑：比对字符串
            break;
        case GameState.GAMEOVER:
            showLeaderboard(); // 弹出排行榜
            break;
    }
}

// 获胜校验示例
function checkSpelling() {
    const currentAttempt = getCurrentDropzoneText(); // 获取当前槽位里的字母组合
    if (currentAttempt === targetWord) {
        handleSuccess();
    } else {
        handleFailure();
    }
}