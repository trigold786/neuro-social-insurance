import logging
import os
import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional
from pathlib import Path

logger = logging.getLogger(__name__)

REPORTS_DIR = Path("/tmp/nsi-reports")
REPORTS_DIR.mkdir(parents=True, exist_ok=True)


def _format_currency(amount: float) -> str:
    return f"¥{amount:,.2f}"


def _build_html(profile: Dict[str, Any], calc_results: Dict[str, Any], report_type: str) -> str:
    region = profile.get("current_region", "N/A")
    employment = profile.get("employment_type", "N/A")
    age = profile.get("age", "N/A")
    gender = profile.get("gender", "N/A")
    strategies = calc_results.get("strategies", [])
    recommendation = calc_results.get("recommendation", "balanced")
    generated_at = datetime.now().strftime("%Y-%m-%d %H:%M")

    strategy_rows = ""
    for s in strategies:
        strategy_rows += f"""
        <tr class="{s.get('strategy', '')}">
            <td class="strategy-name">{_strategy_label(s.get('strategy', ''))}</td>
            <td>{_format_currency(s.get('total_invested', 0))}</td>
            <td>{_format_currency(s.get('monthly_pension_estimate', 0))}</td>
            <td>{s.get('break_even_age', 'N/A')}</td>
            <td>{(s.get('irr', 0) * 100):.2f}%</td>
            <td>{_format_currency(s.get('total_benefit', 0))}</td>
        </tr>"""

    cashflow_rows = ""
    for cf in calc_results.get("cashflows", [])[:20]:
        cashflow_rows += f"""
        <tr>
            <td>{cf.get('year', '-')}</td>
            <td>{cf.get('age', '-')}</td>
            <td>{cf.get('type', '-')}</td>
            <td class="{'negative' if cf.get('type') == 'contribution' else 'positive'}">{_format_currency(cf.get('amount', 0))}</td>
            <td>{_format_currency(cf.get('cumulative', 0))}</td>
        </tr>"""

    return f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>NSI 社保规划报告</title>
<style>
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  body {{ font-family: 'JetBrains Mono', 'Noto Sans SC', 'DejaVu Sans', monospace; background: #0d1117; color: #c9d1d9; font-size: 12px; line-height: 1.6; }}
  .page {{ max-width: 800px; margin: 0 auto; padding: 40px 32px; }}
  .header {{ border-bottom: 2px solid #00d4aa; padding-bottom: 20px; margin-bottom: 32px; }}
  .header h1 {{ color: #00d4aa; font-size: 22px; letter-spacing: 2px; }}
  .header .subtitle {{ color: #8b949e; font-size: 11px; margin-top: 6px; }}
  .meta-grid {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px; }}
  .meta-card {{ background: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 14px; }}
  .meta-card .label {{ color: #8b949e; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; }}
  .meta-card .value {{ color: #e6edf3; font-size: 16px; font-weight: bold; margin-top: 4px; }}
  .section {{ margin-bottom: 32px; }}
  .section-title {{ color: #f0b429; font-size: 13px; letter-spacing: 1px; border-left: 3px solid #f0b429; padding-left: 10px; margin-bottom: 16px; }}
  table {{ width: 100%; border-collapse: collapse; background: #161b22; border-radius: 6px; overflow: hidden; }}
  th {{ background: #1c2128; color: #8b949e; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; padding: 10px 12px; text-align: left; }}
  td {{ padding: 10px 12px; border-top: 1px solid #21262d; color: #c9d1d9; }}
  tr:hover td {{ background: #1c2128; }}
  .positive {{ color: #3fb950; }}
  .negative {{ color: #f85149; }}
  .conservative .strategy-name {{ color: #58a6ff; }}
  .balanced .strategy-name {{ color: #3fb950; }}
  .aggressive .strategy-name {{ color: #f0b429; }}
  .rec-badge {{ display: inline-block; background: #238636; color: #fff; padding: 2px 8px; border-radius: 10px; font-size: 10px; margin-left: 8px; }}
  .footer {{ border-top: 1px solid #30363d; padding-top: 20px; margin-top: 40px; color: #6e7681; font-size: 10px; }}
  .disclaimer {{ background: #161b22; border: 1px solid #30363d; padding: 12px; border-radius: 6px; margin-top: 12px; }}
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <h1>🛡️ NSI 社保定制速算器</h1>
    <div class="subtitle">个人养老规划报告 &nbsp;|&nbsp; Generated: {generated_at} &nbsp;|&nbsp; Report ID: {uuid.uuid4().hex[:12].upper()}</div>
  </div>

  <div class="meta-grid">
    <div class="meta-card">
      <div class="label">当前地区</div>
      <div class="value">{region}</div>
    </div>
    <div class="meta-card">
      <div class="label">就业类型</div>
      <div class="value">{employment.replace('_', ' ')}</div>
    </div>
    <div class="meta-card">
      <div class="label">年龄 / 性别</div>
      <div class="value">{age}岁 / {gender or 'N/A'}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">📊 三套方案对比</div>
    <table>
      <thead>
        <tr>
          <th>方案</th>
          <th>累计缴纳</th>
          <th>预估月养老金</th>
          <th>回本年龄</th>
          <th>IRR</th>
          <th>总待遇</th>
        </tr>
      </thead>
      <tbody>{strategy_rows}</tbody>
    </table>
    <p style="color: #8b949e; font-size: 11px; margin-top: 10px;">
      ★ 推荐方案: <strong style="color: #3fb950;">{_strategy_label(recommendation)}</strong>
    </p>
  </div>

  {"<div class=\"section\"><div class=\"section-title\">💰 现金流模拟（前20年）</div><table><thead><tr><th>年度</th><th>年龄</th><th>类型</th><th>金额</th><th>累计</th></tr></thead><tbody>" + cashflow_rows + "</tbody></table></div>" if cashflow_rows else ""}

  <div class="footer">
    <div class="disclaimer">
      ⚠️ <strong>免责声明</strong>：本报告仅供参考，不构成任何投资建议。养老金计算基于现行社保政策，实际待遇以当地社保局最终核算为准。数据来源：国家人力资源和社会保障部。报告生成时间：{generated_at}。
    </div>
  </div>
</div>
</body>
</html>"""


def _strategy_label(strategy: str) -> str:
    labels = {
        "conservative": "保守型",
        "balanced": "平衡型",
        "aggressive": "进取型",
    }
    return labels.get(strategy, strategy)


def generate_report_pdf(
    profile: Dict[str, Any],
    calc_results: Dict[str, Any],
    report_type: str,
) -> str:
    try:
        from weasyprint import HTML
    except ImportError:
        raise RuntimeError("weasyprint not installed — run: pip install weasyprint>=60.0")

    html_content = _build_html(profile, calc_results, report_type)
    filename = f"report_{uuid.uuid4().hex}.pdf"
    filepath = REPORTS_DIR / filename

    try:
        HTML(string=html_content).write_pdf(str(filepath))
    except Exception as exc:
        logger.exception("WeasyPrint PDF generation failed")
        raise RuntimeError(f"PDF generation failed: {exc}") from exc

    return str(filepath)


def get_report_url(task_id: str) -> str:
    return f"/reports/download/{task_id}"
