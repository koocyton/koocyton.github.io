(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,5341,t=>{"use strict";var e=t.i(43476),a=t.i(15504);let l=`<div class="wrap">
    <h1>泉盛 UV-K5 / K1 刷机工具</h1>
    <p class="subtitle">Web Serial \xb7 备份校准 / 刷固件 / 恢复校准 / 备份配置 / 恢复配置 / 写频 / 刷字库 / 单边带补丁 / 旧版 K5</p>

    <div class="hint">
      <strong>使用说明</strong>
      <ol>
        <li>请使用 Chrome / Edge。点击各操作按钮时再连接串口，完成后会自动断开。</li>
        <li><strong>刷固件</strong>（K1/K5 V3 与旧版 K5 相同）：关机后按住 PTT，旋转开机旋钮进入刷机模式后再连接。</li>
        <li><strong>备份/恢复校准、刷字库、单边带补丁、备份/恢复配置、写频</strong>：正常开机进入使用界面后再连接（无需 BOOT）。</li>
        <li>建议先备份校准；固件与字库可远程获取，也可本地选择文件。</li>
        <li><strong>KOO 固件收音机 (中英文, 切换BK1080/SI4732改装，中文信道，网页写频，开机图片)</strong>
          <ul>
            <li><strong>F + 0</strong> 进入收音机模式，默认 FM</li>
            <li>收音机模式下，短按 <strong>F</strong> 切换 FM / AM</li>
            <li>收音机模式下，显示守听频道收到的频率</li>
            <li>收音机模式下，长按 <strong>EXIT</strong>，进入播放收音机同时对讲机双守听</li>
            <li>长按 <strong>F</strong> 进入单边带</li>
            <li>单边带下短按 <strong>F</strong> 切换 USB / LSB / CW</li>
            <li>短波下 <strong>M</strong> 切换 AGC / ATT / BW / STP 选项，侧键上下修改选项值</li>
            <li>按 <strong>*</strong> 向上搜索</li>
          </ul>
        </li>
      </ol>
    </div>

    <div class="tabs" role="tablist">
      <button type="button" class="flash-tab active" role="tab" aria-selected="true" data-tab="dump">备份校准</button>
      <button type="button" class="flash-tab" role="tab" aria-selected="false" data-tab="flash">K1/K5V3 刷固件</button>
      <button type="button" class="flash-tab" role="tab" aria-selected="false" data-tab="restore">恢复校准</button>
      <button type="button" class="flash-tab" role="tab" aria-selected="false" data-tab="backupCfg">备份配置</button>
      <button type="button" class="flash-tab" role="tab" aria-selected="false" data-tab="restoreCfg">恢复配置</button>
      <button type="button" class="flash-tab" role="tab" aria-selected="false" data-tab="writefreq">写频</button>
      <button type="button" class="flash-tab" role="tab" aria-selected="false" data-tab="font">刷字库</button>
      <button type="button" class="flash-tab" role="tab" aria-selected="false" data-tab="ssb">K1/K5V3 单边带补丁</button>
      <button type="button" class="flash-tab" role="tab" aria-selected="false" data-tab="v1flash">旧版 K5 刷固件</button>
    </div>

    <div id="dumpPanel" class="tab-panel active" role="tabpanel">
      <p class="panel-desc">原厂固件刷机前备份一次即可。正常开机进入使用界面后导出 512 字节校准数据。</p>
      <div class="row">
        <button type="button" id="dumpBtn" class="primary">导出校准数据</button>
      </div>
    </div>

    <div id="flashPanel" class="tab-panel" role="tabpanel">
      <p class="panel-desc">进入 BOOT 刷机模式后刷入固件。支持远程获取或本地选择 .bin。</p>
      <div class="row">
        <button type="button" id="fetchFirmwareBtn">远程获取</button>
        <label class="file-btn" for="firmwareFile">本地选择</label>
        <input type="file" id="firmwareFile" accept=".bin,application/octet-stream" />
        <span class="file-name" id="firmwareFileName">未选择文件</span>
      </div>
      <div class="row">
        <button type="button" id="flashBtn" class="primary" disabled>刷入固件</button>
      </div>
    </div>

    <div id="restorePanel" class="tab-panel" role="tabpanel">
      <p class="panel-desc">使用原厂初始备份恢复校准。正常开机后连接；写入后设备会重启。</p>
      <div class="row">
        <label class="file-btn" for="calibFile">选择校准文件</label>
        <input type="file" id="calibFile" accept=".dat,.bin,application/octet-stream" />
        <span class="file-name" id="calibFileName">未选择文件</span>
      </div>
      <div class="row">
        <button type="button" id="restoreBtn" class="primary" disabled>恢复校准数据</button>
      </div>
    </div>

    <div id="backupCfgPanel" class="tab-panel" role="tabpanel">
      <p class="panel-desc">备份菜单与按键等配置，便于恢复出厂后快速还原。</p>
      <div class="row">
        <button type="button" id="backupCfgBtn" class="primary">导出配置数据</button>
      </div>
    </div>

    <div id="restoreCfgPanel" class="tab-panel" role="tabpanel">
      <p class="panel-desc">恢复此前备份的配置。正常开机后连接；写入后设备会重启。</p>
      <div class="row">
        <label class="file-btn" for="cfgBackupFile">选择配置文件</label>
        <input type="file" id="cfgBackupFile" accept=".dat,.bin,application/octet-stream" />
        <span class="file-name" id="cfgBackupFileName">未选择文件</span>
      </div>
      <div class="row">
        <button type="button" id="restoreCfgBtn" class="primary" disabled>恢复配置数据</button>
      </div>
    </div>

    <div id="writefreqPanel" class="tab-panel" role="tabpanel">
      <p class="panel-desc">读取或写入 MR 信道（前 1024 槽）。完成后自动断开串口。清空接收频率的行会在写入时擦除对应槽。</p>
      <div class="writefreq-toolbar">
        <button type="button" id="writefreqReadBtn">从设备读取</button>
        <button type="button" id="writefreqWriteBtn" class="primary">写入设备</button>
      </div>
      <div id="writefreqValidation" class="writefreq-validation"></div>
      <div class="writefreq-table-wrap">
        <table id="writefreqTable">
          <thead>
            <tr>
              <th></th>
              <th>信道</th>
              <th>信道名</th>
              <th>接收频率 MHz</th>
              <th>功率</th>
              <th>收 DCS</th>
              <th>收 CTCSS</th>
              <th>发 DCS</th>
              <th>发 CTCSS</th>
              <th>频差方向</th>
              <th>频差 MHz</th>
              <th>调制</th>
              <th>步进</th>
              <th>扫描列表</th>
              <th></th>
            </tr>
          </thead>
          <tbody id="writefreqTbody"></tbody>
        </table>
      </div>
      <div class="writefreq-pager">
        <button type="button" id="writefreqPagePrev">上一页</button>
        <span id="writefreqPageInfo">—</span>
        <button type="button" id="writefreqPageNext">下一页</button>
      </div>
    </div>

    <div id="fontPanel" class="tab-panel" role="tabpanel">
      <p class="panel-desc">将中文字库刷入 SPI Flash。正常开机后连接；请使用与固件匹配的字库，勿混用。</p>
      <div class="row">
        <button type="button" id="fetchFontBtn">远程获取</button>
        <label class="file-btn" for="fontFile">本地选择</label>
        <input type="file" id="fontFile" accept=".bin,application/octet-stream" />
        <span class="file-name" id="fontFileName">未选择文件</span>
      </div>
      <div class="row">
        <button type="button" id="fontFlashBtn" class="primary" disabled>刷入字库</button>
      </div>
    </div>

    <div id="ssbPanel" class="tab-panel" role="tabpanel">
      <p class="panel-desc">将 Si4732 单边带 patch 写入 SPI Flash（基址 0x058000，与字库 0x024000 不重叠）。正常开机后连接；请使用与固件匹配的补丁。</p>
      <div class="row">
        <button type="button" id="fetchSsbBtn">远程获取</button>
        <label class="file-btn" for="ssbFile">本地选择</label>
        <input type="file" id="ssbFile" accept=".bin,application/octet-stream" />
        <span class="file-name" id="ssbFileName">未选择文件</span>
      </div>
      <div class="row">
        <button type="button" id="ssbFlashBtn" class="primary" disabled>刷入补丁</button>
      </div>
    </div>

    <div id="v1flashPanel" class="tab-panel" role="tabpanel">
      <p class="panel-desc">旧版 UV-K5 / K6（非 K5 V3 / K1）刷入固件。协议与 <a href="https://k5.vicicode.com/#/tool/flash" target="_blank" rel="noopener noreferrer">K5Web 默认 Official</a> 一致。进入 BOOT 刷机模式后连接；支持远程获取或本地选择 packed / raw .bin。</p>
      <div class="row">
        <button type="button" id="fetchV1FirmwareBtn">远程获取 F4HWN SI4732 packed</button>
        <label class="file-btn" for="v1FirmwareFile">本地选择</label>
        <input type="file" id="v1FirmwareFile" accept=".bin,application/octet-stream" />
        <span class="file-name" id="v1FirmwareFileName">未选择文件</span>
      </div>
      <div class="row">
        <button type="button" id="v1FlashBtn" class="primary" disabled>刷入固件</button>
      </div>
    </div>

    <div id="progressContainer" class="progress" hidden>
      <div class="progress-track"><div id="progressFill" class="progress-fill"></div></div>
      <span id="progressLabel" class="progress-label">0%</span>
    </div>

    <div class="log-toolbar">
      <span>日志</span>
      <button type="button" id="logToggle">隐藏日志</button>
    </div>
    <div id="log"></div>

    <p class="refs">
      协议参考
      <a href="https://armel.github.io/uvtools2/" target="_blank" rel="noopener noreferrer">UVTools2</a>
      \xb7
      <a href="https://ethanyan6.github.io/Dondji/" target="_blank" rel="noopener noreferrer">Dondji</a>
      \xb7
      <a href="https://k5.vicicode.com/#/tool/flash" target="_blank" rel="noopener noreferrer">K5Web</a>
    </p>
  </div>`;function s(){return(0,a.useEffect)(()=>{let t=!1;window.__quanshengFlashToolsBooted=!1;let e="quansheng-flashtools-css";if(!document.getElementById(e)){let t=document.createElement("link");t.id=e,t.rel="stylesheet",t.href="/quansheng-flashtools/tool.css",document.head.appendChild(t)}let a="quansheng-flashtools-app-js",l=document.getElementById(a);l&&l.remove();let s=document.createElement("script");return s.id=a,s.src=`/quansheng-flashtools/app.js?v=${Date.now()}`,s.onload=()=>{t||window.bootQuanshengFlashTools?.()},s.onerror=()=>{t||console.error("[quansheng-flashtools] failed to load app.js")},document.body.appendChild(s),()=>{t=!0,window.__quanshengFlashToolsBooted=!1;let e=document.getElementById(a);e&&e.remove()}},[]),(0,e.jsx)("div",{className:"quansheng-flashtools-host",dangerouslySetInnerHTML:{__html:l}})}t.s(["default",()=>s])}]);