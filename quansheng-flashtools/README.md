# 泉盛 UV-K1 / UV-K5(K6) V3 刷机工具

基于 [UVTools2](https://armel.github.io/uvtools2/) / [Dondji](https://ethanyan6.github.io/Dondji/) Web Serial 协议。

## 功能

- 备份校准 / 恢复校准
- 刷固件（远程或本地）
- 刷字库（远程或本地）
- 备份配置 / 恢复配置
- 写频

## 远程资源（Release 20260508）

- 固件：https://github.com/koocyton/armel-uv-k5-firmware-custom/releases/download/20260508/k18-f4hwn-5.8.0-cn.radio.bin
- 字库：https://github.com/koocyton/armel-uv-k5-firmware-custom/releases/download/20260508/cn_font.bin

浏览器拉取 GitHub Release 可能受 CORS 限制；页面会优先使用本目录 `firmware/`、`font/` 同源镜像。

## 使用注意

- 仅支持 Chrome / Edge / Opera（或 Firefox 151+）桌面版
- **刷固件**需按住 PTT 开机进入 BOOT 模式
- 备份/恢复校准、刷字库、备份/恢复配置、写频：正常开机后操作
- 每次操作点击时连接串口，完成后自动断开
