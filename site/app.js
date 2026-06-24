(function () {
  const state = {
    official: null,
    repos: [],
    currentRepo: "xllm",
    currentDate: "",
    currentMonth: null,
    activeFilter: "all",
    searchQuery: "",
    expanded: new Set(),
    lang: localStorage.getItem("xllm-report-lang") || "zh"
  };

  const I18N = {
    zh: {
      exportCsv: "导出 CSV",
      exportRange: "导出范围",
      officialReport: "官方研发洞察",
      heroTitle: "xLLM 代码贡献与特性演进洞察",
      heroLead: "先看官方仓库累计贡献规模和长期技术重心，再进入日期维度查看每日提交、模块变化和测试风险。",
      globalSummary: "累计总览",
      totalCommits: "累计提交",
      totalContributors: "贡献者",
      totalFiles: "累计变更文件",
      activeDays: "活跃天数",
      cumulativeModules: "累计热点模块",
      cumulativeModulesHint: "按全仓库提交归类统计",
      cumulativeContributors: "累计代码贡献",
      cumulativeContributorsHint: "按全仓库提交数统计",
      dailyAnalysis: "按日期分析",
      dailyAnalysisTitle: "选择活跃日期，查看当天变化",
      dailySummary: "当日摘要",
      commits: "提交",
      additions: "新增",
      deletions: "删除",
      filesChanged: "变更文件",
      activityLens: "活跃日期",
      activityLensHint: "选择一个日期查看当天提交",
      analysisCoverage: "分析覆盖率",
      dailyContributors: "当日贡献者",
      dailyContributorsHint: "当前日期提交分布",
      moduleDistribution: "模块分布",
      moduleDistributionHint: "当天热点模块分布",
      riskAndTest: "风险与测试",
      riskAndTestHint: "测试与高风险提交线索",
      commitWorkbench: "提交工作台",
      commitWorkbenchTitle: "提交记录与影响分析",
      emptyTitle: "没有找到提交",
      emptySubtitle: "请选择其他日期或调整筛选条件",
      searchPlaceholder: "搜索提交、作者、模块或 SHA...",
      noData: "暂无数据",
      days: "天",
      all: "全部",
      "needs-test": "需测试",
      "affects-ascend": "影响 Ascend",
      "high-risk": "高风险",
      feature: "特性",
      bugfix: "修复",
      refactor: "重构",
      performance: "性能",
      test: "测试",
      docs: "文档",
      chore: "工程",
      other: "其他",
      mediumRisk: "中风险",
      aiAnalysis: "AI 总结",
      testImpact: "测试影响",
      testUpdateNeeded: "需要测试跟进",
      ascendImpact: "Ascend 影响",
      commitsUnit: "次提交",
      noRisk: "当前日期未识别到高风险或需测试提交。",
      globalSummaryText: ({ repo, commits, contributors, firstDate, latestDate, additions, deletions, modules }) =>
        `${repo} main 分支累计 ${commits} 次提交，覆盖 ${contributors} 位贡献者，时间范围 ${firstDate} 至 ${latestDate}。累计代码变更 +${additions}/-${deletions} 行，长期热点集中在 ${modules || "暂无"}。`,
      dailySummaryText: ({ date, dayCommits, activity, module, highRisk, needsTest }) =>
        `${date} 当天共有 ${dayCommits} 次提交，主要活动为 ${activity}，热点模块为 ${module}。其中 ${highRisk} 个高风险变更，${needsTest} 个提交建议测试关注。`,
      analysisText: ({ author, type, repo, module, additions, deletions, files }) =>
        `${author} 向官方 ${repo} 提交了一个${type}变更。该提交归类到 ${module}，涉及 +${additions}/-${deletions} 行，覆盖 ${files} 个文件。`,
      testImpactNeeded: "该提交变更面较大或触及关键执行路径，建议补充回归测试、模块测试或端到端验证。",
      testImpactHighRisk: "该提交改动范围较大，建议执行冒烟测试和目标模块验证。",
      testImpactNone: "从当前元数据看，没有发现明确的测试缺口。",
      ascendAffected: "标题、模块或文件路径显示该提交可能影响 Ascend/NPU 执行路径。",
      ascendNotAffected: "从标题和文件路径看，没有发现直接 Ascend/NPU 信号。",
      weekdays: ["日", "一", "二", "三", "四", "五", "六"],
      monthLabel: (date) => `${date.getFullYear()} 年 ${date.getMonth() + 1} 月`
    },
    en: {
      exportCsv: "Export CSV",
      exportRange: "Export Range",
      officialReport: "Official Engineering Report",
      heroTitle: "xLLM Contribution and Feature Evolution Insights",
      heroLead: "Start with cumulative repository contribution and long-term technical focus, then inspect daily commits, module movement, and test risk.",
      globalSummary: "Cumulative Overview",
      totalCommits: "Total Commits",
      totalContributors: "Contributors",
      totalFiles: "Files Changed",
      activeDays: "Active Days",
      cumulativeModules: "Cumulative Hot Modules",
      cumulativeModulesHint: "Classified by all repository commits",
      cumulativeContributors: "Cumulative Code Contribution",
      cumulativeContributorsHint: "Ranked by repository commit count",
      dailyAnalysis: "Daily Analysis",
      dailyAnalysisTitle: "Select an active date to inspect changes",
      dailySummary: "Daily Summary",
      commits: "Commits",
      additions: "Additions",
      deletions: "Deletions",
      filesChanged: "Files Changed",
      activityLens: "Active Dates",
      activityLensHint: "Select a date to inspect daily commits",
      analysisCoverage: "Analysis Coverage",
      dailyContributors: "Daily Contributors",
      dailyContributorsHint: "Author distribution for selected date",
      moduleDistribution: "Module Distribution",
      moduleDistributionHint: "Hot modules on the selected day",
      riskAndTest: "Risk and Test",
      riskAndTestHint: "Testing and high-risk signals",
      commitWorkbench: "Commit Workbench",
      commitWorkbenchTitle: "Commit Records and Impact Analysis",
      emptyTitle: "No commits found",
      emptySubtitle: "Try selecting another date or adjusting filters",
      searchPlaceholder: "Search commits, authors, modules, or SHA...",
      noData: "No data",
      days: "days",
      all: "All",
      "needs-test": "Needs Test",
      "affects-ascend": "Affects Ascend",
      "high-risk": "High Risk",
      feature: "Feature",
      bugfix: "Bugfix",
      refactor: "Refactor",
      performance: "Performance",
      test: "Test",
      docs: "Docs",
      chore: "Chore",
      other: "Other",
      mediumRisk: "Medium Risk",
      aiAnalysis: "AI Summary",
      testImpact: "Test Impact",
      testUpdateNeeded: "Test Follow-up Needed",
      ascendImpact: "Ascend Impact",
      commitsUnit: "commits",
      noRisk: "No high-risk or test-follow-up commits detected for the selected date.",
      globalSummaryText: ({ repo, commits, contributors, firstDate, latestDate, additions, deletions, modules }) =>
        `${repo} main branch has ${commits} commits from ${contributors} contributors, covering ${firstDate} to ${latestDate}. Cumulative code change is +${additions}/-${deletions} lines, with long-running focus on ${modules || "n/a"}.`,
      dailySummaryText: ({ date, dayCommits, activity, module, highRisk, needsTest }) =>
        `${date} has ${dayCommits} commits. Main activity is ${activity}, and the hot module is ${module}. ${highRisk} high-risk changes and ${needsTest} commits are recommended for test attention.`,
      analysisText: ({ author, type, repo, module, additions, deletions, files }) =>
        `${author} submitted a ${type} change to official ${repo}. The change is classified under ${module}, with +${additions}/-${deletions} across ${files} files.`,
      testImpactNeeded: "This commit has a broad footprint or touches a critical execution path. Regression, module, or end-to-end validation is recommended.",
      testImpactHighRisk: "Large change footprint. Smoke tests and targeted module validation are recommended.",
      testImpactNone: "No explicit test gap was detected from the available metadata.",
      ascendAffected: "The title, module, or file paths indicate possible Ascend/NPU execution-path impact.",
      ascendNotAffected: "No direct Ascend/NPU signal was detected from the title and file paths.",
      weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      monthLabel: (date) => `${date.toLocaleString("en-US", { month: "long" })} ${date.getFullYear()}`
    }
  };

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const t = (key) => I18N[state.lang][key] || key;

  async function init() {
    const response = await fetch("./data/official-xllm.json");
    state.official = await response.json();
    state.repos = buildRepos();
    state.currentRepo = state.repos[0]?.id || "xllm";
    state.currentDate = latestDateForRepo(state.currentRepo);
    state.currentMonth = monthStart(state.currentDate || todayKey());
    bindEvents();
    setDefaultRange();
    applyLanguage();
    render();
  }

  function buildRepos() {
    const repo = state.official.repo;
    const events = (state.official.commits || []).map((commit) => ({
      sha: commit.sha,
      url: commit.url,
      type: commit.type || "other",
      date: commit.date,
      dateKey: commit.dateKey,
      message: commit.title,
      body: commit.pr ? `PR #${commit.pr}` : `commit ${commit.sha}`,
      author: commit.author?.name || "unknown",
      repo: repo.fullName,
      repoLabel: repo.name,
      additions: commit.additions || 0,
      deletions: commit.deletions || 0,
      files: commit.filesChanged || 0,
      fileList: commit.files || [],
      moduleName: commit.module || "Other",
      tags: commit.tags || [],
      needsTest: shouldNeedTest(commit),
      ascendAffected: (commit.tags || []).includes("affects-ascend")
    }));
    return [{ id: repo.id, label: repo.name, events }];
  }

  function shouldNeedTest(commit) {
    if ((commit.tags || []).includes("high-risk")) return true;
    if (["performance", "bugfix", "feature"].includes(commit.type) && ((commit.additions || 0) + (commit.deletions || 0) >= 300)) return true;
    return /npu|graph|decode|moe|scheduler|cache|model/i.test(`${commit.title} ${commit.module}`) && (commit.filesChanged || 0) >= 5;
  }

  function bindEvents() {
    $("#repoTabs").addEventListener("click", (event) => {
      const tab = event.target.closest(".repo-tab");
      if (!tab) return;
      state.currentRepo = tab.dataset.repo;
      state.currentDate = latestDateForRepo(state.currentRepo);
      state.currentMonth = monthStart(state.currentDate || todayKey());
      state.activeFilter = "all";
      state.searchQuery = "";
      $("#searchInput").value = "";
      setDefaultRange();
      render();
    });

    $("#dateBar").addEventListener("click", (event) => {
      const cell = event.target.closest(".calendar-cell.has-data");
      if (cell?.dataset.date) {
        state.currentDate = cell.dataset.date;
        state.currentMonth = monthStart(cell.dataset.date);
        render();
        return;
      }
      const nav = event.target.closest(".date-nav");
      if (nav && !nav.disabled) {
        state.currentMonth = nav.dataset.month;
        renderDateBar();
      }
    });

    $$(".filter-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        state.activeFilter = chip.dataset.filter;
        render();
      });
    });

    $$(".lang-btn").forEach((button) => {
      button.addEventListener("click", () => {
        state.lang = button.dataset.lang;
        localStorage.setItem("xllm-report-lang", state.lang);
        applyLanguage();
        render();
      });
    });

    $("#searchInput").addEventListener("input", (event) => {
      state.searchQuery = event.target.value.trim().toLowerCase();
      render();
    });

    $("#commitList").addEventListener("click", (event) => {
      const header = event.target.closest(".commit-header");
      if (!header) return;
      const card = header.closest(".commit-card");
      const sha = card.dataset.sha;
      if (state.expanded.has(sha)) state.expanded.delete(sha);
      else state.expanded.add(sha);
      card.classList.toggle("expanded", state.expanded.has(sha));
    });

    $("#exportBtn").addEventListener("click", exportCsv);
  }

  function applyLanguage() {
    document.documentElement.lang = state.lang === "zh" ? "zh-CN" : "en";
    $$("[data-i18n]").forEach((node) => {
      node.textContent = t(node.dataset.i18n);
    });
    $$(".lang-btn").forEach((button) => {
      button.classList.toggle("active", button.dataset.lang === state.lang);
    });
    $("#searchInput").placeholder = t("searchPlaceholder");
  }

  function render() {
    renderRepoTabs();
    renderGlobalOverview();
    renderDateBar();
    const dayEvents = eventsForCurrentDate();
    renderDailyInsights(dayEvents);
    renderDailySummary(dayEvents);
    renderDailyStats(dayEvents);
    updateFilterChips(dayEvents);
    renderCommitList(filterEvents(dayEvents));
  }

  function renderRepoTabs() {
    $("#repoTabs").innerHTML = state.repos.map((repo) => `
      <button class="repo-tab ${repo.id === state.currentRepo ? "active" : ""}" data-repo="${escapeAttr(repo.id)}">${escapeHtml(repo.label)}</button>
    `).join("");
  }

  function renderGlobalOverview() {
    const summary = state.official.summary;
    const dates = datesForCurrentRepo();
    const topModules = (summary.topModules || []).slice(0, 3).map((item) => `${moduleLabel(item.key)} ${item.count}`).join(", ");

    $("#globalSummaryText").textContent = t("globalSummaryText")({
      repo: state.official.repo.fullName,
      commits: summary.commits.toLocaleString(),
      contributors: summary.contributors.toLocaleString(),
      firstDate: summary.firstDate,
      latestDate: summary.latestDate,
      additions: summary.additions.toLocaleString(),
      deletions: summary.deletions.toLocaleString(),
      modules: topModules
    });
    $("#globalTotalCommits").textContent = summary.commits.toLocaleString();
    $("#globalContributors").textContent = summary.contributors.toLocaleString();
    $("#globalFiles").textContent = summary.filesChanged.toLocaleString();
    $("#globalDays").textContent = dates.length.toLocaleString();
    renderGlobalModules(summary.topModules || []);
    renderGlobalContributors(summary.topAuthors || []);
  }

  function renderGlobalModules(modules) {
    const max = modules[0]?.count || 1;
    $("#globalModuleList").innerHTML = modules.slice(0, 6).map((item, index) => rankRow({
      rank: index + 1,
      label: moduleLabel(item.key),
      value: `${item.count}`,
      percent: item.count / max * 100
    })).join("") || emptyLine();
  }

  function renderGlobalContributors(authors) {
    const max = authors[0]?.commits || 1;
    $("#globalContributorList").innerHTML = authors.slice(0, 6).map((item, index) => rankRow({
      rank: index + 1,
      label: item.name,
      value: `${item.commits} ${t("commitsUnit")}`,
      percent: item.commits / max * 100
    })).join("") || emptyLine();
  }

  function renderDateBar() {
    const month = state.currentMonth || monthStart(state.currentDate || todayKey());
    const [year, mon] = month.split("-").map(Number);
    const first = new Date(year, mon - 1, 1);
    const last = new Date(year, mon, 0);
    const available = new Set(datesForCurrentRepo());
    const current = state.currentDate;
    const today = todayKey();
    const prev = shiftMonth(month, -1);
    const next = shiftMonth(month, 1);

    let html = `<div class="calendar-header">
      <button class="date-nav" data-month="${prev}" aria-label="Previous month">&lt;</button>
      <span class="month-label">${t("monthLabel")(first)}</span>
      <button class="date-nav" data-month="${next}" aria-label="Next month">&gt;</button>
    </div><div class="calendar-grid">`;

    for (const day of t("weekdays")) {
      html += `<div class="calendar-weekday">${escapeHtml(day)}</div>`;
    }
    for (let i = 0; i < first.getDay(); i++) {
      html += `<div class="calendar-cell empty"></div>`;
    }
    for (let d = 1; d <= last.getDate(); d++) {
      const key = `${year}-${String(mon).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const classes = ["calendar-cell"];
      if (available.has(key)) classes.push("has-data", "has-analysis");
      else classes.push("no-data");
      if (key === current) classes.push("active");
      if (key === today) classes.push("today");
      html += `<div class="${classes.join(" ")}" data-date="${key}">${d}</div>`;
    }
    html += "</div>";
    $("#dateBar").innerHTML = html;
  }

  function renderDailyInsights(events) {
    const dates = datesForCurrentRepo();
    const total = dates.length;
    $("#coverageBar").innerHTML = total
      ? `<div class="coverage-track"><div class="coverage-fill" style="width:100%"></div></div><span class="coverage-text">${total}/${total} ${t("days")}</span>`
      : `<span class="coverage-text">${t("noData")}</span>`;
    renderContributorList(events);
    renderModuleList(events);
    renderRiskList(events);
  }

  function renderContributorList(events) {
    const authors = countBy(events, (event) => event.author).slice(0, 6);
    const max = authors[0]?.count || 1;
    $("#contributorList").innerHTML = authors.map((item, index) => rankRow({
      rank: index + 1,
      label: item.key,
      value: `${item.count} ${t("commitsUnit")}`,
      percent: item.count / max * 100
    })).join("") || emptyLine();
  }

  function renderModuleList(events) {
    const modules = countBy(events, (event) => event.moduleName).slice(0, 6);
    const max = modules[0]?.count || 1;
    $("#heatmapBar").innerHTML = modules.map((item, index) => rankRow({
      rank: index + 1,
      label: moduleLabel(item.key),
      value: `${item.count}`,
      percent: item.count / max * 100
    })).join("") || emptyLine();
  }

  function renderRiskList(events) {
    const riskItems = [
      { type: t("needs-test"), count: events.filter((event) => event.needsTest).length },
      { type: t("high-risk"), count: events.filter((event) => event.tags.includes("high-risk")).length },
      { type: t("affects-ascend"), count: events.filter((event) => event.ascendAffected).length }
    ].filter((item) => item.count > 0);

    $("#riskList").innerHTML = riskItems.length
      ? riskItems.map((item) => `<div class="risk-pill"><span>${escapeHtml(item.type)}</span><strong>${item.count}</strong></div>`).join("")
      : `<div class="empty-line">${escapeHtml(t("noRisk"))}</div>`;
  }

  function rankRow({ rank, label, value, percent }) {
    return `<div class="rank-row">
      <span class="rank-no">${rank}</span>
      <div class="rank-main">
        <div class="rank-line">
          <span class="rank-label">${escapeHtml(label)}</span>
          <span class="rank-value">${escapeHtml(value)}</span>
        </div>
        <div class="rank-track"><div class="rank-fill" style="width:${Math.max(8, Math.round(percent))}%"></div></div>
      </div>
    </div>`;
  }

  function emptyLine() {
    return `<div class="empty-line">${escapeHtml(t("noData"))}</div>`;
  }

  function renderDailySummary(events) {
    const generated = state.official.dailySummaries?.[state.currentDate]?.[state.lang] ||
      state.official.dailySummaries?.[state.currentDate]?.zh ||
      state.official.dailySummaries?.[state.currentDate]?.en;
    if (generated) {
      $("#summaryText").textContent = generated;
      return;
    }

    const topModule = countBy(events, (event) => event.moduleName)[0]?.key || "Other";
    const topFeature = countBy(events, (event) => event.type)[0]?.key || "other";
    const highRisk = events.filter((event) => event.tags.includes("high-risk")).length;
    const needsTest = events.filter((event) => event.needsTest).length;
    $("#summaryText").textContent = t("dailySummaryText")({
      date: state.currentDate,
      dayCommits: events.length,
      activity: typeLabel(topFeature),
      module: moduleLabel(topModule),
      highRisk,
      needsTest
    });
  }

  function renderDailyStats(events) {
    $("#statCommits").textContent = events.length;
    $("#statAdditions").textContent = `+${sum(events, "additions").toLocaleString()}`;
    $("#statDeletions").textContent = `-${sum(events, "deletions").toLocaleString()}`;
    $("#statFiles").textContent = sum(events, "files").toLocaleString();
  }

  function updateFilterChips(events) {
    $$(".filter-chip").forEach((chip) => {
      const filter = chip.dataset.filter;
      const count = filter === "all" ? events.length : events.filter((event) => matchesFilter(event, filter)).length;
      chip.classList.toggle("active", filter === state.activeFilter);
      chip.textContent = `${filterLabel(filter)} (${count})`;
    });
  }

  function renderCommitList(events) {
    if (!events.length) {
      $("#emptyState").style.display = "block";
      $("#commitList").innerHTML = "";
      return;
    }
    $("#emptyState").style.display = "none";
    $("#commitList").innerHTML = events
      .sort((a, b) => riskScore(b) - riskScore(a) || new Date(b.date) - new Date(a.date))
      .map(renderCommitCard)
      .join("");
  }

  function renderCommitCard(commit) {
    const expanded = state.expanded.has(commit.sha);
    const classes = ["commit-card"];
    if (commit.tags.includes("high-risk")) classes.push("high-risk");
    if (commit.tags.length) classes.push("has-analysis");
    const title = commit.message || commit.url || commit.sha;
    return `<div class="${classes.join(" ")} ${expanded ? "expanded" : ""}" data-sha="${escapeAttr(commit.sha)}">
      <div class="commit-header">
        <span class="expand-arrow">&gt;</span>
        <a class="commit-sha" href="${escapeAttr(commit.url)}" target="_blank" rel="noreferrer">${escapeHtml(shortSha(commit.sha))}</a>
        <div class="commit-message">
          <div class="commit-title">${highlight(title, state.searchQuery)}</div>
          <div class="commit-body">${escapeHtml(commit.body || `${typeLabel(commit.type)} / ${commit.repoLabel}`)}</div>
        </div>
        <div class="tag-list">${commit.tags.map((tag) => `<span class="${tagClass(tag)}">${escapeHtml(tagLabel(tag))}</span>`).join("")}</div>
        <div class="commit-meta">
          <span class="commit-author">${escapeHtml(commit.author)}</span>
          <span class="commit-time">${timeLabel(commit.date)}</span>
          <span class="stat-badge additions">+${commit.additions}</span>
          <span class="stat-badge deletions">-${commit.deletions}</span>
          <span class="stat-badge files">${commit.files}f</span>
        </div>
      </div>
      <div class="analysis-section">
        <div class="ai-comment">
          <div class="ai-label">${escapeHtml(t("aiAnalysis"))}</div>
          ${escapeHtml(commitAiSummary(commit))}
        </div>
        <div class="impact-card ${commit.needsTest ? "test-impact" : ""}">
          <div class="impact-label ${commit.needsTest ? "needs-test" : ""}">${escapeHtml(commit.needsTest ? t("testUpdateNeeded") : t("testImpact"))}</div>
          <div class="impact-text">${escapeHtml(testImpactText(commit))}</div>
        </div>
        <div class="impact-card ascend-impact">
          <div class="impact-label ascend">${escapeHtml(t("ascendImpact"))}</div>
          <div class="impact-text">${escapeHtml(ascendImpactText(commit))}</div>
        </div>
      </div>
    </div>`;
  }

  function eventsForCurrentDate() {
    return eventsForCurrentRepo().filter((event) => event.dateKey === state.currentDate);
  }

  function eventsForCurrentRepo() {
    return state.repos.find((repo) => repo.id === state.currentRepo)?.events || [];
  }

  function filterEvents(events) {
    return events.filter((event) => {
      const q = state.searchQuery;
      const matchesSearch = !q ||
        event.message.toLowerCase().includes(q) ||
        event.author.toLowerCase().includes(q) ||
        event.sha.toLowerCase().includes(q) ||
        event.repoLabel.toLowerCase().includes(q) ||
        event.moduleName.toLowerCase().includes(q);
      return matchesSearch && matchesFilter(event, state.activeFilter);
    });
  }

  function matchesFilter(event, filter) {
    if (filter === "all") return true;
    if (filter === "needs-test") return event.needsTest;
    if (filter === "affects-ascend") return event.ascendAffected;
    return event.tags.includes(filter);
  }

  function exportCsv() {
    const start = $("#rangeStart").value;
    const end = $("#rangeEnd").value;
    const rows = eventsForCurrentRepo().filter((event) => (!start || event.dateKey >= start) && (!end || event.dateKey <= end));
    const header = ["date", "repo", "sha", "type", "author", "title", "module", "tags", "additions", "deletions", "files", "url"];
    const csv = [header, ...rows.map((event) => [
      event.dateKey, event.repoLabel, event.sha, event.type, event.author, event.message, event.moduleName,
      event.tags.join("|"), event.additions, event.deletions, event.files, event.url
    ])].map((line) => line.map(csvCell).join(",")).join("\n");
    const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${currentRepoLabel().replace(/[^\w.-]+/g, "-")}-${start || "start"}-${end || "end"}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function setDefaultRange() {
    const dates = datesForCurrentRepo();
    const end = dates.at(-1) || todayKey();
    const start = dates[Math.max(0, dates.length - 7)] || end;
    $("#rangeStart").value = start;
    $("#rangeEnd").value = end;
  }

  function datesForCurrentRepo() {
    return [...new Set(eventsForCurrentRepo().map((event) => event.dateKey).filter(Boolean))].sort();
  }

  function latestDateForRepo(repoId) {
    const repo = state.repos.find((item) => item.id === repoId);
    const usefulDates = [...new Set((repo?.events || [])
      .filter((event) => event.additions || event.deletions || event.files)
      .map((event) => event.dateKey)
      .filter(Boolean))]
      .sort();
    if (usefulDates.length) return usefulDates.at(-1);
    const dates = [...new Set((repo?.events || []).map((event) => event.dateKey).filter(Boolean))].sort();
    return dates.at(-1) || "";
  }

  function currentRepoLabel() {
    return state.repos.find((repo) => repo.id === state.currentRepo)?.label || "xllm";
  }

  function commitAiSummary(commit) {
    const generated = commit.aiSummary?.[state.lang] || commit.aiSummary?.zh || commit.aiSummary?.en;
    if (generated) return generated;

    const title = normalizeTitle(commit.message);
    const type = typeLabel(commit.type);
    const module = moduleLabel(commit.moduleName);
    const files = commit.fileList || [];
    const mainFiles = summarizeFiles(files);
    const scale = changeScale(commit);
    const testHint = commit.needsTest
      ? (state.lang === "zh" ? "建议优先补充回归或目标模块验证。" : "Prioritize regression or targeted module validation.")
      : (state.lang === "zh" ? "从变更规模看可按常规验证处理。" : "The change can follow normal validation based on its footprint.");
    const ascendHint = commit.ascendAffected
      ? (state.lang === "zh" ? "同时需要关注 Ascend/NPU 执行路径。" : "Also watch the Ascend/NPU execution path.")
      : "";

    if (state.lang === "en") {
      return `${commit.author} made a ${scale} ${type.toLowerCase()} change in ${module}: ${title}. It touches ${commit.files} files with +${commit.additions}/-${commit.deletions} lines. Main files: ${mainFiles}. ${testHint} ${ascendHint}`.trim();
    }
    return `${commit.author} 本次提交是一个${scale}的${type}变更，核心内容是：${title}。该变更归入 ${module}，涉及 ${commit.files} 个文件、+${commit.additions}/-${commit.deletions} 行；主要文件范围：${mainFiles}。${testHint}${ascendHint ? ` ${ascendHint}` : ""}`;
  }

  function normalizeTitle(title) {
    return String(title || "")
      .replace(/\s*\(#\d+\)\s*$/, "")
      .replace(/^(feat|fix|bugfix|perf|refactor|docs|test|chore|build|ci)\s*:\s*/i, "")
      .replace(/[.。]\s*$/, "")
      .trim() || (state.lang === "zh" ? "未提供提交标题" : "no commit title provided");
  }

  function summarizeFiles(files) {
    const names = files
      .map((file) => file.filename || "")
      .filter(Boolean)
      .slice(0, 3);
    if (!names.length) return state.lang === "zh" ? "未记录具体文件" : "no file paths recorded";
    const suffix = files.length > names.length
      ? (state.lang === "zh" ? ` 等 ${files.length} 个文件` : ` and ${files.length - names.length} more`)
      : "";
    return `${names.join(", ")}${suffix}`;
  }

  function changeScale(commit) {
    const churn = commit.additions + commit.deletions;
    if (state.lang === "en") {
      if (commit.tags.includes("high-risk") || churn >= 1500 || commit.files >= 20) return "large-scope";
      if (commit.tags.includes("medium-risk") || churn >= 300 || commit.files >= 8) return "medium-scope";
      return "focused";
    }
    if (commit.tags.includes("high-risk") || churn >= 1500 || commit.files >= 20) return "大范围";
    if (commit.tags.includes("medium-risk") || churn >= 300 || commit.files >= 8) return "中等范围";
    return "聚焦";
  }

  function testImpactText(commit) {
    if (commit.needsTest) return t("testImpactNeeded");
    if (commit.tags.includes("high-risk")) return t("testImpactHighRisk");
    return t("testImpactNone");
  }

  function ascendImpactText(commit) {
    return commit.ascendAffected ? t("ascendAffected") : t("ascendNotAffected");
  }

  function typeLabel(type) {
    return t(type);
  }

  function filterLabel(filter) {
    return t(filter);
  }

  function tagLabel(tag) {
    if (tag === "medium-risk") return t("mediumRisk");
    if (tag === "spec-decode") return moduleLabel("Spec Decode");
    if (tag === "graph-runtime") return moduleLabel("Graph / Runtime");
    if (tag === "npu-backend") return moduleLabel("NPU Backend");
    if (tag === "model-support") return moduleLabel("Model Support");
    if (tag === "inference-engine") return moduleLabel("Inference Engine");
    if (tag === "device-backend") return moduleLabel("Device Backend");
    return t(tag) || tag;
  }

  function moduleLabel(module) {
    if (state.lang === "en") return module;
    return {
      "Spec Decode": "推测解码",
      "Graph / Runtime": "图编译 / 运行时",
      "NPU Backend": "NPU 后端",
      "Model Support": "模型支持",
      "Inference Engine": "推理引擎",
      "Device Backend": "设备后端",
      "Testing": "测试",
      "Engineering": "工程配置",
      "MoE": "MoE",
      "Other": "其他"
    }[module] || module;
  }

  function countBy(items, keyFn) {
    const counts = new Map();
    for (const item of items) {
      const key = keyFn(item);
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    return [...counts.entries()].map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count);
  }

  function sum(items, field) {
    return items.reduce((total, item) => total + (item[field] || 0), 0);
  }

  function shortSha(sha) {
    return /^[0-9a-f]{8,}/i.test(sha) ? sha.slice(0, 8) : sha;
  }

  function dayKey(value) {
    if (!value) return "";
    const date = new Date(value);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  function todayKey() {
    return dayKey(new Date());
  }

  function monthStart(dateKey) {
    return dateKey.slice(0, 7);
  }

  function shiftMonth(monthKey, offset) {
    const [year, month] = monthKey.split("-").map(Number);
    const date = new Date(year, month - 1 + offset, 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  }

  function timeLabel(value) {
    if (!value) return "--";
    return new Date(value).toLocaleTimeString(state.lang === "zh" ? "zh-CN" : "en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
  }

  function tagClass(tag) {
    if (tag === "high-risk") return "tag risk-high";
    if (tag === "medium-risk") return "tag risk-medium";
    if (["feature", "bugfix", "refactor", "performance"].includes(tag)) return `tag type-${tag}`;
    return "tag";
  }

  function riskScore(event) {
    return (event.tags.includes("high-risk") ? 100 : 0)
      + (event.needsTest ? 40 : 0)
      + Math.min(30, Math.floor((event.additions + event.deletions) / 100))
      + Math.min(20, event.files);
  }

  function highlight(text, query) {
    const safe = escapeHtml(text);
    if (!query) return safe;
    return safe.replace(new RegExp(`(${escapeRegExp(query)})`, "gi"), "<mark>$1</mark>");
  }

  function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function csvCell(value) {
    return `"${String(value ?? "").replaceAll('"', '""')}"`;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function escapeAttr(value) {
    return escapeHtml(value).replaceAll("'", "&#39;");
  }

  init().catch((error) => {
    document.body.innerHTML = `<pre>${escapeHtml(error.stack || error.message)}</pre>`;
  });
})();
