export class Player {
	constructor() {
		this.button = document.getElementById("wordBtn");

		// 使用可选链 (?.) 或 if 判断
		if (this.button) {
			this.button.addEventListener("click", () => {
				this.onWordClick();
			});
		} else {
			console.error("找不到按钮元素，请检查选择器或加载时机。");
		}
	}

	onWordClick() {
		console.log("Player：按钮被点击");
	}
}

