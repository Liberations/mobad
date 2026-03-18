"auto";

auto.waitFor();

var running = false;
var workerThread = null;

var window = floaty.window(
	<frame>
		<button id="toggle" text="开始" w="80" h="40" bg="#AA1E88E5" />
	</frame>
);

window.setPosition(100, 300);
window.setAdjustEnabled(false);

function doClick(node) {
	if (!node) return false;
	if (node.click()) return true;
	var rect = node.bounds();
	return click(rect.centerX(), rect.centerY());
}

function adLoop() {
	while (running) {
		var adBtn = className("android.widget.Button")
			.clickable(true)
			.descContains("+5")
			.findOne(5000);

		if (!running) break;

		if (adBtn) {
			log("找到+5按钮，准备点击");
			doClick(adBtn);

			sleep(1000);
			if (!running) break;

			var showBtn = className("android.widget.Button")
				.clickable(true)
				.descContains("Watch Ad")
				.findOne(5000);

			if (showBtn) {
				log("找到观看广告按钮，准备点击");
				doClick(showBtn);
			} else {
				log("未找到观看广告按钮，1秒后重试");
				sleep(1000);
				continue;
			}
			for (var i = 0; i < 30 && running; i++) {
                if (!running) break;
                log("观看中... " + (i + 1) + "秒");
				sleep(1000);
			}
			sleep(2000);
            log("广告观看完成，返回主界面");
			back();
		} else {
			log("未找到+5按钮，1秒后重试");
			sleep(1000);
		}
	}
}

function startTask() {
	if (running) return;
	running = true;
	ui.run(function () {
		window.toggle.setText("停止");
		window.toggle.attr("bg", "#AAE53935");
	});

	workerThread = threads.start(function () {
		try {
			adLoop();
		} catch (e) {
			log("运行异常: " + e);
		} finally {
			running = false;
			ui.run(function () {
				window.toggle.setText("开始");
				window.toggle.attr("bg", "#AA1E88E5");
			});
		}
	});
}

function stopTask() {
	running = false;
	if (workerThread && workerThread.isAlive()) {
		workerThread.interrupt();
	}
	workerThread = null;
	ui.run(function () {
		window.toggle.setText("开始");
		window.toggle.attr("bg", "#AA1E88E5");
	});
}

window.toggle.click(function () {
	if (running) {
		stopTask();
		toast("已停止");
	} else {
		startTask();
		toast("已启动");
	}
});

events.on("exit", function () {
	stopTask();
	window.close();
});

toast("悬浮窗已就绪，点击可开始/停止");
setInterval(function () {}, 1000);