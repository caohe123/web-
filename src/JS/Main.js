import { Player } from "./Player.js"
let player1 = new Player();
let player2 = new Player();

// CONFIG 建议放在类外面作为全局配置
const CONFIG = {
    TILE_SIZE: 32,
    WIDTH: 32, 
    HEIGHT: 22,
    P1_COLOR: '#4E72B8',
    P2_COLOR: '#B84E4E',
};

class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error("找不到Canvas元素！请检查HTML中是否有id为" + canvasId + "的标签");
            return;
        }
        this.ctx = this.canvas.getContext('2d');
        this.targetWord = "APPLE";
        
        // 直接在这里初始化，或者把顶部的 player 实例传进来
        this.p1 = { x: 1, y: 1, color: CONFIG.P1_COLOR, collected: "", score: 0 };
        this.p2 = { x: 18, y: 13, color: CONFIG.P2_COLOR, collected: "", score: 0 };
        
        this.letters = [
            { char: 'A', x: 5, y: 5 },
            { char: 'P', x: 10, y: 3 },
            { char: 'P', x: 12, y: 8 },
            { char: 'L', x: 2, y: 10 },
            { char: 'E', x: 15, y: 5 },
        ];

        this.init();
    }

    async init() {
        this.canvas.width = CONFIG.WIDTH * CONFIG.TILE_SIZE;
        this.canvas.height = CONFIG.HEIGHT * CONFIG.TILE_SIZE;
        this.ctx.imageSmoothingEnabled = false;

        // 关键：等待像素字体加载完毕再开始游戏循环
        await document.fonts.ready; 
        
        window.addEventListener('keydown', (e) => this.handleInput(e));
        this.gameLoop();
    }

    // 补全缺失的绘制网格方法
    drawGrid() {
        this.ctx.strokeStyle = "rgba(0,0,0, 0.05)";
        this.ctx.beginPath();
        for (let x = 0; x <= CONFIG.WIDTH; x++) {
            this.ctx.moveTo(x * CONFIG.TILE_SIZE, 0);
            this.ctx.lineTo(x * CONFIG.TILE_SIZE, this.canvas.height);
        }
        for (let y = 0; y <= CONFIG.HEIGHT; y++) {
            this.ctx.moveTo(0, y * CONFIG.TILE_SIZE);
            this.ctx.lineTo(this.canvas.width, y * CONFIG.TILE_SIZE);
        }
        this.ctx.stroke();
    }

    handleInput(e) {
        // P1: WASD (逻辑不变)
        if (e.code === 'KeyW' && this.p1.y > 0) this.p1.y--;
        if (e.code === 'KeyS' && this.p1.y < CONFIG.HEIGHT - 1) this.p1.y++;
        if (e.code === 'KeyA' && this.p1.x > 0) this.p1.x--;
        if (e.code === 'KeyD' && this.p1.x < CONFIG.WIDTH - 1) this.p1.x++;

        // P2: 方向键 (逻辑不变)
        if (e.code === 'ArrowUp' && this.p2.y > 0) this.p2.y--;
        if (e.code === 'ArrowDown' && this.p2.y < CONFIG.HEIGHT - 1) this.p2.y++;
        if (e.code === 'ArrowLeft' && this.p2.x > 0) this.p2.x--;
        if (e.code === 'ArrowRight' && this.p2.x < CONFIG.WIDTH - 1) this.p2.x++;
        
        this.checkCollection();
    }

    checkCollection() {
        [this.p1, this.p2].forEach(p => {
            // 注意：因为字母是数组，删除了元素会导致索引变化，建议倒着遍历
            for (let i = this.letters.length - 1; i >= 0; i--) {
                let l = this.letters[i];
                if (l.x === p.x && l.y === p.y) {
                    this.onCollect(p, i);
                }
            }
        });
    }

    onCollect(player, letterIndex) {
        const letter = this.letters[letterIndex].char;
        const nextCharNeeded = this.targetWord[player.collected.length];
        
        if (letter === nextCharNeeded) {
            player.collected += letter;
            this.letters.splice(letterIndex, 1);
            console.log(`玩家吃到字母 ${letter}, 当前进度: ${player.collected}`);
            
            if (player.collected === this.targetWord) {
                alert("游戏结束！胜者拼出了 " + this.targetWord);
                location.reload(); // 简单重置
            }
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawGrid();

        // 设置字体样式，对应 CSS 的 32px
        this.ctx.font = `20px "Press Start 2P"`; 
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";

        this.letters.forEach(l => {
            const posX = l.x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
            const posY = l.y * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;

            // 1. 绘制像素阴影 (对应 CSS .pixel-shadow: 3px 3px 0 #111)
            this.ctx.fillStyle = "#111";
            this.ctx.fillText(l.char, posX + 3, posY + 3);

            // 2. 绘制主体文字
            this.ctx.fillStyle = "#FFFFFF";
            this.ctx.fillText(l.char, posX, posY);
        });

        this.drawPlayer(this.p1);
        this.drawPlayer(this.p2);
    }

    // 在 draw 方法末尾添加 UI 渲染
    drawUI() {
        this.ctx.save(); // 保存当前状态
        
        // 设置一个小一点的字体用于状态栏
        this.ctx.font = `12px "Press Start 2P"`;
        
        // P1 进度
        this.ctx.fillStyle = CONFIG.P1_COLOR;
        this.ctx.fillText(`P1: ${this.p1.collected}`, 80, 20);
        
        // P2 进度
        this.ctx.fillStyle = CONFIG.P2_COLOR;
        this.ctx.fillText(`P2: ${this.p2.collected}`, this.canvas.width - 80, 20);
        
        // 屏幕中间显示目标单词
        this.ctx.fillStyle = "#FFF";
        this.ctx.font = `16px "Press Start 2P"`;
        this.ctx.fillText(`TARGET: ${this.targetWord}`, this.canvas.width/2, 20);
        
        this.ctx.restore(); // 恢复状态
    }

    drawPlayer(p) {
        this.ctx.fillStyle = p.color;
        // 增加一点内边距，让方块看起来像在格子里移动
        this.ctx.fillRect(
            p.x * CONFIG.TILE_SIZE + 4, 
            p.y * CONFIG.TILE_SIZE + 4, 
            CONFIG.TILE_SIZE - 8, 
            CONFIG.TILE_SIZE - 8
        );
    }

    gameLoop() {
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// 只需要这一行，构造函数会自动触发 init
const game = new Game('gameCanvas');

game.draw();
game.drawPlayer(player1);
game.drawPlayer(player2);