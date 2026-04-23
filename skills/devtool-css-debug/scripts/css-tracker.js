/**
 * DevTools CSS Tracker
 * 两次快照对比，只输出变更，节省 Token。
 *
 * 优化：
 *  1. modified 只输出属性级 diff（props），不输出整条 cssText
 *  2. 跨域 / CDN sheet 在 getDiff 时直接跳过（无法写回）
 *  3. 单 sheet 变更规则数超过 MAX_RULES_PER_SHEET 时标记 skipped，不展开
 *  4. Vue scoped selector（data-v-xxxxxx）自动附 sourceFile（开发环境）
 *  5. Tailwind utility class 自动识别，标记 type:"tailwind"，不写回 CSS 文件
 *
 * 典型顺序：注入本脚本 → runLoadAndUrlGates(targetUrl) → init() →（用户改样式）→
 *   assertUrlMatchesTarget(targetUrl) → getDiff()
 * 本文件末尾不自动 init，由调用方在门禁通过后执行。
 */
window.__cssTracker = {
  _css:    new Map(),  // sheetKey → { href, rules[] }
  _inline: new Map(),  // elKey   → { el, style }

  // 单 sheet 变更规则数上限；超过视为框架 sheet 整体替换，跳过
  MAX_RULES_PER_SHEET: 50,

  // ── 门禁：加载 + URL ──────────────────────────────────────
  _normUrl(u) {
    const t = String(u).trim();
    try {
      const url = /^https?:\/\//i.test(t) ? new URL(t) : new URL(t, document.baseURI);
      return url.origin + url.pathname + url.hash;
    } catch (e) {
      return t;
    }
  },

  _nextDoubleRaf(done) {
    requestAnimationFrame(() => requestAnimationFrame(() => done()));
  },

  async _waitForLoadAndPaint() {
    await new Promise((resolve) => {
      if (document.readyState === "complete") {
        this._nextDoubleRaf(resolve);
      } else {
        addEventListener("load", () => this._nextDoubleRaf(resolve), { once: true });
      }
    });
  },

  _urlCheckResult(targetUrl) {
    const want = this._normUrl(targetUrl);
    const cur  = this._normUrl(location.href);
    if (cur !== want) {
      return { ok: false, gate: "abort", current: cur, expected: want, reason: "url_mismatch" };
    }
    return { ok: true, gate: "ok" };
  },

  async runLoadAndUrlGates(targetUrl) {
    await this._waitForLoadAndPaint();
    return this._urlCheckResult(targetUrl);
  },

  assertUrlMatchesTarget(targetUrl) {
    return this._urlCheckResult(targetUrl);
  },

  // ── 判断是否为外部 / CDN sheet（无法写回，跳过）──────────
  _isRemoteSheet(sheet) {
    if (!sheet.href) return false;                          // inline <style>
    try {
      return new URL(sheet.href).origin !== location.origin; // 跨域 = CDN
    } catch (e) {
      return false;
    }
  },

  // ── 1. 全量快照 ───────────────────────────────────────────
  init() {
    this._css.clear();
    this._inline.clear();

    Array.from(document.styleSheets).forEach(sheet => {
      if (this._isRemoteSheet(sheet)) return;             // CDN sheet 不快照
      try {
        this._css.set(this._sheetKey(sheet), {
          href:  sheet.href || "Inline",
          rules: Array.from(sheet.cssRules).map(r => r.cssText)
        });
      } catch (e) { /* 跨域跳过 */ }
    });

    document.querySelectorAll("[style]").forEach(el => {
      this._inline.set(this._elKey(el), {
        label: this._elLabel(el),
        style: el.getAttribute("style"),
        class: this._elClass(el)           // 记录 baseline class，用于 Tailwind diff
      });
    });

    return `Baseline: ${this._css.size} sheets, ${this._inline.size} inline.`;
  },

  // ── 2. 增量对比 ───────────────────────────────────────────
  getDiff() {
    const out = { sheets: [], inline: [] };

    Array.from(document.styleSheets).forEach(sheet => {
      if (this._isRemoteSheet(sheet)) return;             // CDN sheet 跳过

      const key = this._sheetKey(sheet);
      let cur;
      try { cur = Array.from(sheet.cssRules).map(r => r.cssText); }
      catch (e) { return; }

      const old = (this._css.get(key) || {}).rules || [];
      if (JSON.stringify(cur) === JSON.stringify(old)) return;

      const oldMap = new Map(old.map(r => [this._sel(r), r]));
      const curMap = new Map(cur.map(r => [this._sel(r), r]));
      const added = [], modified = [], removed = [];

      curMap.forEach((rule, sel) => {
        if (!oldMap.has(sel)) {
          const addedEntry = { sel };
          if (this._isTailwindSel(sel)) {
            addedEntry.type = "tailwind";
            addedEntry.className = sel.slice(1);
          } else {
            const sf = this._vueSourceFile(sel);
            if (sf) addedEntry.sourceFile = sf;
          }
          added.push(addedEntry);                        // added：selector + 可选 meta
        } else if (oldMap.get(sel) !== rule) {
          const entry = {
            sel,
            props: this._propDiff(oldMap.get(sel), rule)
          };
          if (this._isTailwindSel(sel)) {
            entry.type = "tailwind";           // Tailwind utility，不写回 CSS 文件
            entry.className = sel.slice(1);    // 去掉前导 "."
          } else {
            const sf = this._vueSourceFile(sel);
            if (sf) entry.sourceFile = sf;     // Vue scoped，附源文件路径
          }
          modified.push(entry);
        }
      });
      oldMap.forEach((rule, sel) => {
        if (!curMap.has(sel)) removed.push(sel);         // removed：只记 selector
      });

      const totalChanges = added.length + modified.length + removed.length;

      if (!totalChanges) return;

      // 变更规则数超限 → 标记 skipped，不展开（框架 sheet 整体替换）
      if (totalChanges > this.MAX_RULES_PER_SHEET) {
        out.sheets.push({
          href: sheet.href || "Inline",
          skipped: true,
          reason: "too_many_changes",
          count: totalChanges
        });
        return;
      }

      const entry = { href: sheet.href || "Inline", modified };
      if (added.length)   entry.added   = added;
      if (removed.length) entry.removed = removed;
      out.sheets.push(entry);
    });

    // inline style diff
    const seenKeys = new Set();
    document.querySelectorAll("[style]").forEach(el => {
      const key   = this._elKey(el);
      const label = this._elLabel(el);
      const cur   = el.getAttribute("style") || "";
      seenKeys.add(key);

      const snap = this._inline.get(key);
      if (!snap) {
        out.inline.push({ el: label, added: cur, ...this._inlineMeta(el) });
      } else if (snap.style !== cur) {
        const entry = { el: label, props: this._inlinePropDiff(snap.style, cur) };
        // class 变化说明可能是 Tailwind，附上 old/new class 供 Step 4 判断
        const curClass = this._elClass(el);
        if (curClass !== snap.class) {
          entry.classChange = { old: snap.class ?? null, new: curClass };
        }
        Object.assign(entry, this._inlineMeta(el));
        out.inline.push(entry);
      }
    });
    this._inline.forEach((snap, key) => {
      if (!seenKeys.has(key))
        out.inline.push({ el: snap.label, removed: true });
    });

    return out;
  },

  // ── 属性级 diff（sheet rule）────────────────────────────
  // 返回 { propName: [oldVal|null, newVal|null] }，null 表示不存在
  _propDiff(oldRule, newRule) {
    const oldProps = this._parseProps(oldRule);
    const newProps = this._parseProps(newRule);
    const diff = {};
    const keys = new Set([...Object.keys(oldProps), ...Object.keys(newProps)]);
    keys.forEach(k => {
      const o = oldProps[k] ?? null;
      const n = newProps[k] ?? null;
      if (o !== n) diff[k] = [o, n];
    });
    return diff;
  },

  // 属性级 diff（inline style 字符串）
  _inlinePropDiff(oldStyle, newStyle) {
    return this._propDiff(`__{${oldStyle}}`, `__{${newStyle}}`);
  },

  // inline 条目附加 meta
  // 有 data-v-xxx → 直接查 __vueParentComponent.__file（A 方案）
  // 无 data-v-xxx → 附 routeHint 供 agent 从 route 推组件（B 方案）
  _inlineMeta(el) {
    const meta = {};
    const hasScoped = Array.from(el.attributes).some(a => /^data-v-/.test(a.name));
    if (hasScoped) {
      const sf = this._elSourceFile(el);
      if (sf) meta.sourceFile = sf;
    } else {
      // 无 scoped hash：附 route + 元素 class 关键词，供 agent 缩小范围
      meta.routeHint = {
        path:    location.pathname,
        hash:    location.hash,
        classes: el.className && typeof el.className === "string"
                   ? el.className.trim().split(/\s+/).slice(0, 6)  // 最多6个 class
                   : []
      };
    }
    return meta;
  },

  // 从 cssText 解析出 { prop: value } map
  _parseProps(cssText) {
    const m = cssText.match(/\{([^}]*)\}/);
    if (!m) return {};
    const props = {};
    m[1].split(";").forEach(decl => {
      const idx = decl.indexOf(":");
      if (idx < 0) return;
      const k = decl.slice(0, idx).trim();
      const v = decl.slice(idx + 1).trim();
      if (k) props[k] = v;
    });
    return props;
  },

  // ── Vue scoped：从 data-v-hash 反查源文件（开发环境）──────
  _vueSourceFile(sel) {
    const m = sel.match(/\[data-v-([0-9a-f]+)\]/);
    if (!m) return null;
    try {
      const el = document.querySelector(sel.split(/\s+/)[0]);
      if (!el) return null;
      let inst = el.__vueParentComponent;
      while (inst) {
        if (inst.type?.__file) return inst.type.__file;
        inst = inst.parent;
      }
    } catch (e) {}
    return null;
  },

  // ── 从元素直接查 Vue 源文件（用于 inline diff）──────────
  _elSourceFile(el) {
    try {
      let inst = el.__vueParentComponent;
      while (inst) {
        if (inst.type?.__file) return inst.type.__file;
        inst = inst.parent;
      }
    } catch (e) {}
    return null;
  },

  // ── 从元素快照当前 class（用于 Tailwind class diff）──────
  _elClass(el) {
    return el.className && typeof el.className === "string"
      ? el.className.trim()
      : null;
  },

  // ── Tailwind：判断 selector 是否为 utility class ──────────
  // 匹配 .mt-2 / .text-sm / .bg-[#fff] / .hover:text-white 等格式
  _isTailwindSel(sel) {
    return /^\.([-a-z0-9]+:)?[-a-z0-9]+(\[.+?\])?$/.test(sel.trim());
  },

  // ── 内部工具 ─────────────────────────────────────────────
  _sheetKey(sheet) {
    if (sheet.href) return sheet.href;
    const node = sheet.ownerNode;
    if (!node) return `__unknown_${Math.random()}`;
    if (node.id) return `#${node.id}`;
    const idx = Array.from(
      document.querySelectorAll("style,link[rel='stylesheet']")
    ).indexOf(node);
    return `__inline_${idx}`;
  },

  _elKey(el) {
    if (el.id) return `#${el.id}`;
    // 向上取 4 层祖先路径，避免多实例组件 key 碰撞
    const parts = [];
    let cur = el;
    for (let i = 0; i < 4 && cur && cur !== document.body; i++) {
      const parent = cur.parentElement || document.body;
      const idx    = Array.from(parent.children).indexOf(cur);
      const ptag   = parent === document.body ? "body" : parent.tagName.toLowerCase();
      parts.unshift(`${ptag}>${cur.tagName.toLowerCase()}:nth(${idx})`);
      cur = parent;
    }
    return parts.join("/");
  },

  _elLabel(el) {
    return el.tagName.toLowerCase()
      + (el.id        ? `#${el.id}` : "")
      + (el.className ? `.${[...el.classList].join(".")}` : "");
  },

  _sel(cssText) {
    const m = cssText.match(/^([^{]+)/);
    return m ? m[1].trim() : cssText;
  }
};